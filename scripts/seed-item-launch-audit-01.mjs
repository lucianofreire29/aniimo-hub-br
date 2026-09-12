import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const VERIFIED_AT = "2026-09-12T20:50:00Z";
const OFFICIAL_URL = "https://aniimo.com/newslist/detail/100064";
const ITEM_SLUG = "crevice-beacon";
const CHANGE_TYPE = "SISTEMA_RETRABALHADO";

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

async function ensureOfficialSource(sql) {
  const existing = await sql.query("SELECT id FROM fontes WHERE url = $1 LIMIT 1", [OFFICIAL_URL]);
  if (existing.length) {
    await sql.query(
      `UPDATE fontes
          SET tipo = 'OFICIAL_DEV_LETTER',
              titulo = 'A Letter from the Aniimo Dev Team',
              data_publicacao = COALESCE(data_publicacao, DATE '2026-09-03'),
              verificado_em = $2::timestamptz,
              atualizado_em = NOW()
        WHERE id = $1`,
      [existing[0].id, VERIFIED_AT],
    );
    return Number(existing[0].id);
  }

  const [inserted] = await sql.query(
    `INSERT INTO fontes (
       id, titulo, tipo, url, data_publicacao, verificado_em, observacoes, criado_em, atualizado_em
     )
     SELECT COALESCE(MAX(id), 0) + 1,
            'A Letter from the Aniimo Dev Team',
            'OFICIAL_DEV_LETTER',
            $1,
            DATE '2026-09-03',
            $2::timestamptz,
            'Carta oficial da equipe de desenvolvimento descrevendo mudanças já implementadas na versão de lançamento.',
            NOW(), NOW()
       FROM fontes
     RETURNING id`,
    [OFFICIAL_URL, VERIFIED_AT],
  );
  return Number(inserted.id);
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/5 Validando histórico de itens...");
  const required = ["fontes", "itens", "item_fontes", "item_alteracoes"];
  const tables = await sql.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
    [required],
  );
  const found = new Set(tables.map((row) => row.table_name));
  for (const table of required) {
    if (!found.has(table)) throw new Error(`Tabela obrigatória ausente: ${table}.`);
  }

  console.log("2/5 Localizando Farol da Fenda e fonte oficial...");
  const [item] = await sql.query(
    `SELECT id, nome, nome_pt_br FROM itens WHERE slug = $1 AND ativo = TRUE LIMIT 1`,
    [ITEM_SLUG],
  );
  if (!item) throw new Error("Farol da Fenda não encontrado no catálogo.");
  const sourceId = await ensureOfficialSource(sql);
  console.log(`   OK ${item.nome_pt_br ?? item.nome} | fonte oficial #${sourceId}`);

  console.log("3/5 Registrando mudança do fluxo de lançamento...");
  const summary = "Fluxo de obtenção de Irisalis redesenhado para o lançamento";
  const details =
    "A equipe oficial informou em 3 de setembro de 2026 que a obtenção de Irisalis deixou de depender do desafio repetido usado em testes anteriores. Na versão de lançamento, o progresso passa por tokens lendários obtidos em exploração e história, fabricação de uma Aniicápsula Lendária pessoal e um encontro exclusivo que ocorre uma única vez. Por isso, usos do Farol da Fenda ligados ao fluxo antigo devem ser tratados como contexto histórico até reconfirmação no jogo lançado.";

  const existing = await sql.query(
    `SELECT id FROM item_alteracoes
      WHERE item_id = $1
        AND fonte_id = $2
        AND tipo = $3
      ORDER BY id
      LIMIT 1`,
    [item.id, sourceId, CHANGE_TYPE],
  );

  if (existing.length) {
    await sql.query(
      `UPDATE item_alteracoes
          SET resumo = $2,
              detalhes = $3,
              verificado_em = $4::timestamptz
        WHERE id = $1`,
      [existing[0].id, summary, details, VERIFIED_AT],
    );
  } else {
    await sql.query(
      `INSERT INTO item_alteracoes (
         item_id, patch_id, fonte_id, tipo, resumo, detalhes, verificado_em
       ) VALUES ($1, NULL, $2, $3, $4, $5, $6::timestamptz)`,
      [item.id, sourceId, CHANGE_TYPE, summary, details, VERIFIED_AT],
    );
  }

  await sql.query(
    `INSERT INTO item_fontes (
       item_id, fonte_id, patch_id, escopo, observacoes, principal, verificado_em, atualizado_em
     ) VALUES (
       $1, $2, NULL, 'HISTORICO_LANCAMENTO',
       'Fonte oficial usada para contextualizar mudança do fluxo de Irisalis entre os testes e o lançamento.',
       FALSE, $3::timestamptz, NOW()
     )
     ON CONFLICT (item_id, fonte_id, patch_id, escopo) DO UPDATE SET
       observacoes = EXCLUDED.observacoes,
       verificado_em = EXCLUDED.verificado_em,
       atualizado_em = NOW()`,
    [item.id, sourceId, VERIFIED_AT],
  );

  console.log("4/5 Auditando histórico...");
  const audit = await sql.query(
    `SELECT a.tipo, a.resumo, f.url
       FROM item_alteracoes a
       JOIN fontes f ON f.id = a.fonte_id
      WHERE a.item_id = $1
        AND a.tipo = $2
        AND f.url = $3`,
    [item.id, CHANGE_TYPE, OFFICIAL_URL],
  );
  if (audit.length !== 1) throw new Error(`Auditoria encontrou ${audit.length} registros; esperava 1.`);
  console.log(`   ${audit[0].tipo}: ${audit[0].resumo}`);

  console.log("5/5 Revisão de lançamento registrada.");
  console.log("\nO Farol da Fenda permanece no catálogo, mas o fluxo antigo de Irisalis agora fica explicitamente contextualizado como histórico de testes.");
}

main().catch((error) => {
  console.error("\nFalha ao registrar revisão de lançamento:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
