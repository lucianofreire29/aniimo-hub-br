import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const VERIFIED_AT = "2026-09-12T11:30:00Z";

const SOURCES = [
  {
    key: "experience-gems",
    titulo: "Optimized item acquisition conditions",
    tipo: "SITE_OFICIAL",
    url: "https://www.aniimo.com/newslist/detail/100011",
    dataPublicacao: "2026-01-28T00:00:00Z",
    observacoes: "Comunicado oficial sobre Experience Gems e treinamento de Aniimo.",
  },
  {
    key: "feb-02",
    titulo: "February 2 Update Notice",
    tipo: "SITE_OFICIAL",
    url: "https://www.aniimo.com/newslist/detail/100017",
    dataPublicacao: "2026-02-02T00:00:00Z",
    observacoes: "Aviso oficial que cita Aniipod, Aniipod Pro, Aniipod Mega, Eggshell Coins e vouchers do Egg Heist.",
  },
  {
    key: "jan-29",
    titulo: "January 29 Update Notice",
    tipo: "SITE_OFICIAL",
    url: "https://www.aniimo.com/newslist/detail/100013",
    dataPublicacao: "2026-01-29T00:00:00Z",
    observacoes: "Aviso oficial usado para confirmar Lightweight Backpack.",
  },
];

const ITEMS = [
  { nome: "Basic Experience Gems", nomePtBr: "Gemas de Experiência Básicas", slug: "basic-experience-gems", source: "experience-gems" },
  { nome: "Medium Experience Gems", nomePtBr: "Gemas de Experiência Médias", slug: "medium-experience-gems", source: "experience-gems" },
  { nome: "Advanced Experience Gems", nomePtBr: "Gemas de Experiência Avançadas", slug: "advanced-experience-gems", source: "experience-gems" },
  { nome: "Aniipod", nomePtBr: "Aniicápsula", slug: "aniipod", source: "feb-02" },
  { nome: "Aniipod Pro", nomePtBr: "Aniicápsula Pro", slug: "aniipod-pro", source: "feb-02" },
  { nome: "Aniipod Mega", nomePtBr: "Aniicápsula Mega", slug: "aniipod-mega", source: "feb-02" },
  { nome: "Eggshell Coin", nomePtBr: "Moeda de Casca de Ovo", slug: "eggshell-coin", source: "feb-02" },
  { nome: "Egg Voucher", nomePtBr: "Vale-Ovo", slug: "egg-voucher", source: "feb-02" },
  { nome: "Super Egg Voucher", nomePtBr: "Super Vale-Ovo", slug: "super-egg-voucher", source: "feb-02" },
  { nome: "Lightweight Backpack", nomePtBr: "Mochila Leve", slug: "lightweight-backpack", source: "jan-29" },
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

async function ensureSource(sql, source) {
  const existing = await sql.query("SELECT id FROM fontes WHERE url = $1 LIMIT 1", [source.url]);

  if (existing.length) {
    await sql.query(
      `UPDATE fontes
          SET titulo = COALESCE(titulo, $2),
              tipo = COALESCE(tipo, $3),
              data_publicacao = COALESCE(data_publicacao, $4),
              observacoes = COALESCE(observacoes, $5),
              verificado_em = GREATEST(COALESCE(verificado_em, $6::timestamptz), $6::timestamptz),
              atualizado_em = NOW()
        WHERE url = $1`,
      [source.url, source.titulo, source.tipo, source.dataPublicacao, source.observacoes, VERIFIED_AT],
    );
    return Number(existing[0].id);
  }

  const inserted = await sql.query(
    `INSERT INTO fontes (
       id, titulo, tipo, url, data_publicacao, verificado_em, observacoes, criado_em, atualizado_em
     )
     SELECT COALESCE(MAX(id), 0) + 1, $1, $2, $3, $4, $5, $6, NOW(), NOW()
       FROM fontes
     RETURNING id`,
    [source.titulo, source.tipo, source.url, source.dataPublicacao, VERIFIED_AT, source.observacoes],
  );

  return Number(inserted[0].id);
}

async function upsertTranslationMeta(sql, itemId, sourceId, item) {
  const note = item.nome.startsWith("Aniipod")
    ? "Tradução editorial baseada na terminologia oficial Aniicápsula Ultra."
    : "Tradução editorial do Aniimo Brasil baseada na fonte oficial em inglês.";

  await sql.query(
    `INSERT INTO traducoes_pt_br (
       entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
     )
     VALUES ('itens', $1, 'nome', 'ANIIMO_BRASIL', $2, $3, $4::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
       origem = EXCLUDED.origem,
       fonte_id = COALESCE(EXCLUDED.fonte_id, traducoes_pt_br.fonte_id),
       observacoes = EXCLUDED.observacoes,
       revisado_em = EXCLUDED.revisado_em,
       atualizado_em = NOW()`,
    [itemId, sourceId, note, VERIFIED_AT],
  );
}

async function main() {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não encontrada. Configure o .env.local antes de executar.");
  }

  const sql = neon(databaseUrl);

  console.log("1/5 Validando o schema de itens e localização...");
  const tables = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('fontes', 'itens', 'traducoes_pt_br')
  `);
  const tableNames = new Set(tables.map((row) => row.table_name));
  for (const table of ["fontes", "itens", "traducoes_pt_br"]) {
    if (!tableNames.has(table)) {
      throw new Error(
        `Tabela obrigatória ausente: ${table}. Execute npm.cmd run db:items:init e npm.cmd run db:ptbr:init primeiro.`,
      );
    }
  }

  console.log("2/5 Registrando fontes oficiais...");
  const sourceIds = new Map();
  for (const source of SOURCES) {
    const id = await ensureSource(sql, source);
    sourceIds.set(source.key, id);
    console.log(`   OK ${source.titulo}`);
  }

  console.log("3/5 Inserindo e localizando lote 02...");
  for (const item of ITEMS) {
    const sourceId = sourceIds.get(item.source);
    const [savedItem] = await sql.query(
      `INSERT INTO itens (
         nome, nome_pt_br, slug, descricao, descricao_pt_br, categoria_id,
         imagem_url, fonte_id, patch_introducao_id, ultima_verificacao, ativo, atualizado_em
       )
       VALUES ($1, $2, $3, NULL, NULL, NULL, NULL, $4, NULL, $5, TRUE, NOW())
       ON CONFLICT (slug) DO UPDATE SET
         nome = EXCLUDED.nome,
         nome_pt_br = EXCLUDED.nome_pt_br,
         fonte_id = COALESCE(itens.fonte_id, EXCLUDED.fonte_id),
         ultima_verificacao = GREATEST(
           COALESCE(itens.ultima_verificacao, EXCLUDED.ultima_verificacao),
           EXCLUDED.ultima_verificacao
         ),
         ativo = TRUE,
         atualizado_em = NOW()
       RETURNING id`,
      [item.nome, item.nomePtBr, item.slug, sourceId, VERIFIED_AT],
    );

    await upsertTranslationMeta(sql, Number(savedItem.id), sourceId, item);
    console.log(`   OK ${item.nome} / ${item.nomePtBr}`);
  }

  console.log("4/5 Auditando traduções...");
  const audit = await sql.query(
    `SELECT i.slug, i.nome, i.nome_pt_br, f.url AS fonte_url, tn.origem AS nome_origem
       FROM itens i
       LEFT JOIN fontes f ON f.id = i.fonte_id
       LEFT JOIN traducoes_pt_br tn
         ON tn.entidade = 'itens' AND tn.entidade_id = i.id AND tn.campo = 'nome'
      WHERE i.slug = ANY($1::text[])
      ORDER BY i.nome`,
    [ITEMS.map((item) => item.slug)],
  );

  if (audit.length !== ITEMS.length) {
    throw new Error(`Auditoria encontrou ${audit.length} de ${ITEMS.length} itens esperados.`);
  }

  for (const row of audit) {
    if (!row.fonte_url || !row.nome_pt_br || row.nome_origem !== "ANIIMO_BRASIL") {
      throw new Error(`Item sem localização editorial completa: ${row.nome}.`);
    }
    console.log(`   OK ${row.nome_pt_br} | EN: ${row.nome} | tradução: ${row.nome_origem}`);
  }

  console.log("5/5 Finalizando lote...");
  const [total] = await sql.query("SELECT COUNT(*)::int AS total FROM itens WHERE ativo = TRUE");
  console.log(`\nLote 02 localizado. Itens ativos no catálogo: ${total.total}.`);
}

main().catch((error) => {
  console.error("\nFalha ao inserir/localizar o lote 02 de itens:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
