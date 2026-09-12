import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T12:40:00Z";

const FORMS = [
  {
    slug: "emberpup-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr: "Essas criaturas vivazes gostam de seguir os Flameruffs por toda parte. Quando a pelagem incandescente começa a queimar, elas prosperam.",
  },
  {
    slug: "emberpup-highland",
    nomePtBr: "Forma de Terras Altas",
    descricaoPtBr: "Emberpups que vivem nas montanhas têm a pelagem em tons semelhantes à rocha e um pelo desgrenhado moldado pelos ventos da montanha.",
  },
  {
    slug: "emberpup-mountain-woods",
    nomePtBr: "Forma das Florestas Montanhosas",
    descricaoPtBr: "Emberpups que vivem em florestas montanhosas ensolaradas têm pontas da pelagem em um amarelo-dourado quente, que parecem deixar rastros de luz solar enquanto correm.",
  },
  {
    slug: "flameruff-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr: "Criaturas de matilha que valorizam a lealdade e a união, esses caçadores mantêm olhos focados e serenos que escondem seus corações ardentes.",
  },
  {
    slug: "flameruff-highland",
    nomePtBr: "Forma de Terras Altas",
    descricaoPtBr: "Flameruffs que vivem nas montanhas têm camuflagem perfeita e garras revestidas de lava para correr em áreas extremamente quentes.",
  },
  {
    slug: "flameruff-mountain-woods",
    nomePtBr: "Forma das Florestas Montanhosas",
    descricaoPtBr: "Vivendo em florestas montanhosas, as pontas douradas de sua pelagem escura se destacam com força, demonstrando sua confiança e seu orgulho como líder da matilha.",
  },
  {
    slug: "scorchhowl-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr: "Eles apreciam a emoção da luta, pois as chamas e as queimaduras marcam seu crescimento.",
  },
  {
    slug: "scorchhowl-highland",
    nomePtBr: "Forma de Terras Altas",
    descricaoPtBr: "Suas patas dianteiras são cobertas de lava por golpearem rochas derretidas, permitindo que causem mais dano aos adversários.",
  },
  {
    slug: "scorchhowl-thunderstorm",
    nomePtBr: "Forma de Tempestade",
    descricaoPtBr: "Atingidos por raios, seus músculos são fortalecidos, e as chamas por todo o corpo ficam azuis enquanto queimam ainda mais intensamente.",
  },
  {
    slug: "scorchhowl-prismana",
    nomePtBr: "Forma Prismana",
    descricaoPtBr: "O calor irradia enquanto a prismana puxa as chamas de seus peitos e as entrelaça ao redor de seus corpos.",
  },
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
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function saveTranslationMeta(sql, entidadeId, campo, observacoes) {
  await sql.query(
    `INSERT INTO traducoes_pt_br (
       entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
     )
     VALUES ('aniimo_formas', $1, $2, 'ANIIMO_BRASIL', NULL, $3, $4::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
       origem = 'ANIIMO_BRASIL',
       observacoes = EXCLUDED.observacoes,
       revisado_em = EXCLUDED.revisado_em,
       atualizado_em = NOW()`,
    [entidadeId, campo, observacoes, REVIEWED_AT],
  );
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");

  const sql = neon(databaseUrl);

  console.log("1/4 Validando a estrutura PT-BR...");
  const required = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('aniimo_formas', 'traducoes_pt_br')
  `);
  if (required.length !== 2) {
    throw new Error("Estrutura PT-BR incompleta. Execute npm.cmd run db:ptbr:init primeiro.");
  }

  console.log("2/4 Localizando formas — lote 01...");
  for (const entry of FORMS) {
    const rows = await sql.query(
      `UPDATE aniimo_formas
          SET nome_pt_br = $2,
              descricao_pt_br = $3,
              atualizado_em = NOW()
        WHERE slug = $1
        RETURNING id, nome`,
      [entry.slug, entry.nomePtBr, entry.descricaoPtBr],
    );

    if (rows.length !== 1) throw new Error(`Forma não encontrada: ${entry.slug}`);
    const row = rows[0];

    await saveTranslationMeta(
      sql,
      Number(row.id),
      "nome",
      `Tradução editorial: ${row.nome} → ${entry.nomePtBr}.`,
    );
    await saveTranslationMeta(
      sql,
      Number(row.id),
      "descricao",
      "Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.",
    );

    console.log(`   OK ${row.nome} / ${entry.nomePtBr}`);
  }

  console.log("3/4 Auditando o lote...");
  const audit = await sql.query(
    `SELECT af.slug, af.nome, af.nome_pt_br, af.descricao_pt_br, a.nome AS aniimo
       FROM aniimo_formas af
       JOIN aniimos a ON a.id = af.aniimo_id
      WHERE af.slug = ANY($1::text[])
      ORDER BY a.numero, af.id`,
    [FORMS.map((entry) => entry.slug)],
  );

  if (audit.length !== FORMS.length) {
    throw new Error(`Auditoria encontrou ${audit.length} de ${FORMS.length} formas.`);
  }
  for (const row of audit) {
    if (!row.nome_pt_br || !row.descricao_pt_br) {
      throw new Error(`Forma sem localização completa: ${row.slug}`);
    }
    console.log(`   OK ${row.aniimo}: ${row.nome_pt_br}`);
  }

  console.log("4/4 Finalizando...");
  console.log("\nLote PT-BR concluído: 10 formas localizadas.");
}

main().catch((error) => {
  console.error("\nFalha ao localizar formas — lote 01:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
