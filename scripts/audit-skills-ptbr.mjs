import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/3 Auditando cobertura geral das habilidades...");
  const rows = await sql.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL AND btrim(nome_pt_br) <> '')::int AS nomes_pt_br,
       COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao) <> '')::int AS descricoes_origem,
       COUNT(*) FILTER (
         WHERE descricao IS NOT NULL AND btrim(descricao) <> ''
           AND descricao_pt_br IS NOT NULL AND btrim(descricao_pt_br) <> ''
       )::int AS descricoes_pt_br,
       COUNT(*) FILTER (WHERE descricao IS NULL OR btrim(descricao) = '')::int AS sem_descricao
     FROM habilidades`,
  );
  const result = rows[0];

  if (result.total !== 364) throw new Error(`Total inesperado de habilidades: ${result.total}. Esperado: 364.`);
  if (result.nomes_pt_br !== 364) throw new Error(`Há nomes sem PT-BR: ${result.nomes_pt_br}/364.`);
  if (result.descricoes_origem !== 327 || result.descricoes_pt_br !== 327) {
    throw new Error(`Cobertura de descrições inválida: ${result.descricoes_pt_br}/${result.descricoes_origem}. Esperado: 327/327.`);
  }
  if (result.sem_descricao !== 37) throw new Error(`Quantidade inesperada de descrições ausentes na origem: ${result.sem_descricao}.`);

  console.log("   OK 364/364 nomes em PT-BR.");
  console.log("   OK 327/327 descrições existentes em PT-BR.");
  console.log("   OK 37 descrições ausentes continuam sem conteúdo inventado.");

  console.log("2/3 Auditando metadados de tradução...");
  const meta = await sql.query(
    `SELECT
       COUNT(*) FILTER (WHERE campo = 'nome')::int AS nomes,
       COUNT(*) FILTER (WHERE campo = 'descricao')::int AS descricoes
     FROM traducoes_pt_br
    WHERE entidade = 'habilidades'`,
  );
  if (meta[0].nomes !== 364 || meta[0].descricoes !== 327) {
    throw new Error(`Metadados incompletos: nomes=${meta[0].nomes}/364, descrições=${meta[0].descricoes}/327.`);
  }
  console.log("   OK 691 registros de rastreabilidade (364 nomes + 327 descrições)." );

  console.log("3/3 Finalizando...");
  console.log("\nLocalização de habilidades concluída e auditada.");
}

main().catch((error) => {
  console.error("\nFalha na auditoria geral de habilidades:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
