import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const VERIFIED_AT = "2026-09-12T20:45:00Z";
const SOURCE = {
  titulo: "Aniimo Tools - Banco de baús",
  tipo: "COMUNIDADE_ANIIMOTOOLS",
  url: "https://aniimotools.dev/db/items/chest/",
  observacoes:
    "Fonte comunitária não oficial. Os nomes e descrições são usados como referência de dados do jogo e podem mudar com patches.",
};

const CHESTS = [
  {
    nome: "Advanced Carried Item Pack",
    nomePtBr: "Pacote Avançado de Itens Carregados",
    slug: "advanced-carried-item-pack",
    raridade: "Legendary",
    qualidade: "Chest",
    descricao: null,
    descricaoPtBr: null,
  },
  {
    nome: "Polaris Institute Uniform Gift Box",
    nomePtBr: "Caixa de Presente do Uniforme do Instituto Polaris",
    slug: "polaris-institute-uniform-gift-box",
    raridade: "Epic",
    qualidade: "Chest",
    descricao:
      "A gift box for a Polaris Institute uniform inspired by Astra's Lumintech, with light-reactive fabric and climate control.",
    descricaoPtBr:
      "Caixa de presente com um uniforme do Instituto Polaris inspirado na Lumintech de Astra, feito com tecido que reage à luz e possui controle climático integrado.",
  },
];

const COMMUNITY_TRANSLATIONS = [
  {
    slug: "auspicious-bell",
    nome: "Sino Auspicioso",
    descricao: "Item carregado lendário voltado para Regeneração e geração de energia para a equipe.",
  },
  {
    slug: "aniipod-ultra-voucher",
    nome: "Voucher de Aniicápsula Ultra",
    descricao:
      "Moeda de troca: 20 vouchers podem ser trocados por uma Aniicápsula Ultra em um vendedor de posto avançado.",
  },
  {
    slug: "crevice-beacon",
    nome: "Farol da Fenda",
    descricao: "Material usado dentro de uma Fenda de Veio para atrair um Aniimo Lendário.",
  },
  {
    slug: "wheat-home",
    nome: "Trigo",
    descricao: "Material agrícola básico da Casa, produzido em terras de cultivo e usado em outras produções.",
  },
  {
    slug: "sparkling-cube",
    nome: "Cubo Cintilante",
    descricao:
      "Item de captura muito raro que garante a captura e um Aniimo Cintilante com Potencial Adquirido de pelo menos nível Elite.",
  },
  {
    slug: "tumbler",
    nome: "Roletor",
    descricao:
      "Aniicápsula especial com chance de captura aumentada e bônus maior para Aniimos reunidos por nurture.",
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

async function ensureSource(sql) {
  const existing = await sql.query("SELECT id FROM fontes WHERE url = $1 LIMIT 1", [SOURCE.url]);
  if (existing.length) {
    await sql.query(
      `UPDATE fontes
          SET titulo = $2,
              tipo = $3,
              observacoes = $4,
              verificado_em = CASE
                WHEN verificado_em IS NULL OR verificado_em < $5::timestamptz THEN $5::timestamptz
                ELSE verificado_em
              END,
              atualizado_em = NOW()
        WHERE id = $1`,
      [existing[0].id, SOURCE.titulo, SOURCE.tipo, SOURCE.observacoes, VERIFIED_AT],
    );
    return Number(existing[0].id);
  }

  const [inserted] = await sql.query(
    `INSERT INTO fontes (
       id, titulo, tipo, url, data_publicacao, verificado_em, observacoes, criado_em, atualizado_em
     )
     SELECT COALESCE(MAX(id), 0) + 1, $1, $2, $3, NULL, $4::timestamptz, $5, NOW(), NOW()
       FROM fontes
     RETURNING id`,
    [SOURCE.titulo, SOURCE.tipo, SOURCE.url, VERIFIED_AT, SOURCE.observacoes],
  );

  return Number(inserted.id);
}

async function ensureCategory(sql) {
  const [row] = await sql.query(
    `INSERT INTO item_categorias (
       nome, nome_pt_br, slug, descricao, descricao_pt_br, atualizado_em
     )
     VALUES (
       'Chest',
       'Baú',
       'chest',
       'Items that package or grant rewards.',
       'Itens que agrupam ou concedem recompensas.',
       NOW()
     )
     ON CONFLICT (slug) DO UPDATE SET
       nome_pt_br = COALESCE(item_categorias.nome_pt_br, EXCLUDED.nome_pt_br),
       descricao_pt_br = COALESCE(item_categorias.descricao_pt_br, EXCLUDED.descricao_pt_br),
       atualizado_em = NOW()
     RETURNING id`,
  );
  return Number(row.id);
}

async function addTranslationMetaIfMissing(sql, itemId, field, sourceId, note) {
  await sql.query(
    `INSERT INTO traducoes_pt_br (
       entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
     )
     VALUES ('itens', $1, $2, 'ANIIMO_BRASIL', $3, $4, $5::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO NOTHING`,
    [itemId, field, sourceId, note, VERIFIED_AT],
  );
}

async function upsertChest(sql, chest, categoryId, sourceId) {
  const [row] = await sql.query(
    `INSERT INTO itens (
       nome, nome_pt_br, slug, descricao, descricao_pt_br, categoria_id,
       raridade, qualidade, cp, fonte_id, ultima_verificacao, ativo, atualizado_em
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9, $10::timestamptz, TRUE, NOW())
     ON CONFLICT (slug) DO UPDATE SET
       nome = EXCLUDED.nome,
       nome_pt_br = COALESCE(itens.nome_pt_br, EXCLUDED.nome_pt_br),
       descricao = COALESCE(EXCLUDED.descricao, itens.descricao),
       descricao_pt_br = COALESCE(EXCLUDED.descricao_pt_br, itens.descricao_pt_br),
       categoria_id = EXCLUDED.categoria_id,
       raridade = EXCLUDED.raridade,
       qualidade = EXCLUDED.qualidade,
       ultima_verificacao = EXCLUDED.ultima_verificacao,
       ativo = TRUE,
       atualizado_em = NOW()
     RETURNING id`,
    [
      chest.nome,
      chest.nomePtBr,
      chest.slug,
      chest.descricao,
      chest.descricaoPtBr,
      categoryId,
      chest.raridade,
      chest.qualidade,
      sourceId,
      VERIFIED_AT,
    ],
  );

  const itemId = Number(row.id);

  await sql.query(
    `INSERT INTO item_fontes (
       item_id, fonte_id, patch_id, escopo, observacoes, principal, verificado_em, atualizado_em
     )
     VALUES (
       $1, $2, NULL, 'CATALOGO_COMUNITARIO',
       'Registro comunitário de baú/pacote. Conteúdo interno só será cadastrado quando houver composição verificável.',
       FALSE, $3::timestamptz, NOW()
     )
     ON CONFLICT (item_id, fonte_id, patch_id, escopo) DO UPDATE SET
       observacoes = EXCLUDED.observacoes,
       verificado_em = EXCLUDED.verificado_em,
       atualizado_em = NOW()`,
    [itemId, sourceId, VERIFIED_AT],
  );

  await addTranslationMetaIfMissing(
    sql,
    itemId,
    "nome",
    sourceId,
    "Tradução editorial do Aniimo Brasil baseada no nome original da fonte comunitária.",
  );

  if (chest.descricaoPtBr) {
    await addTranslationMetaIfMissing(
      sql,
      itemId,
      "descricao",
      sourceId,
      "Descrição em PT-BR adaptada editorialmente a partir da referência comunitária.",
    );
  }

  return itemId;
}

async function backfillCommunityTranslationMeta(sql, sourceId) {
  for (const item of COMMUNITY_TRANSLATIONS) {
    const [row] = await sql.query(
      `SELECT id, nome_pt_br, descricao_pt_br
         FROM itens
        WHERE slug = $1
          AND ativo = TRUE
        LIMIT 1`,
      [item.slug],
    );

    if (!row) continue;

    if (row.nome_pt_br) {
      await addTranslationMetaIfMissing(
        sql,
        Number(row.id),
        "nome",
        sourceId,
        "Tradução editorial do Aniimo Brasil. Metadado adicionado sem substituir eventual tradução oficial já registrada.",
      );
    }

    if (row.descricao_pt_br) {
      await addTranslationMetaIfMissing(
        sql,
        Number(row.id),
        "descricao",
        sourceId,
        "Descrição em PT-BR do Aniimo Brasil. Metadado adicionado sem substituir eventual origem já registrada.",
      );
    }
  }
}

async function main() {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/6 Validando schema do catálogo e localização...");
  const required = [
    "fontes",
    "item_categorias",
    "itens",
    "item_fontes",
    "item_conteudos",
    "traducoes_pt_br",
  ];
  const tables = await sql.query(
    `SELECT table_name
       FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])`,
    [required],
  );
  const found = new Set(tables.map((row) => row.table_name));
  for (const table of required) {
    if (!found.has(table)) {
      throw new Error(`Tabela obrigatória ausente: ${table}.`);
    }
  }

  console.log("2/6 Registrando fonte comunitária e categoria Baú...");
  const sourceId = await ensureSource(sql);
  const categoryId = await ensureCategory(sql);

  console.log("3/6 Inserindo primeiro lote de baús/pacotes...");
  for (const chest of CHESTS) {
    await upsertChest(sql, chest, categoryId, sourceId);
    console.log(`   OK ${chest.nomePtBr} (${chest.raridade})`);
  }

  console.log("4/6 Classificando traduções comunitárias em PT-BR...");
  await backfillCommunityTranslationMeta(sql, sourceId);
  console.log("   OK metadados editoriais adicionados sem sobrescrever origens existentes.");

  console.log("5/6 Auditando baús e conteúdo interno...");
  const audit = await sql.query(
    `SELECT
       i.slug,
       i.nome,
       i.nome_pt_br,
       i.raridade,
       c.slug AS categoria,
       COUNT(ic.id)::int AS conteudos,
       tn.origem AS origem_nome
       FROM itens i
       LEFT JOIN item_categorias c ON c.id = i.categoria_id
       LEFT JOIN item_conteudos ic ON ic.item_origem_id = i.id
       LEFT JOIN traducoes_pt_br tn
         ON tn.entidade = 'itens'
        AND tn.entidade_id = i.id
        AND tn.campo = 'nome'
      WHERE i.slug = ANY($1::text[])
      GROUP BY i.id, i.slug, i.nome, i.nome_pt_br, i.raridade, c.slug, tn.origem
      ORDER BY i.slug`,
    [CHESTS.map((item) => item.slug)],
  );

  if (audit.length !== CHESTS.length) {
    throw new Error(`Auditoria encontrou ${audit.length}/${CHESTS.length} baús esperados.`);
  }

  for (const row of audit) {
    console.log(
      `   ${row.slug}: categoria=${row.categoria}, raridade=${row.raridade}, conteúdos=${row.conteudos}, PT-BR=${row.origem_nome ?? "em revisão"}`,
    );
  }

  console.log("6/6 Lote comunitário 02 concluído.");
  console.log(
    "\nBaús cadastrados sem inventar recompensas: item_conteudos continuará vazio até a composição ser confirmada por uma fonte verificável.",
  );
}

main().catch((error) => {
  console.error("\nFalha ao importar lote comunitário 02:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
