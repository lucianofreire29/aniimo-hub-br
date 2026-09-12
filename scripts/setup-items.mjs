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

  console.log("1/7 Verificando dependências do schema...");
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

  console.log("2/7 Criando tabelas-base de itens, se necessário...");

  await sql.query(`
    CREATE TABLE IF NOT EXISTS item_categorias (
      id BIGSERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      nome_pt_br VARCHAR(100),
      slug VARCHAR(110) NOT NULL UNIQUE,
      descricao TEXT,
      descricao_pt_br TEXT,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT item_categorias_nome_key UNIQUE (nome)
    )
  `);

  await sql.query(`
    ALTER TABLE item_categorias
      ADD COLUMN IF NOT EXISTS descricao_pt_br TEXT
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
      raridade VARCHAR(40),
      qualidade VARCHAR(40),
      cp INTEGER,
      empilhavel BOOLEAN,
      fonte_id BIGINT REFERENCES fontes(id) ON DELETE SET NULL,
      patch_introducao_id BIGINT REFERENCES patches(id) ON DELETE SET NULL,
      ultima_verificacao TIMESTAMPTZ,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await sql.query(`
    ALTER TABLE itens
      ADD COLUMN IF NOT EXISTS raridade VARCHAR(40),
      ADD COLUMN IF NOT EXISTS qualidade VARCHAR(40),
      ADD COLUMN IF NOT EXISTS cp INTEGER,
      ADD COLUMN IF NOT EXISTS empilhavel BOOLEAN
  `);

  console.log("3/7 Criando rastreabilidade por item...");

  await sql.query(`
    CREATE TABLE IF NOT EXISTS item_fontes (
      id BIGSERIAL PRIMARY KEY,
      item_id BIGINT NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      fonte_id BIGINT NOT NULL REFERENCES fontes(id) ON DELETE CASCADE,
      patch_id BIGINT REFERENCES patches(id) ON DELETE SET NULL,
      escopo VARCHAR(80),
      observacoes TEXT,
      principal BOOLEAN NOT NULL DEFAULT FALSE,
      verificado_em TIMESTAMPTZ,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT item_fontes_item_fonte_patch_escopo_key
        UNIQUE NULLS NOT DISTINCT (item_id, fonte_id, patch_id, escopo)
    )
  `);

  console.log("4/7 Criando obtenções e conteúdos...");

  await sql.query(`
    CREATE TABLE IF NOT EXISTS item_obtencoes (
      id BIGSERIAL PRIMARY KEY,
      item_id BIGINT NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      tipo VARCHAR(60) NOT NULL,
      titulo VARCHAR(180),
      descricao TEXT,
      local_nome VARCHAR(180),
      npc_nome VARCHAR(180),
      requisito TEXT,
      quantidade_min INTEGER,
      quantidade_max INTEGER,
      custo_quantidade NUMERIC(14, 2),
      moeda_item_id BIGINT REFERENCES itens(id) ON DELETE SET NULL,
      chance_percentual NUMERIC(7, 4),
      fonte_id BIGINT REFERENCES fontes(id) ON DELETE SET NULL,
      patch_id BIGINT REFERENCES patches(id) ON DELETE SET NULL,
      verificado_em TIMESTAMPTZ,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT item_obtencoes_quantidades_validas CHECK (
        (quantidade_min IS NULL OR quantidade_min >= 0)
        AND (quantidade_max IS NULL OR quantidade_max >= 0)
        AND (quantidade_min IS NULL OR quantidade_max IS NULL OR quantidade_max >= quantidade_min)
      ),
      CONSTRAINT item_obtencoes_chance_valida CHECK (
        chance_percentual IS NULL OR (chance_percentual >= 0 AND chance_percentual <= 100)
      )
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS item_conteudos (
      id BIGSERIAL PRIMARY KEY,
      item_origem_id BIGINT NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      item_conteudo_id BIGINT NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      quantidade_min INTEGER,
      quantidade_max INTEGER,
      chance_percentual NUMERIC(7, 4),
      condicao TEXT,
      fonte_id BIGINT REFERENCES fontes(id) ON DELETE SET NULL,
      patch_id BIGINT REFERENCES patches(id) ON DELETE SET NULL,
      verificado_em TIMESTAMPTZ,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT item_conteudos_itens_diferentes CHECK (item_origem_id <> item_conteudo_id),
      CONSTRAINT item_conteudos_quantidades_validas CHECK (
        (quantidade_min IS NULL OR quantidade_min >= 0)
        AND (quantidade_max IS NULL OR quantidade_max >= 0)
        AND (quantidade_min IS NULL OR quantidade_max IS NULL OR quantidade_max >= quantidade_min)
      ),
      CONSTRAINT item_conteudos_chance_valida CHECK (
        chance_percentual IS NULL OR (chance_percentual >= 0 AND chance_percentual <= 100)
      )
    )
  `);

  console.log("5/7 Criando efeitos e histórico de alterações...");

  await sql.query(`
    CREATE TABLE IF NOT EXISTS item_efeitos (
      id BIGSERIAL PRIMARY KEY,
      item_id BIGINT NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      nivel_melhoria INTEGER NOT NULL DEFAULT 0,
      ordem INTEGER NOT NULL DEFAULT 0,
      tipo VARCHAR(60),
      atributo VARCHAR(80),
      valor_numerico NUMERIC(14, 4),
      unidade VARCHAR(30),
      descricao TEXT NOT NULL,
      descricao_pt_br TEXT,
      condicao TEXT,
      fonte_id BIGINT REFERENCES fontes(id) ON DELETE SET NULL,
      patch_id BIGINT REFERENCES patches(id) ON DELETE SET NULL,
      verificado_em TIMESTAMPTZ,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT item_efeitos_nivel_valido CHECK (nivel_melhoria >= 0),
      CONSTRAINT item_efeitos_ordem_valida CHECK (ordem >= 0)
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS item_alteracoes (
      id BIGSERIAL PRIMARY KEY,
      item_id BIGINT NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      patch_id BIGINT REFERENCES patches(id) ON DELETE SET NULL,
      fonte_id BIGINT REFERENCES fontes(id) ON DELETE SET NULL,
      tipo VARCHAR(60) NOT NULL,
      resumo TEXT NOT NULL,
      detalhes TEXT,
      verificado_em TIMESTAMPTZ,
      criado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  console.log("6/7 Criando índices...");
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_itens_nome ON itens(nome)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_itens_categoria ON itens(categoria_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_itens_ativo ON itens(ativo)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_itens_raridade ON itens(raridade)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_fontes_item ON item_fontes(item_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_fontes_fonte ON item_fontes(fonte_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_obtencoes_item ON item_obtencoes(item_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_obtencoes_tipo ON item_obtencoes(tipo)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_conteudos_origem ON item_conteudos(item_origem_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_conteudos_conteudo ON item_conteudos(item_conteudo_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_efeitos_item ON item_efeitos(item_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_efeitos_item_nivel ON item_efeitos(item_id, nivel_melhoria)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_alteracoes_item ON item_alteracoes(item_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_item_alteracoes_patch ON item_alteracoes(patch_id)`);

  console.log("7/7 Validando o schema completo...");
  const requiredTables = [
    "item_alteracoes",
    "item_categorias",
    "item_conteudos",
    "item_efeitos",
    "item_fontes",
    "item_obtencoes",
    "itens",
  ];

  const tables = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])
     ORDER BY table_name
  `, [requiredTables]);

  const foundTables = new Set(tables.map((row) => row.table_name));
  for (const table of requiredTables) {
    if (!foundTables.has(table)) {
      throw new Error(`Tabela do catálogo ausente após setup: ${table}.`);
    }
  }

  const requiredItemColumns = ["raridade", "qualidade", "cp", "empilhavel"];
  const columns = await sql.query(`
    SELECT column_name
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'itens'
       AND column_name = ANY($1::text[])
  `, [requiredItemColumns]);

  const foundColumns = new Set(columns.map((row) => row.column_name));
  for (const column of requiredItemColumns) {
    if (!foundColumns.has(column)) {
      throw new Error(`Coluna de itens ausente após setup: ${column}.`);
    }
  }

  const [categoryCount] = await sql.query(`SELECT COUNT(*)::int AS total FROM item_categorias`);
  const [itemCount] = await sql.query(`SELECT COUNT(*)::int AS total FROM itens`);

  console.log(`   item_categorias: ${categoryCount.total} linhas`);
  console.log(`   itens: ${itemCount.total} linhas`);
  console.log(`   tabelas de catálogo: ${requiredTables.length}/${requiredTables.length}`);
  console.log("\nSchema de itens pronto para catálogo completo, obtenções, conteúdos, efeitos e histórico.");
}

main().catch((error) => {
  console.error("\nFalha ao preparar o schema de itens:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
