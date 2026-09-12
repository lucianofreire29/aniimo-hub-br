import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não encontrada. Configure o .env.local antes de executar.");
  }

  const sql = neon(databaseUrl);

  console.log("1/4 Verificando dependências do schema...");
  const dependencies = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('fontes', 'patches')
  `);

  const dependencyNames = new Set(dependencies.map((row) => row.table_name));
  for (const table of ["fontes", "patches"]) {
    if (!dependencyNames.has(table)) {
      throw new Error(`Tabela obrigatória ausente: ${table}.`);
    }
  }

  console.log("2/4 Criando tabelas de itens, se necessário...");

  await sql.query(`
    CREATE TABLE IF NOT EXISTS item_categorias (
      id BIGSERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      nome_pt_br VARCHAR(100),
      slug VARCHAR(110) NOT NULL UNIQUE,
      descricao TEXT,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT item_categorias_nome_key UNIQUE (nome)
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS itens (
      id BIGSERIAL PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      nome_pt_br VARCHAR(150),
      slug VARCHAR(160) NOT NULL UNIQUE,
      descricao TEXT,
      descricao_pt_br TEXT,
      categoria_id BIGINT REFERENCES item_categorias(id) ON DELETE SET NULL,
      imagem_url TEXT,
      fonte_id BIGINT REFERENCES fontes(id) ON DELETE SET NULL,
      patch_introducao_id BIGINT REFERENCES patches(id) ON DELETE SET NULL,
      ultima_verificacao TIMESTAMPTZ,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  console.log("3/4 Criando índices...");
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_itens_nome ON itens(nome)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_itens_categoria ON itens(categoria_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_itens_ativo ON itens(ativo)`);

  console.log("4/4 Validando o schema...");
  const tables = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('item_categorias', 'itens')
     ORDER BY table_name
  `);

  if (tables.length !== 2) {
    throw new Error("O schema de itens não foi criado corretamente.");
  }

  const [categoryCount] = await sql.query(`SELECT COUNT(*)::int AS total FROM item_categorias`);
  const [itemCount] = await sql.query(`SELECT COUNT(*)::int AS total FROM itens`);

  console.log(`   item_categorias: ${categoryCount.total} linhas`);
  console.log(`   itens: ${itemCount.total} linhas`);
  console.log("\nSchema de itens pronto para receber dados oficiais.");
}

main().catch((error) => {
  console.error("\nFalha ao preparar o schema de itens:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
