import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const VERIFIED_AT = "2026-09-12T20:45:00Z";
const OFFICIAL_PT_BR_URL = "https://www.aniimo.com/pt";

const OFFICIAL_NAMES = [
  { slug: "sparkling-cube", nomePtBr: "Cubo Cintilante" },
  { slug: "aniipod-ultra", nomePtBr: "Aniicápsula Ultra" },
  { slug: "tumbler", nomePtBr: "Roletor" },
  { slug: "glimmer", nomePtBr: "Cintilância" },
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

async function ensureOfficialSource(sql) {
  const existing = await sql.query("SELECT id FROM fontes WHERE url = $1 LIMIT 1", [OFFICIAL_PT_BR_URL]);
  if (existing.length) {
    await sql.query(
      `UPDATE fontes
          SET tipo = 'OFICIAL_SITE_PT_BR',
              titulo = 'Site oficial do Aniimo em português',
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
            'Site oficial do Aniimo em português',
            'OFICIAL_SITE_PT_BR',
            $1,
            NULL,
            $2::timestamptz,
            'Página oficial em português usada para confirmar nomenclatura PT-BR exibida pelo próprio Aniimo.',
            NOW(), NOW()
       FROM fontes
     RETURNING id`,
    [OFFICIAL_PT_BR_URL, VERIFIED_AT],
  );
  return Number(inserted.id);
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/5 Validando estrutura de localização...");
  const required = ["fontes", "itens", "item_fontes", "traducoes_pt_br"];
  const tables = await sql.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
    [required],
  );
  const found = new Set(tables.map((row) => row.table_name));
  for (const table of required) {
    if (!found.has(table)) throw new Error(`Tabela obrigatória ausente: ${table}.`);
  }

  console.log("2/5 Registrando fonte oficial em português...");
  const sourceId = await ensureOfficialSource(sql);
  console.log(`   OK fonte oficial #${sourceId}`);

  console.log("3/5 Confirmando nomes oficiais PT-BR...");
  for (const item of OFFICIAL_NAMES) {
    const rows = await sql.query(
      `UPDATE itens
          SET nome_pt_br = $2,
              ultima_verificacao = GREATEST(COALESCE(ultima_verificacao, $3::timestamptz), $3::timestamptz),
              atualizado_em = NOW()
        WHERE slug = $1
          AND ativo = TRUE
      RETURNING id, nome, nome_pt_br`,
      [item.slug, item.nomePtBr, VERIFIED_AT],
    );

    if (rows.length !== 1) throw new Error(`Item esperado não encontrado: ${item.slug}.`);
    const row = rows[0];

    await sql.query(
      `INSERT INTO traducoes_pt_br (
         entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
       ) VALUES (
         'itens', $1, 'nome', 'OFICIAL', $2,
         'Nome confirmado diretamente na versão oficial em português do site do Aniimo.',
         $3::timestamptz, NOW()
       )
       ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
         origem = 'OFICIAL',
         fonte_id = EXCLUDED.fonte_id,
         observacoes = EXCLUDED.observacoes,
         revisado_em = EXCLUDED.revisado_em,
         atualizado_em = NOW()`,
      [row.id, sourceId, VERIFIED_AT],
    );

    await sql.query(
      `INSERT INTO item_fontes (
         item_id, fonte_id, patch_id, escopo, observacoes, principal, verificado_em, atualizado_em
       ) VALUES (
         $1, $2, NULL, 'LOCALIZACAO_PT_BR',
         'Fonte oficial usada para confirmar o nome exibido em português do Brasil.',
         FALSE, $3::timestamptz, NOW()
       )
       ON CONFLICT (item_id, fonte_id, patch_id, escopo) DO UPDATE SET
         observacoes = EXCLUDED.observacoes,
         verificado_em = EXCLUDED.verificado_em,
         atualizado_em = NOW()`,
      [row.id, sourceId, VERIFIED_AT],
    );

    console.log(`   OK ${row.nome} -> ${row.nome_pt_br} (OFICIAL)`);
  }

  console.log("4/5 Auditando classificação oficial...");
  const audit = await sql.query(
    `SELECT i.slug, i.nome_pt_br, t.origem, f.url
       FROM itens i
       JOIN traducoes_pt_br t
         ON t.entidade = 'itens'
        AND t.entidade_id = i.id
        AND t.campo = 'nome'
       LEFT JOIN fontes f ON f.id = t.fonte_id
      WHERE i.slug = ANY($1::text[])
      ORDER BY i.slug`,
    [OFFICIAL_NAMES.map((item) => item.slug)],
  );

  if (audit.length !== OFFICIAL_NAMES.length) {
    throw new Error(`Auditoria encontrou ${audit.length}/${OFFICIAL_NAMES.length} traduções esperadas.`);
  }
  for (const row of audit) {
    if (row.origem !== "OFICIAL" || row.url !== OFFICIAL_PT_BR_URL) {
      throw new Error(`Localização oficial inválida para ${row.slug}.`);
    }
    console.log(`   ${row.slug}: ${row.nome_pt_br} | ${row.origem}`);
  }

  console.log("5/5 Localização oficial de itens concluída.");
  console.log("\nQuatro nomes de itens agora estão classificados como PT-BR oficial com fonte rastreável.");
}

main().catch((error) => {
  console.error("\nFalha ao registrar localização oficial de itens:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
