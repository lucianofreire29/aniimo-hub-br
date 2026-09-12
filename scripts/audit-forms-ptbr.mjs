import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const EXPECTED_TOTAL = 225;
const EXPECTED_DESCRIPTIONS = 185;

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
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
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");

  const sql = neon(databaseUrl);

  console.log("Auditando localização PT-BR de todas as formas...");
  const rows = await sql.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL)::int AS nomes_pt_br,
      COUNT(*) FILTER (WHERE descricao IS NOT NULL)::int AS descricoes_origem,
      COUNT(*) FILTER (
        WHERE descricao IS NOT NULL AND descricao_pt_br IS NOT NULL
      )::int AS descricoes_pt_br
    FROM aniimo_formas
  `);

  const result = rows[0];

  if (result.total !== EXPECTED_TOTAL) {
    throw new Error(`Total inesperado de formas: ${result.total}/${EXPECTED_TOTAL}.`);
  }
  if (result.nomes_pt_br !== EXPECTED_TOTAL) {
    throw new Error(`Há nomes sem PT-BR: ${result.nomes_pt_br}/${EXPECTED_TOTAL}.`);
  }
  if (result.descricoes_origem !== EXPECTED_DESCRIPTIONS) {
    throw new Error(
      `Quantidade de descrições de origem mudou: ${result.descricoes_origem}/${EXPECTED_DESCRIPTIONS}.`,
    );
  }
  if (result.descricoes_pt_br !== EXPECTED_DESCRIPTIONS) {
    throw new Error(
      `Há descrições existentes sem PT-BR: ${result.descricoes_pt_br}/${EXPECTED_DESCRIPTIONS}.`,
    );
  }

  console.log(`OK ${result.nomes_pt_br}/${result.total} nomes de formas em PT-BR.`);
  console.log(
    `OK ${result.descricoes_pt_br}/${result.descricoes_origem} descrições existentes em PT-BR.`,
  );
  console.log("\nLocalização de formas concluída e auditada.");
}

main().catch((error) => {
  console.error("\nFalha na auditoria geral das formas:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
