import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T13:00:00Z";

const REGIONS_PT_BR = [
  [1, "Campos de Nimbus"],
  [2, "Bosques da Névoa"],
  [3, "Estreito Argênteo"],
  [4, "Desembarque de Echoback"],
  [5, "Cordilheira da Presa Bestial"],
  [6, "Ponte Terrestre de Zephyrus"],
  [7, "Terras Altas de Russet"],
  [10, "Floresta das Estrelas Cadentes"],
  [11, "Bosque do Relâmpago"],
  [12, "Mar de Flores"],
  [13, "Prado de Driftwise"],
  [14, "Passagem de Berilo"],
  [16, "Costa das Flores de Maré"],
  [17, "Bosques da Torre Rosada"],
  [19, "Baía Crescente"],
];

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
    ) value = value.slice(1, -1);

    if (!process.env[key]) process.env[key] = value;
  }
}

async function saveMeta(sql, id, nomeOriginal, nomePtBr) {
  await sql.query(
    `INSERT INTO traducoes_pt_br (
       entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
     ) VALUES ('regioes', $1, 'nome', 'ANIIMO_BRASIL', NULL, $2, $3::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
       origem = 'ANIIMO_BRASIL',
       observacoes = EXCLUDED.observacoes,
       revisado_em = EXCLUDED.revisado_em,
       atualizado_em = NOW()`,
    [id, `Tradução editorial: ${nomeOriginal} → ${nomePtBr}.`, REVIEWED_AT],
  );
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/4 Validando regiões...");
  const rows = await sql.query(`SELECT id, nome FROM regioes ORDER BY id`);
  if (rows.length !== REGIONS_PT_BR.length) {
    throw new Error(`Esperadas ${REGIONS_PT_BR.length} regiões, mas foram encontradas ${rows.length}.`);
  }

  const translations = new Map(REGIONS_PT_BR);
  for (const row of rows) {
    if (!translations.has(Number(row.id))) {
      throw new Error(`Região sem tradução preparada: ${row.id} - ${row.nome}.`);
    }
  }

  console.log("2/4 Localizando 15 regiões...");
  for (const row of rows) {
    const id = Number(row.id);
    const nomePtBr = translations.get(id);
    await sql.query(
      `UPDATE regioes SET nome_pt_br = $2, atualizado_em = NOW() WHERE id = $1`,
      [id, nomePtBr],
    );
    await saveMeta(sql, id, row.nome, nomePtBr);
    console.log(`   OK ${row.nome} / ${nomePtBr}`);
  }

  console.log("3/4 Auditando regiões...");
  const audit = await sql.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL)::int AS traduzidas
       FROM regioes`,
  );
  if (audit[0].total !== 15 || audit[0].traduzidas !== 15) {
    throw new Error(`Auditoria inválida: ${audit[0].traduzidas}/${audit[0].total}.`);
  }
  console.log("   OK 15/15 regiões em PT-BR.");

  console.log("4/4 Finalizando...");
  console.log("\nRegiões localizadas e auditadas.");
}

main().catch((error) => {
  console.error("\nFalha ao localizar regiões:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
