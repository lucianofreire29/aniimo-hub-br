import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const ITEM_IMAGES = [
  {
    slug: "aniipod",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-item.webp",
  },
  {
    slug: "aniipod-pro",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-pro-item.webp",
  },
  {
    slug: "aniipod-mega",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-mega-item.webp",
  },
  {
    slug: "aniipod-trace",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-trace-item.webp",
  },
  {
    slug: "aniipod-ultra",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-aniipod-ultra-item.webp",
  },
  {
    slug: "legendary-aniipod",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-legendary-aniipod-item.webp",
  },
  {
    slug: "sparkling-cube",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-sparkling-cube-item.webp",
  },
  {
    slug: "tumbler",
    imageUrl: "https://aniimoguide.com/images/items/aniimo-tumbler-item.webp",
  },
  {
    slug: "glimmer",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_1001.webp",
  },
  {
    slug: "super-egg-voucher",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_Grabegg_Coupon_HugeEgg.webp",
  },
  {
    slug: "egg-voucher",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_Grabegg_Coupon_BigEgg.webp",
  },
  {
    slug: "credit",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_2.webp",
  },
  {
    slug: "eggshell-coin",
    imageUrl: "https://aniimotools.dev/assets/items/ui_item_1014.webp",
  },
  {
    slug: "prismana-crystal",
    imageUrl: "https://cdn.aniimoverse.com/v1/items/prismana-crystal.webp",
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

async function main() {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não encontrada. Configure o .env.local antes de executar.");
  }

  const sql = neon(databaseUrl);

  console.log("1/4 Validando catálogo de itens...");
  const [table] = await sql.query(`
    SELECT COUNT(*)::int AS total
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = 'itens'
  `);

  if (table.total !== 1) {
    throw new Error("Tabela itens não encontrada. Execute npm.cmd run db:items:init primeiro.");
  }

  const [active] = await sql.query("SELECT COUNT(*)::int AS total FROM itens WHERE ativo = TRUE");
  if (active.total < ITEM_IMAGES.length) {
    throw new Error(`Catálogo possui apenas ${active.total} itens ativos; esperava pelo menos ${ITEM_IMAGES.length}.`);
  }

  console.log("2/4 Aplicando imagens verificadas...");
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
      RETURNING nome, nome_pt_br, slug, imagem_url`,
      [item.slug, item.imageUrl],
    );

    if (rows.length !== 1) {
      throw new Error(`Item esperado não encontrado ou inativo: ${item.slug}.`);
    }

    const row = rows[0];
    console.log(`   OK ${row.nome_pt_br ?? row.nome} | ${row.imagem_url}`);
  }

  console.log("3/4 Auditando cobertura de imagens...");
  const audit = await sql.query(
    `SELECT slug, nome, nome_pt_br, imagem_url
       FROM itens
      WHERE slug = ANY($1::text[])
      ORDER BY COALESCE(nome_pt_br, nome)`,
    [ITEM_IMAGES.map((item) => item.slug)],
  );

  if (audit.length !== ITEM_IMAGES.length) {
    throw new Error(`Auditoria encontrou ${audit.length}/${ITEM_IMAGES.length} itens esperados.`);
  }

  for (const row of audit) {
    if (!row.imagem_url) {
      throw new Error(`Item sem imagem após atualização: ${row.slug}.`);
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

  console.log("4/4 Finalizando...");
  console.log(`\nImagens de itens aplicadas. Cobertura atual: ${coverage.com_imagem}/${coverage.total}.`);
}

main().catch((error) => {
  console.error("\nFalha ao aplicar imagens dos itens:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
