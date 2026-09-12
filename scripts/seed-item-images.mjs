import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const VERIFIED_AT = "2026-09-12T20:30:00Z";

const ITEM_IMAGES = [
  {
    slug: "aniipod",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-item.webp",
    provider: "AniimoGuide",
  },
  {
    slug: "aniipod-pro",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-pro-item.webp",
    provider: "AniimoGuide",
  },
  {
    slug: "aniipod-mega",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-mega-item.webp",
    provider: "AniimoGuide",
  },
  {
    slug: "aniipod-trace",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-trace-item.webp",
    provider: "AniimoGuide",
  },
  {
    slug: "aniipod-ultra",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-ultra-item.webp",
    provider: "AniimoGuide",
  },
  {
    slug: "legendary-aniipod",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-legendary-aniipod-item.webp",
    provider: "AniimoGuide",
  },
  {
    slug: "sparkling-cube",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-sparkling-cube-item.webp",
    provider: "AniimoGuide",
  },
  {
    slug: "tumbler",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-tumbler-item.webp",
    provider: "AniimoGuide",
  },
  {
    slug: "glimmer",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_1001.webp",
    provider: "AniimoTools",
  },
  {
    slug: "super-egg-voucher",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_Grabegg_Coupon_HugeEgg.webp",
    provider: "AniimoTools",
  },
  {
    slug: "egg-voucher",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_Grabegg_Coupon_BigEgg.webp",
    provider: "AniimoTools",
  },
  {
    slug: "credit",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_2.webp",
    provider: "AniimoTools",
  },
  {
    slug: "eggshell-coin",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_1014.webp",
    provider: "AniimoTools",
  },
  {
    slug: "prismana-crystal",
    imageUrl: "https://cdn.aniimoverse.com/v1/items/prismana-crystal.webp",
    provider: "AniimoVerse",
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

async function ensureImageSource(sql, item) {
  const existing = await sql.query(
    "SELECT id FROM fontes WHERE url = $1 LIMIT 1",
    [item.imageUrl],
  );

  if (existing.length) {
    await sql.query(
      `UPDATE fontes
          SET verificado_em = CASE
                WHEN verificado_em IS NULL OR verificado_em < $2::timestamptz THEN $2::timestamptz
                ELSE verificado_em
              END,
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
            $1,
            'COMUNIDADE_ASSET',
            $2,
            NULL,
            $3::timestamptz,
            $4,
            NOW(),
            NOW()
       FROM fontes
     RETURNING id`,
    [
      `Imagem de item - ${item.provider}`,
      item.imageUrl,
      VERIFIED_AT,
      `Asset comunitário referenciado a partir de ${item.provider}. Uso no Aniimo Brasil com procedência registrada; não é tratado como publicação oficial.`,
    ],
  );

  return Number(inserted.id);
}

async function main() {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não encontrada. Configure o .env.local antes de executar.");
  }

  const sql = neon(databaseUrl);

  console.log("1/5 Validando catálogo e rastreabilidade...");
  const tables = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('fontes', 'itens', 'item_fontes')
  `);

  const tableNames = new Set(tables.map((row) => row.table_name));
  for (const table of ["fontes", "itens", "item_fontes"]) {
    if (!tableNames.has(table)) {
      throw new Error(`Tabela obrigatória ausente: ${table}. Execute npm.cmd run db:items:init primeiro.`);
    }
  }

  const [active] = await sql.query("SELECT COUNT(*)::int AS total FROM itens WHERE ativo = TRUE");
  if (active.total < ITEM_IMAGES.length) {
    throw new Error(`Catálogo possui apenas ${active.total} itens ativos; esperava pelo menos ${ITEM_IMAGES.length}.`);
  }

  console.log("2/5 Aplicando imagens verificadas...");
  for (const item of ITEM_IMAGES) {
    const rows = await sql.query(
      `UPDATE itens
          SET imagem_url = CASE
                WHEN imagem_url IS NULL OR BTRIM(imagem_url) = '' THEN $2
                ELSE imagem_url
              END,
              atualizado_em = NOW()
        WHERE slug = $1
          AND ativo = TRUE
      RETURNING id, nome, nome_pt_br, slug, imagem_url`,
      [item.slug, item.imageUrl],
    );

    if (rows.length !== 1) {
      throw new Error(`Item esperado não encontrado ou inativo: ${item.slug}.`);
    }

    const row = rows[0];
    console.log(`   OK ${row.nome_pt_br ?? row.nome} | ${row.imagem_url}`);
  }

  console.log("3/5 Registrando procedência das imagens...");
  for (const item of ITEM_IMAGES) {
    const [itemRow] = await sql.query(
      `SELECT id, COALESCE(nome_pt_br, nome) AS nome
         FROM itens
        WHERE slug = $1
          AND ativo = TRUE
        LIMIT 1`,
      [item.slug],
    );

    if (!itemRow) {
      throw new Error(`Item ausente ao registrar fonte de imagem: ${item.slug}.`);
    }

    const sourceId = await ensureImageSource(sql, item);

    await sql.query(
      `INSERT INTO item_fontes (
         item_id, fonte_id, patch_id, escopo, observacoes, principal, verificado_em, atualizado_em
       )
       VALUES (
         $1, $2, NULL, 'IMAGEM', $3, FALSE, $4::timestamptz, NOW()
       )
       ON CONFLICT (item_id, fonte_id, patch_id, escopo) DO UPDATE SET
         observacoes = EXCLUDED.observacoes,
         verificado_em = EXCLUDED.verificado_em,
         atualizado_em = NOW()`,
      [
        itemRow.id,
        sourceId,
        `Imagem exibida no catálogo. Origem comunitária: ${item.provider}.`,
        VERIFIED_AT,
      ],
    );

    console.log(`   OK ${itemRow.nome} <- ${item.provider}`);
  }

  console.log("4/5 Auditando cobertura e fontes de imagem...");
  const audit = await sql.query(
    `SELECT
       i.slug,
       i.nome,
       i.nome_pt_br,
       i.imagem_url,
       COUNT(fx.id) FILTER (WHERE fx.escopo = 'IMAGEM')::int AS fontes_imagem
       FROM itens i
       LEFT JOIN item_fontes fx ON fx.item_id = i.id
      WHERE i.slug = ANY($1::text[])
      GROUP BY i.id, i.slug, i.nome, i.nome_pt_br, i.imagem_url
      ORDER BY COALESCE(i.nome_pt_br, i.nome)`,
    [ITEM_IMAGES.map((item) => item.slug)],
  );

  if (audit.length !== ITEM_IMAGES.length) {
    throw new Error(`Auditoria encontrou ${audit.length}/${ITEM_IMAGES.length} itens esperados.`);
  }

  for (const row of audit) {
    if (!row.imagem_url) {
      throw new Error(`Item sem imagem após atualização: ${row.slug}.`);
    }
    if (row.fontes_imagem < 1) {
      throw new Error(`Item sem procedência de imagem registrada: ${row.slug}.`);
    }
  }

  const [coverage] = await sql.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE imagem_url IS NOT NULL AND BTRIM(imagem_url) <> '')::int AS com_imagem
      FROM itens
     WHERE ativo = TRUE
  `);

  console.log(`   OK ${coverage.com_imagem}/${coverage.total} itens ativos com imagem.`);
  console.log(`   OK ${ITEM_IMAGES.length}/${ITEM_IMAGES.length} imagens mapeadas com procedência.`);

  const missing = await sql.query(`
    SELECT COALESCE(nome_pt_br, nome) AS nome, slug
      FROM itens
     WHERE ativo = TRUE
       AND (imagem_url IS NULL OR BTRIM(imagem_url) = '')
     ORDER BY COALESCE(nome_pt_br, nome)
  `);

  if (missing.length) {
    console.log("   Pendentes de asset confiável:");
    for (const row of missing) {
      console.log(`   - ${row.nome} (${row.slug})`);
    }
  }

  console.log("5/5 Finalizando...");
  console.log(`\nImagens aplicadas com procedência registrada. Cobertura atual: ${coverage.com_imagem}/${coverage.total}.`);
}

main().catch((error) => {
  console.error("\nFalha ao aplicar imagens dos itens:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
