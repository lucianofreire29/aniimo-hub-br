import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const VERIFIED_AT = "2026-09-12T10:30:00Z";

const SOURCES = [
  {
    key: "pt-launch",
    titulo: "Site oficial Aniimo - Recompensas do lançamento mundial",
    tipo: "SITE_OFICIAL",
    url: "https://www.aniimo.com/pt/m",
    dataPublicacao: null,
    observacoes: "Fonte oficial em português usada para nomes localizados de itens.",
  },
  {
    key: "dev-letter",
    titulo: "A Letter from the Aniimo Dev Team",
    tipo: "SITE_OFICIAL",
    url: "https://aniimo.com/newslist/detail/100064",
    dataPublicacao: "2026-09-03T00:00:00Z",
    observacoes: "Carta oficial da equipe de desenvolvimento antes do lançamento global.",
  },
  {
    key: "jan-27",
    titulo: "January 27 Patch Notes",
    tipo: "SITE_OFICIAL",
    url: "https://aniimo.com/newslist/detail/100010",
    dataPublicacao: "2026-01-27T00:00:00Z",
    observacoes: "Notas oficiais da segunda beta fechada.",
  },
  {
    key: "jan-25",
    titulo: "January 25 Update Notice",
    tipo: "SITE_OFICIAL",
    url: "https://aniimo.com/newslist/detail/100008",
    dataPublicacao: "2026-01-25T00:00:00Z",
    observacoes: "Aviso oficial de atualização da segunda beta fechada.",
  },
  {
    key: "jan-29",
    titulo: "January 29 Update Notice",
    tipo: "SITE_OFICIAL",
    url: "https://www.aniimo.com/newslist/detail/100013",
    dataPublicacao: "2026-01-29T00:00:00Z",
    observacoes: "Aviso oficial de atualização da segunda beta fechada.",
  },
];

const ITEMS = [
  {
    nome: "Sparkling Cube",
    nomePtBr: "Cubo Cintilante",
    slug: "sparkling-cube",
    descricao: null,
    descricaoPtBr: null,
    categoria: "capture",
    source: "pt-launch",
  },
  {
    nome: "Aniipod Ultra",
    nomePtBr: "Aniicápsula Ultra",
    slug: "aniipod-ultra",
    descricao: null,
    descricaoPtBr: null,
    categoria: "capture",
    source: "pt-launch",
  },
  {
    nome: "Tumbler",
    nomePtBr: "Roletor",
    slug: "tumbler",
    descricao: null,
    descricaoPtBr: null,
    categoria: "capture",
    source: "pt-launch",
  },
  {
    nome: "Glimmer",
    nomePtBr: "Cintilância",
    slug: "glimmer",
    descricao: null,
    descricaoPtBr: null,
    categoria: null,
    source: "pt-launch",
  },
  {
    nome: "Legendary Aniipod",
    nomePtBr: null,
    slug: "legendary-aniipod",
    descricao:
      "Crafted from legendary tokens gathered through exploration and story progress, then used to unlock Irisalis's exclusive encounter.",
    descricaoPtBr: null,
    categoria: null,
    source: "dev-letter",
  },
  {
    nome: "Legendary Star Dust",
    nomePtBr: null,
    slug: "legendary-star-dust",
    descricao: null,
    descricaoPtBr: null,
    categoria: null,
    source: "dev-letter",
  },
  {
    nome: "Capafruit",
    nomePtBr: null,
    slug: "capafruit",
    descricao:
      "Its effects transfer automatically between Aniimo during inheritance in the launch version.",
    descricaoPtBr: null,
    categoria: null,
    source: "dev-letter",
  },
  {
    nome: "Aniipod Trace",
    nomePtBr: null,
    slug: "aniipod-trace",
    descricao: null,
    descricaoPtBr: null,
    categoria: null,
    source: "jan-27",
  },
  {
    nome: "Prismana Crystal",
    nomePtBr: null,
    slug: "prismana-crystal",
    descricao: null,
    descricaoPtBr: null,
    categoria: null,
    source: "jan-25",
  },
  {
    nome: "Credit",
    nomePtBr: null,
    slug: "credit",
    descricao: null,
    descricaoPtBr: null,
    categoria: null,
    source: "jan-29",
  },
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
  const existing = await sql.query(
    "SELECT id FROM fontes WHERE url = $1 LIMIT 1",
    [source.url],
  );

  if (existing.length) {
    await sql.query(
      "UPDATE fontes SET verificado_em = $2, atualizado_em = NOW() WHERE url = $1",
      [source.url, VERIFIED_AT],
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
    [
      source.titulo,
      source.tipo,
      source.url,
      source.dataPublicacao,
      VERIFIED_AT,
      source.observacoes,
    ],
  );

  return Number(inserted[0].id);
}

async function main() {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não encontrada. Configure o .env.local antes de executar.");
  }

  const sql = neon(databaseUrl);

  console.log("1/5 Validando o schema de itens...");
  const tables = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('fontes', 'item_categorias', 'itens')
  `);
  const tableNames = new Set(tables.map((row) => row.table_name));
  for (const table of ["fontes", "item_categorias", "itens"]) {
    if (!tableNames.has(table)) {
      throw new Error(`Tabela obrigatória ausente: ${table}. Execute npm.cmd run db:items:init primeiro.`);
    }
  }

  console.log("2/5 Registrando fontes oficiais...");
  const sourceIds = new Map();
  for (const source of SOURCES) {
    const id = await ensureSource(sql, source);
    sourceIds.set(source.key, id);
    console.log(`   OK ${source.titulo}`);
  }

  console.log("3/5 Registrando categoria oficialmente confirmada...");
  const [captureCategory] = await sql.query(
    `INSERT INTO item_categorias (nome, nome_pt_br, slug, descricao, atualizado_em)
     VALUES ('Capture', 'Captura', 'capture', 'Items officially presented as capture items.', NOW())
     ON CONFLICT (slug) DO UPDATE SET
       nome = EXCLUDED.nome,
       nome_pt_br = EXCLUDED.nome_pt_br,
       descricao = EXCLUDED.descricao,
       atualizado_em = NOW()
     RETURNING id`,
  );
  const categoryIds = new Map([["capture", Number(captureCategory.id)]]);

  console.log("4/5 Inserindo lote 01 de itens...");
  for (const item of ITEMS) {
    const categoryId = item.categoria ? categoryIds.get(item.categoria) : null;
    const sourceId = sourceIds.get(item.source);

    await sql.query(
      `INSERT INTO itens (
         nome, nome_pt_br, slug, descricao, descricao_pt_br, categoria_id,
         imagem_url, fonte_id, patch_introducao_id, ultima_verificacao, ativo, atualizado_em
       )
       VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, NULL, $8, TRUE, NOW())
       ON CONFLICT (slug) DO UPDATE SET
         nome = EXCLUDED.nome,
         nome_pt_br = EXCLUDED.nome_pt_br,
         descricao = EXCLUDED.descricao,
         descricao_pt_br = EXCLUDED.descricao_pt_br,
         categoria_id = EXCLUDED.categoria_id,
         fonte_id = EXCLUDED.fonte_id,
         ultima_verificacao = EXCLUDED.ultima_verificacao,
         ativo = TRUE,
         atualizado_em = NOW()`,
      [
        item.nome,
        item.nomePtBr,
        item.slug,
        item.descricao,
        item.descricaoPtBr,
        categoryId,
        sourceId,
        VERIFIED_AT,
      ],
    );

    console.log(`   OK ${item.nome}${item.nomePtBr ? ` / ${item.nomePtBr}` : ""}`);
  }

  console.log("5/5 Auditando o lote...");
  const audit = await sql.query(
    `SELECT i.slug, i.nome, i.nome_pt_br, c.slug AS categoria, f.url AS fonte_url
       FROM itens i
       LEFT JOIN item_categorias c ON c.id = i.categoria_id
       LEFT JOIN fontes f ON f.id = i.fonte_id
      WHERE i.slug = ANY($1::text[])
      ORDER BY i.nome`,
    [ITEMS.map((item) => item.slug)],
  );

  if (audit.length !== ITEMS.length) {
    throw new Error(`Auditoria encontrou ${audit.length} de ${ITEMS.length} itens esperados.`);
  }

  for (const row of audit) {
    if (!row.fonte_url) {
      throw new Error(`Item sem fonte oficial vinculada: ${row.nome}.`);
    }
    console.log(
      `   OK ${row.nome}${row.nome_pt_br ? ` (${row.nome_pt_br})` : ""} | categoria: ${row.categoria ?? "NULL"}`,
    );
  }

  const [total] = await sql.query("SELECT COUNT(*)::int AS total FROM itens WHERE ativo = TRUE");
  console.log(`\nLote 01 concluído. Itens ativos no catálogo: ${total.total}.`);
}

main().catch((error) => {
  console.error("\nFalha ao inserir o lote 01 de itens:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
