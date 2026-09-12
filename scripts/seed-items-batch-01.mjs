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
    nomeOrigem: "OFICIAL",
    slug: "sparkling-cube",
    descricao: null,
    descricaoPtBr: null,
    descricaoOrigem: null,
    categoria: "capture",
    source: "pt-launch",
    translationNote: "Nome publicado no site oficial em português.",
  },
  {
    nome: "Aniipod Ultra",
    nomePtBr: "Aniicápsula Ultra",
    nomeOrigem: "OFICIAL",
    slug: "aniipod-ultra",
    descricao: null,
    descricaoPtBr: null,
    descricaoOrigem: null,
    categoria: "capture",
    source: "pt-launch",
    translationNote: "Nome publicado no site oficial em português.",
  },
  {
    nome: "Tumbler",
    nomePtBr: "Roletor",
    nomeOrigem: "OFICIAL",
    slug: "tumbler",
    descricao: null,
    descricaoPtBr: null,
    descricaoOrigem: null,
    categoria: "capture",
    source: "pt-launch",
    translationNote: "Nome publicado no site oficial em português.",
  },
  {
    nome: "Glimmer",
    nomePtBr: "Cintilância",
    nomeOrigem: "OFICIAL",
    slug: "glimmer",
    descricao: null,
    descricaoPtBr: null,
    descricaoOrigem: null,
    categoria: null,
    source: "pt-launch",
    translationNote: "Nome publicado no site oficial em português.",
  },
  {
    nome: "Legendary Aniipod",
    nomePtBr: "Aniicápsula Lendária",
    nomeOrigem: "ANIIMO_BRASIL",
    slug: "legendary-aniipod",
    descricao:
      "Crafted from legendary tokens gathered through exploration and story progress, then used to unlock Irisalis's exclusive encounter.",
    descricaoPtBr:
      "Criada a partir de fichas lendárias obtidas por exploração e progresso na história, é usada para desbloquear o encontro exclusivo de Irisalis.",
    descricaoOrigem: "ANIIMO_BRASIL",
    categoria: null,
    source: "dev-letter",
    translationNote: "Tradução editorial baseada na terminologia oficial Aniicápsula Ultra.",
  },
  {
    nome: "Legendary Star Dust",
    nomePtBr: "Poeira Estelar Lendária",
    nomeOrigem: "ANIIMO_BRASIL",
    slug: "legendary-star-dust",
    descricao: null,
    descricaoPtBr: null,
    descricaoOrigem: null,
    categoria: null,
    source: "dev-letter",
    translationNote: "Tradução editorial do Aniimo Brasil.",
  },
  {
    nome: "Capafruit",
    nomePtBr: "Capafruit",
    nomeOrigem: "ANIIMO_BRASIL",
    slug: "capafruit",
    descricao:
      "Its effects transfer automatically between Aniimo during inheritance in the launch version.",
    descricaoPtBr:
      "Na versão de lançamento, seus efeitos são transferidos automaticamente entre Aniimos durante a herança.",
    descricaoOrigem: "ANIIMO_BRASIL",
    categoria: null,
    source: "dev-letter",
    translationNote: "Nome próprio preservado; descrição traduzida editorialmente.",
  },
  {
    nome: "Aniipod Trace",
    nomePtBr: "Vestígio de Aniicápsula",
    nomeOrigem: "ANIIMO_BRASIL",
    slug: "aniipod-trace",
    descricao: null,
    descricaoPtBr: null,
    descricaoOrigem: null,
    categoria: null,
    source: "jan-27",
    translationNote: "Tradução editorial baseada na terminologia oficial Aniicápsula Ultra.",
  },
  {
    nome: "Prismana Crystal",
    nomePtBr: "Cristal Prismana",
    nomeOrigem: "ANIIMO_BRASIL",
    slug: "prismana-crystal",
    descricao: null,
    descricaoPtBr: null,
    descricaoOrigem: null,
    categoria: null,
    source: "jan-25",
    translationNote: "Tradução editorial do Aniimo Brasil.",
  },
  {
    nome: "Credit",
    nomePtBr: "Crédito",
    nomeOrigem: "ANIIMO_BRASIL",
    slug: "credit",
    descricao: null,
    descricaoPtBr: null,
    descricaoOrigem: null,
    categoria: null,
    source: "jan-29",
    translationNote: "Tradução editorial do Aniimo Brasil.",
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
    "SELECT id, verificado_em FROM fontes WHERE url = $1 LIMIT 1",
    [source.url],
  );

  if (existing.length) {
    await sql.query(
      `UPDATE fontes
          SET verificado_em = CASE
                WHEN verificado_em IS NULL OR verificado_em < $2::timestamptz THEN $2::timestamptz
                ELSE verificado_em
              END,
              atualizado_em = NOW()
        WHERE url = $1`,
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

async function upsertTranslationMeta(sql, { entidade, entidadeId, campo, origem, fonteId, observacoes }) {
  if (!origem) return;

  await sql.query(
    `INSERT INTO traducoes_pt_br (
       entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
       origem = EXCLUDED.origem,
       fonte_id = COALESCE(EXCLUDED.fonte_id, traducoes_pt_br.fonte_id),
       observacoes = COALESCE(EXCLUDED.observacoes, traducoes_pt_br.observacoes),
       revisado_em = EXCLUDED.revisado_em,
       atualizado_em = NOW()`,
    [entidade, entidadeId, campo, origem, fonteId, observacoes, VERIFIED_AT],
  );
}

async function main() {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não encontrada. Configure o .env.local antes de executar.");
  }

  const sql = neon(databaseUrl);

  console.log("1/6 Validando o schema de itens e localização...");
  const tables = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('fontes', 'item_categorias', 'itens', 'traducoes_pt_br')
  `);
  const tableNames = new Set(tables.map((row) => row.table_name));
  for (const table of ["fontes", "item_categorias", "itens", "traducoes_pt_br"]) {
    if (!tableNames.has(table)) {
      throw new Error(
        `Tabela obrigatória ausente: ${table}. Execute npm.cmd run db:items:init e npm.cmd run db:ptbr:init primeiro.`,
      );
    }
  }

  console.log("2/6 Registrando fontes oficiais...");
  const sourceIds = new Map();
  for (const source of SOURCES) {
    const id = await ensureSource(sql, source);
    sourceIds.set(source.key, id);
    console.log(`   OK ${source.titulo}`);
  }

  console.log("3/6 Registrando categoria localizada...");
  const [captureCategory] = await sql.query(
    `INSERT INTO item_categorias (
       nome, nome_pt_br, slug, descricao, descricao_pt_br, atualizado_em
     )
     VALUES (
       'Capture',
       'Captura',
       'capture',
       'Items officially presented as capture items.',
       'Itens apresentados oficialmente como itens de captura.',
       NOW()
     )
     ON CONFLICT (slug) DO UPDATE SET
       nome_pt_br = EXCLUDED.nome_pt_br,
       descricao_pt_br = EXCLUDED.descricao_pt_br,
       atualizado_em = NOW()
     RETURNING id`,
  );
  const captureId = Number(captureCategory.id);
  const categoryIds = new Map([["capture", captureId]]);
  const ptLaunchSourceId = sourceIds.get("pt-launch");

  await upsertTranslationMeta(sql, {
    entidade: "item_categorias",
    entidadeId: captureId,
    campo: "nome",
    origem: "OFICIAL",
    fonteId: ptLaunchSourceId,
    observacoes: "Terminologia baseada na expressão oficial 'itens de captura'.",
  });
  await upsertTranslationMeta(sql, {
    entidade: "item_categorias",
    entidadeId: captureId,
    campo: "descricao",
    origem: "ANIIMO_BRASIL",
    fonteId: ptLaunchSourceId,
    observacoes: "Descrição editorial baseada na apresentação oficial dos itens de captura.",
  });

  console.log("4/6 Inserindo e localizando lote 01...");
  for (const item of ITEMS) {
    const categoryId = item.categoria ? categoryIds.get(item.categoria) : null;
    const sourceId = sourceIds.get(item.source);

    const [savedItem] = await sql.query(
      `INSERT INTO itens (
         nome, nome_pt_br, slug, descricao, descricao_pt_br, categoria_id,
         imagem_url, fonte_id, patch_introducao_id, ultima_verificacao, ativo, atualizado_em
       )
       VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, NULL, $8, TRUE, NOW())
       ON CONFLICT (slug) DO UPDATE SET
         nome = EXCLUDED.nome,
         nome_pt_br = COALESCE(EXCLUDED.nome_pt_br, itens.nome_pt_br),
         descricao = COALESCE(EXCLUDED.descricao, itens.descricao),
         descricao_pt_br = COALESCE(EXCLUDED.descricao_pt_br, itens.descricao_pt_br),
         categoria_id = COALESCE(EXCLUDED.categoria_id, itens.categoria_id),
         fonte_id = COALESCE(EXCLUDED.fonte_id, itens.fonte_id),
         ultima_verificacao = CASE
           WHEN itens.ultima_verificacao IS NULL OR itens.ultima_verificacao < EXCLUDED.ultima_verificacao
             THEN EXCLUDED.ultima_verificacao
           ELSE itens.ultima_verificacao
         END,
         ativo = TRUE,
         atualizado_em = NOW()
       RETURNING id`,
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

    const itemId = Number(savedItem.id);
    await upsertTranslationMeta(sql, {
      entidade: "itens",
      entidadeId: itemId,
      campo: "nome",
      origem: item.nomeOrigem,
      fonteId: sourceId,
      observacoes: item.translationNote,
    });
    await upsertTranslationMeta(sql, {
      entidade: "itens",
      entidadeId: itemId,
      campo: "descricao",
      origem: item.descricaoOrigem,
      fonteId: sourceId,
      observacoes: item.descricaoOrigem ? "Tradução editorial da descrição baseada na fonte oficial vinculada." : null,
    });

    console.log(`   OK ${item.nome} / ${item.nomePtBr}`);
  }

  console.log("5/6 Auditando traduções...");
  const audit = await sql.query(
    `SELECT i.slug, i.nome, i.nome_pt_br, c.slug AS categoria, f.url AS fonte_url,
            tn.origem AS nome_origem
       FROM itens i
       LEFT JOIN item_categorias c ON c.id = i.categoria_id
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
    if (!row.fonte_url || !row.nome_pt_br || !row.nome_origem) {
      throw new Error(`Item sem localização completa: ${row.nome}.`);
    }
    console.log(
      `   OK ${row.nome_pt_br} | EN: ${row.nome} | tradução: ${row.nome_origem}`,
    );
  }

  console.log("6/6 Finalizando lote...");
  const [total] = await sql.query("SELECT COUNT(*)::int AS total FROM itens WHERE ativo = TRUE");
  console.log(`\nLote 01 localizado. Itens ativos no catálogo: ${total.total}.`);
}

main().catch((error) => {
  console.error("\nFalha ao inserir/localizar o lote 01 de itens:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
