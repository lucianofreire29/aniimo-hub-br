import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T12:20:00Z";

const FORMS = [
  {
    slug: "scorchhowl-mountain-woods",
    nomePtBr: "Forma das Florestas Montanhosas",
    descricaoPtBr:
      "Um Scorchhowl que vive nas florestas montanhosas parece ter absorvido toda a luz solar disponível em sua pelagem, irradiando uma luz dourada intensa.",
  },
  {
    slug: "scorchhowl-umbrabow",
    nomePtBr: "Forma Umbrabow",
    descricaoPtBr:
      "A energia instável de Prismana incendeia o espírito de Scorchhowl. Basta um olhar seu para que os corações mais fracos comecem a desmoronar!",
  },
  {
    slug: "inferlupa-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr:
      "Depois de ser derrotada ao desafiar adversários mais fortes, Inferlupa absorve as almas de companheiros caídos que compartilham da mesma frustração, transformando seu desejo de vingança em poder.",
  },
  {
    slug: "tubster-highland",
    nomePtBr: "Forma de Terras Altas",
    descricaoPtBr:
      "Tubsters que vivem nas terras altas enrolam folhas de grama para decorar o local. Sempre que seu chifre soa, o espetáculo nunca fica entediante.",
  },
  {
    slug: "cornet-highland",
    nomePtBr: "Forma de Terras Altas",
    descricaoPtBr:
      "Cornets que vivem nas terras altas adoram voar alto pela manhã, despertando tudo ao redor com chamados estridentes e ignorando completamente qualquer reclamação.",
  },
  {
    slug: "cornet-umbrabow",
    nomePtBr: "Forma Umbrabow",
    descricaoPtBr:
      "A energia instável de Prismana dá a Cornet um ritmo totalmente novo. Suas notas brilhantes e improvisadas atravessam o ar e, quando você percebe, já está se movendo ao som da música.",
  },
  {
    slug: "chirpi-beach",
    nomePtBr: "Forma de Praia",
    descricaoPtBr:
      "As algas misturadas à alimentação dos Chirpis tingem suas penas com a cor das ondas.",
  },
  {
    slug: "stellarys-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr:
      "Stellarys prefere a solidão e costuma se mover durante a noite. Com sua forma estrelada semelhante a um manto, lembra um mago misterioso e consegue se teleportar usando energia psíquica.",
  },
  {
    slug: "tromber-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr:
      "Tromber gosta de se divertir e produzir música ritmada, então não se surpreenda ao presenciar uma grande sinfonia.",
  },
  {
    slug: "tubster-basic",
    nomePtBr: "Forma Básica",
    descricaoPtBr:
      "Tubster produz sons graves semelhantes aos de uma tuba, combinando com seu jeito tranquilo e amigável.",
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

  console.log("2/4 Localizando formas — lote 02...");
  for (const entry of FORMS) {
    const rows = await sql.query(
      `UPDATE aniimo_formas
          SET nome_pt_br = $2,
              descricao_pt_br = $3,
              atualizado_em = NOW()
        WHERE slug = $1
        RETURNING id, nome, descricao`,
      [entry.slug, entry.nomePtBr, entry.descricaoPtBr],
    );

    if (rows.length !== 1) throw new Error(`Forma não encontrada: ${entry.slug}`);
    const row = rows[0];
    const id = Number(row.id);

    await saveTranslationMeta(
      sql,
      id,
      "nome",
      `Tradução editorial: ${row.nome} → ${entry.nomePtBr}.`,
    );
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
    `SELECT af.slug, af.nome, af.nome_pt_br, af.descricao_pt_br, a.nome AS aniimo
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
  console.error("\nFalha ao localizar formas — lote 02:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
