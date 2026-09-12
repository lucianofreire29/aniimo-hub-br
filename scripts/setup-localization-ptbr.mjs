import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const TARGETS = [
  { table: "aniimos", columns: ["nome_pt_br VARCHAR(150)", "descricao_pt_br TEXT"] },
  { table: "aniimo_formas", columns: ["nome_pt_br VARCHAR(150)", "descricao_pt_br TEXT"] },
  { table: "habilidades", columns: ["nome_pt_br VARCHAR(150)", "descricao_pt_br TEXT"] },
  { table: "traits", columns: ["nome_pt_br VARCHAR(150)", "descricao_pt_br TEXT"] },
  { table: "mobilidades", columns: ["nome_pt_br VARCHAR(150)", "descricao_pt_br TEXT"] },
  { table: "pathfindings", columns: ["nome_pt_br VARCHAR(150)", "descricao_pt_br TEXT"] },
  { table: "regioes", columns: ["nome_pt_br VARCHAR(150)", "descricao_pt_br TEXT"] },
  { table: "elementos", columns: ["nome_pt_br VARCHAR(100)"] },
  { table: "funcoes", columns: ["nome_pt_br VARCHAR(100)"] },
  { table: "estagios", columns: ["nome_pt_br VARCHAR(100)"] },
  { table: "item_categorias", columns: ["descricao_pt_br TEXT"] },
  { table: "patches", columns: ["titulo_pt_br VARCHAR(200)", "descricao_pt_br TEXT"] },
];

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

  console.log("1/4 Verificando tabelas necessárias...");
  const existing = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
  `);
  const existingTables = new Set(existing.map((row) => row.table_name));
  const missing = TARGETS.map((target) => target.table).filter((table) => !existingTables.has(table));

  if (missing.length) {
    throw new Error(`Tabelas ausentes: ${missing.join(", ")}`);
  }

  console.log("2/4 Adicionando campos PT-BR de forma não destrutiva...");
  for (const target of TARGETS) {
    for (const columnDefinition of target.columns) {
      const [columnName] = columnDefinition.split(/\s+/, 1);
      await sql.query(
        `ALTER TABLE public."${target.table}" ADD COLUMN IF NOT EXISTS "${columnName}" ${columnDefinition.slice(columnName.length + 1)}`,
      );
    }
    console.log(`   OK ${target.table}`);
  }

  console.log("3/4 Criando metadados de tradução...");
  await sql.query(`
    CREATE TABLE IF NOT EXISTS traducoes_pt_br (
      id BIGSERIAL PRIMARY KEY,
      entidade VARCHAR(60) NOT NULL,
      entidade_id BIGINT NOT NULL,
      campo VARCHAR(60) NOT NULL,
      origem VARCHAR(20) NOT NULL,
      fonte_id BIGINT REFERENCES fontes(id) ON DELETE SET NULL,
      observacoes TEXT,
      revisado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT traducoes_pt_br_origem_check
        CHECK (origem IN ('OFICIAL', 'ANIIMO_BRASIL')),
      CONSTRAINT traducoes_pt_br_entidade_campo_key
        UNIQUE (entidade, entidade_id, campo)
    )
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_traducoes_pt_br_entidade
      ON traducoes_pt_br(entidade, entidade_id)
  `);
  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_traducoes_pt_br_origem
      ON traducoes_pt_br(origem)
  `);

  console.log("4/4 Validando a estrutura de localização...");
  const [translationTable] = await sql.query(`
    SELECT COUNT(*)::int AS total
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = 'traducoes_pt_br'
  `);

  if (translationTable.total !== 1) {
    throw new Error("A tabela traducoes_pt_br não foi criada corretamente.");
  }

  const translatedColumns = await sql.query(`
    SELECT table_name, column_name
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND column_name LIKE '%_pt_br'
     ORDER BY table_name, column_name
  `);

  console.log(`   ${translatedColumns.length} campos PT-BR disponíveis no schema.`);
  console.log("\nEstrutura de localização PT-BR pronta.");
}

main().catch((error) => {
  console.error("\nFalha ao preparar a localização PT-BR:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
