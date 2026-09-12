import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T12:35:00Z";

const FORMS = [
  {
    slug: "tromber-highland",
    nomePtBr: "Forma de Terras Altas",
    descricaoPtBr:
      "Tromber que vive nas terras altas adora passear sob a luz do sol, tocando melodias com seus chifres em forma de flor ao som da brisa da montanha.",
  },
  {
    slug: "cornet-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr:
      "Cornet consegue produzir sons altos e penetrantes que ecoam por toda a praia apenas para chamar atenção.",
  },
  {
    slug: "tromber-beach",
    nomePtBr: "Forma de Praia",
    descricaoPtBr:
      "Tromber adora caminhar sob a brisa do mar e está sempre de bom humor. Às vezes, simplesmente começa a tocar e dançar.",
  },
  {
    slug: "chirpi-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr:
      "Chirpi costuma pairar em baixa altitude, atento a cada movimento na praia para não perder nenhuma oportunidade.",
  },
  {
    slug: "stellarys-rainstorm",
    nomePtBr: "Forma de Temporal",
    descricaoPtBr:
      "Stellarys nascido durante a estação chuvosa é encontrado com mais frequência em dias de chuva, pois sua pele fina precisa de umidade constante.",
  },
  {
    slug: "chirpi-highland",
    nomePtBr: "Forma de Terras Altas",
    descricaoPtBr:
      "Chirpi que vive nas terras altas tem penas da cor de folhas secas. Uma plumagem macia cobre seus olhos, dando-lhe um ar descontraído.",
  },
  {
    slug: "cornet-beach",
    nomePtBr: "Forma de Praia",
    descricaoPtBr:
      "Do alto de um recife, Cornet tenta fazer sua voz chegar ainda mais longe, como se esperasse ouvir um eco vindo do outro lado do mar.",
  },
  {
    slug: "stellarys-prismana",
    nomePtBr: "Forma Prismana",
    descricaoPtBr:
      "A Prismana colore o manto de alguns Stellarys com tons de arco-íris e os torna mais poderosos.",
  },
  {
    slug: "celestis-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr:
      "Celestis adora comida! Ao procurar alimento pela floresta, as estrelas brilhantes em sua cabeça costumam ser confundidas com cometas. Também gosta de acumular comida e usá-la para enfeitar seu ninho.",
  },
  {
    slug: "stellarys-umbrabow",
    nomePtBr: "Forma Umbrabow",
    descricaoPtBr:
      "A energia instável de Prismana atravessa o manto de Stellarys e se espalha em cores mutáveis, como um fragmento de aurora recortado do céu.",
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

  console.log("2/4 Localizando formas — lote 03...");
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
    const id = Number(row.id);

    await saveTranslationMeta(sql, id, "nome", `Tradução editorial: ${row.nome} → ${entry.nomePtBr}.`);
    await saveTranslationMeta(
      sql,
      id,
      "descricao",
      "Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.",
    );

    console.log(`   OK ${row.nome} / ${entry.nomePtBr}`);
  }

  console.log("3/4 Auditando o lote...");
  const audit = await sql.query(
    `SELECT af.slug, af.nome_pt_br, af.descricao_pt_br, a.nome AS aniimo
       FROM aniimo_formas af
       JOIN aniimos a ON a.id = af.aniimo_id
      WHERE af.slug = ANY($1::text[])
      ORDER BY af.id`,
    [FORMS.map((entry) => entry.slug)],
  );

  if (audit.length !== FORMS.length) {
    throw new Error(`Auditoria encontrou ${audit.length} de ${FORMS.length} formas esperadas.`);
  }

  for (const row of audit) {
    if (!row.nome_pt_br || !row.descricao_pt_br) {
      throw new Error(`Forma sem localização completa: ${row.slug}`);
    }
    console.log(`   OK ${row.aniimo}: ${row.nome_pt_br}`);
  }

  console.log("4/4 Finalizando...");
  console.log(`\nLote PT-BR concluído: ${audit.length} formas localizadas.`);
}

main().catch((error) => {
  console.error("\nFalha ao localizar formas — lote 03:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
