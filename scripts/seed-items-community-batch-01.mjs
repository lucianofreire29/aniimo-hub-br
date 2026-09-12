import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const VERIFIED_AT = "2026-09-12T16:45:00Z";

const ITEMS = [
  {
    nome: "Auspicious Bell",
    nomePtBr: "Sino Auspicioso",
    slug: "auspicious-bell",
    categoria: ["Carried Item", "Item Carregado", "carried-item"],
    raridade: "Legendary",
    qualidade: "Carried Item",
    cp: 200,
    descricao: "Legendary carried item focused on REGEN and team energy generation.",
    descricaoPtBr: "Item carregado lendário voltado para REGEN e geração de energia para a equipe.",
    sourceUrl: "https://aniidex.com/items/auspicious-bell/?id=551016",
    effects: [
      { nivel: 0, ordem: 0, tipo: "ATRIBUTO", atributo: "REGEN", valor: 10, unidade: "%", descricao: "Base REGEN bonus +10%.", descricaoPtBr: "Bônus-base de REGEN +10%." },
      { nivel: 0, ordem: 1, tipo: "PASSIVO", atributo: "EP", valor: 20, unidade: "% chance", descricao: "Using a skill has a 20% chance to grant 5 EP.", descricaoPtBr: "Ao usar uma habilidade, há 20% de chance de ganhar 5 EP." },
      { nivel: 10, ordem: 0, tipo: "PASSIVO", atributo: null, valor: null, unidade: null, descricao: "After five consecutive failures, the next skill guarantees the passive trigger.", descricaoPtBr: "Após cinco falhas consecutivas, a próxima habilidade garante a ativação do passivo." },
      { nivel: 20, ordem: 0, tipo: "PASSIVO", atributo: "EP/Luck", valor: null, unidade: null, descricao: "When a Core Bonus REGEN effect triggers, grants extra EP and team Luck.", descricaoPtBr: "Quando um bônus central de REGEN é ativado, concede EP extra e Sorte para a equipe." },
    ],
    obtains: [
      { tipo: "ALPHA", titulo: "Derrotar Alpha Magmarex", descricao: "Possible Legendary reward at listed player ranks.", localNome: null },
      { tipo: "SHOP", titulo: "Pawprint Shop", descricao: "Listed for 250 Paw Coin.", localNome: "Astra Square" },
    ],
  },
  {
    nome: "Sparkling Cube",
    nomePtBr: "Cubo Cintilante",
    slug: "sparkling-cube",
    categoria: ["Capture", "Captura", "capture"],
    raridade: "Prismatic",
    qualidade: "Aniipod",
    cp: null,
    descricao: "Very rare capture item that guarantees the catch and a Sparkling Aniimo with at least Elite Acquired Potential.",
    descricaoPtBr: "Item de captura muito raro que garante a captura e um Aniimo Cintilante com Potencial Adquirido de pelo menos nível Elite.",
    sourceUrl: "https://aniidex.com/items/sparkling-cube/",
    effects: [],
    obtains: [
      { tipo: "BATTLE_PASS", titulo: "Elite Training", descricao: null, localNome: null },
      { tipo: "SHOP", titulo: "Fun Stamp Collection Shop", descricao: null, localNome: null },
      { tipo: "HANDBOOK", titulo: "Companion Handbook", descricao: null, localNome: null },
      { tipo: "ITEM_EXCHANGE", titulo: "Item Exchange", descricao: null, localNome: null },
      { tipo: "SHOP", titulo: "Lumen", descricao: "Listed for 100 Sparkling Crystal.", localNome: null },
    ],
  },
  {
    nome: "Tumbler",
    nomePtBr: "Roletor",
    slug: "tumbler",
    categoria: ["Capture", "Captura", "capture"],
    raridade: "Epic",
    qualidade: "Aniipod",
    cp: null,
    descricao: "Special Aniipod with increased capture chance, with a larger bonus for nurture-gathered Aniimo.",
    descricaoPtBr: "Aniicápsula especial com chance de captura aumentada e bônus maior para Aniimos reunidos por nurture.",
    sourceUrl: "https://aniidex.com/items/tumbler/",
    effects: [],
    obtains: [
      { tipo: "BATTLE_PASS", titulo: "Elite Training", descricao: null, localNome: null },
      { tipo: "OTHER", titulo: "Glimmer Purchase", descricao: null, localNome: null },
      { tipo: "EXPLORATION", titulo: "Complete Quests", descricao: null, localNome: null },
      { tipo: "SHOP", titulo: "Shop", descricao: "Listed for 5,000 Credits.", localNome: null },
      { tipo: "CHEST", titulo: "Chest", descricao: null, localNome: null },
    ],
  },
  {
    nome: "Aniipod Ultra Voucher",
    nomePtBr: "Voucher de Aniicápsula Ultra",
    slug: "aniipod-ultra-voucher",
    categoria: ["Currency", "Moeda", "currency"],
    raridade: "Legendary",
    qualidade: "Currency",
    cp: null,
    descricao: "Exchange currency: 20 vouchers can be traded for one Aniipod Ultra at an outpost vendor.",
    descricaoPtBr: "Moeda de troca: 20 vouchers podem ser trocados por uma Aniicápsula Ultra em um vendedor de posto avançado.",
    sourceUrl: "https://aniidex.com/items/aniipod-ultra-voucher/",
    effects: [],
    obtains: [
      { tipo: "BATTLE_PASS", titulo: "Elite Training", descricao: null, localNome: null },
      { tipo: "RIFT", titulo: "Holo-Battle Sim", descricao: null, localNome: null },
      { tipo: "CRAFTING", titulo: "Sanctum Clear", descricao: null, localNome: null },
      { tipo: "ADVENTURE_RANK", titulo: "Adventure Rank", descricao: null, localNome: null },
      { tipo: "CHEST", titulo: "Chest", descricao: null, localNome: null },
    ],
  },
  {
    nome: "Crevice Beacon",
    nomePtBr: "Farol da Fenda",
    slug: "crevice-beacon",
    categoria: ["Materials", "Materiais", "materials"],
    raridade: "Legendary",
    qualidade: "Materials",
    cp: null,
    descricao: "Material used inside a Vein Crevice to lure a Legendary Aniimo.",
    descricaoPtBr: "Material usado dentro de uma Fenda de Veio para atrair um Aniimo Lendário.",
    sourceUrl: "https://aniidex.com/items/crevice-beacon/",
    effects: [],
    obtains: [
      { tipo: "SHOP", titulo: "Crevice Exploration Shop", descricao: null, localNome: null },
      { tipo: "EVENT", titulo: "Tracing the Trail", descricao: "Listed as an event source.", localNome: null },
      { tipo: "HANDBOOK", titulo: "Companion Handbook", descricao: null, localNome: null },
      { tipo: "SHOP", titulo: "Shop", descricao: "Listed for 300 Glimmer.", localNome: null },
    ],
  },
  {
    nome: "Wheat",
    nomePtBr: "Trigo",
    slug: "wheat",
    categoria: ["Home materials", "Materiais da Casa", "home-materials"],
    raridade: "Rare",
    qualidade: "Home materials",
    cp: null,
    descricao: "Basic Home crop material produced by farmland and used in further production.",
    descricaoPtBr: "Material agrícola básico da Casa, produzido em terras de cultivo e usado em outras produções.",
    sourceUrl: "https://aniidex.com/items/wheat/?id=4001000",
    effects: [],
    obtains: [
      { tipo: "HOME", titulo: "Home Planting", descricao: "Produced by farmland in the Home.", localNome: "Home" },
    ],
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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function ensureSource(sql, url, itemName) {
  const existing = await sql.query(`SELECT id FROM fontes WHERE url = $1 LIMIT 1`, [url]);
  if (existing.length) {
    await sql.query(`UPDATE fontes SET verificado_em = $2::timestamptz, atualizado_em = NOW() WHERE id = $1`, [existing[0].id, VERIFIED_AT]);
    return Number(existing[0].id);
  }
  const inserted = await sql.query(
    `INSERT INTO fontes (id, titulo, tipo, url, data_publicacao, verificado_em, observacoes, criado_em, atualizado_em)
     SELECT COALESCE(MAX(id), 0) + 1, $1, 'COMUNIDADE_ANIIDEX', $2, NULL, $3::timestamptz,
            'Base comunitária não oficial usada como referência temporária até confirmação oficial.', NOW(), NOW()
       FROM fontes RETURNING id`,
    [`Aniidex - ${itemName}`, url, VERIFIED_AT],
  );
  return Number(inserted[0].id);
}

async function ensureCategory(sql, [name, namePtBr, slug]) {
  const [row] = await sql.query(
    `INSERT INTO item_categorias (nome, nome_pt_br, slug, atualizado_em)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (slug) DO UPDATE SET nome_pt_br = COALESCE(item_categorias.nome_pt_br, EXCLUDED.nome_pt_br), atualizado_em = NOW()
     RETURNING id`,
    [name, namePtBr, slug],
  );
  return Number(row.id);
}

async function upsertItem(sql, item, categoryId, sourceId) {
  const existing = await sql.query(
    `SELECT id, slug FROM itens WHERE LOWER(nome) = LOWER($1) OR slug = $2 ORDER BY CASE WHEN slug = $2 THEN 0 ELSE 1 END LIMIT 1`,
    [item.nome, item.slug],
  );
  if (existing.length) {
    const [saved] = await sql.query(
      `UPDATE itens SET
         nome_pt_br = COALESCE(nome_pt_br, $2), descricao = $3, descricao_pt_br = $4,
         categoria_id = $5, raridade = $6, qualidade = $7, cp = $8,
         ultima_verificacao = $9::timestamptz, ativo = TRUE, atualizado_em = NOW()
       WHERE id = $1 RETURNING id`,
      [existing[0].id, item.nomePtBr, item.descricao, item.descricaoPtBr, categoryId, item.raridade, item.qualidade, item.cp, VERIFIED_AT],
    );
    return Number(saved.id);
  }
  const [saved] = await sql.query(
    `INSERT INTO itens (
       nome, nome_pt_br, slug, descricao, descricao_pt_br, categoria_id,
       raridade, qualidade, cp, fonte_id, ultima_verificacao, ativo, atualizado_em
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamptz, TRUE, NOW()) RETURNING id`,
    [item.nome, item.nomePtBr, item.slug, item.descricao, item.descricaoPtBr, categoryId, item.raridade, item.qualidade, item.cp, sourceId, VERIFIED_AT],
  );
  return Number(saved.id);
}

async function replaceCommunityRelations(sql, itemId, sourceId, item) {
  await sql.query(`DELETE FROM item_obtencoes WHERE item_id = $1 AND fonte_id = $2`, [itemId, sourceId]);
  await sql.query(`DELETE FROM item_efeitos WHERE item_id = $1 AND fonte_id = $2`, [itemId, sourceId]);
  await sql.query(
    `INSERT INTO item_fontes (item_id, fonte_id, escopo, observacoes, principal, verificado_em, atualizado_em)
     VALUES ($1, $2, 'CATALOGO_COMUNITARIO', 'Dados comunitários sujeitos a revisão após patches ou confirmação oficial.', FALSE, $3::timestamptz, NOW())
     ON CONFLICT (item_id, fonte_id, patch_id, escopo) DO UPDATE SET observacoes = EXCLUDED.observacoes, verificado_em = EXCLUDED.verificado_em, atualizado_em = NOW()`,
    [itemId, sourceId, VERIFIED_AT],
  );
  for (const obtain of item.obtains) {
    await sql.query(
      `INSERT INTO item_obtencoes (item_id, tipo, titulo, descricao, local_nome, fonte_id, verificado_em, ativo, atualizado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, TRUE, NOW())`,
      [itemId, obtain.tipo, obtain.titulo, obtain.descricao, obtain.localNome, sourceId, VERIFIED_AT],
    );
  }
  for (const effect of item.effects) {
    await sql.query(
      `INSERT INTO item_efeitos (
         item_id, nivel_melhoria, ordem, tipo, atributo, valor_numerico, unidade,
         descricao, descricao_pt_br, fonte_id, verificado_em, ativo, atualizado_em
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamptz, TRUE, NOW())`,
      [itemId, effect.nivel, effect.ordem, effect.tipo, effect.atributo, effect.valor, effect.unidade, effect.descricao, effect.descricaoPtBr, sourceId, VERIFIED_AT],
    );
  }
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/5 Validando schema do catálogo...");
  const required = ["fontes", "item_categorias", "itens", "item_fontes", "item_obtencoes", "item_efeitos"];
  const tables = await sql.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])`, [required]);
  const found = new Set(tables.map((row) => row.table_name));
  for (const table of required) if (!found.has(table)) throw new Error(`Tabela obrigatória ausente: ${table}. Rode npm.cmd run db:items:init.`);

  console.log("2/5 Registrando categorias e fontes comunitárias...");
  const categoryIds = new Map();
  for (const item of ITEMS) {
    if (!categoryIds.has(item.categoria[2])) categoryIds.set(item.categoria[2], await ensureCategory(sql, item.categoria));
  }

  console.log("3/5 Inserindo primeiro lote variado...");
  for (const item of ITEMS) {
    const sourceId = await ensureSource(sql, item.sourceUrl, item.nome);
    const itemId = await upsertItem(sql, item, categoryIds.get(item.categoria[2]), sourceId);
    await replaceCommunityRelations(sql, itemId, sourceId, item);
    console.log(`   OK ${item.nome} (${item.categoria[0]})`);
  }

  console.log("4/5 Auditando relações...");
  const names = ITEMS.map((item) => item.nome.toLowerCase());
  const rows = await sql.query(
    `SELECT LOWER(i.nome) AS nome_chave, i.slug, c.slug AS categoria,
            COUNT(DISTINCT io.id)::int AS obtencoes,
            COUNT(DISTINCT ie.id)::int AS efeitos,
            COUNT(DISTINCT inf.id)::int AS fontes
       FROM itens i
       LEFT JOIN item_categorias c ON c.id = i.categoria_id
       LEFT JOIN item_obtencoes io ON io.item_id = i.id
       LEFT JOIN item_efeitos ie ON ie.item_id = i.id
       LEFT JOIN item_fontes inf ON inf.item_id = i.id
      WHERE LOWER(i.nome) = ANY($1::text[])
      GROUP BY i.nome, i.slug, c.slug
      ORDER BY i.nome`,
    [names],
  );
  if (rows.length !== ITEMS.length) throw new Error(`Lote incompleto: esperava ${ITEMS.length} itens e encontrei ${rows.length}.`);
  for (const row of rows) console.log(`   ${row.slug}: categoria=${row.categoria}, obtenções=${row.obtencoes}, efeitos=${row.efeitos}, fontes=${row.fontes}`);

  console.log("5/5 Lote comunitário 01 concluído.");
  console.log("\nDados do Aniidex foram registrados como fonte comunitária não oficial e podem ser revisados por patch.");
}

main().catch((error) => {
  console.error("\nFalha ao importar o lote comunitário 01:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
