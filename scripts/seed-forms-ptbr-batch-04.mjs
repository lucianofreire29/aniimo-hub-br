import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T12:30:00Z";
const START_ID = 31;
const END_ID = 80;
const EXPECTED_COUNT = 50;

const FORM_NAMES_PT_BR = {
  "Basic Form": "Forma Básica",
  "Beach Form": "Forma de Praia",
  "Prismana Form": "Forma Prismana",
  "Mountain Woods Form": "Forma das Florestas Montanhosas",
  "Plateau Form": "Forma de Planalto",
  "Grassland Form": "Forma de Pradaria",
  "Forest Form": "Forma de Floresta",
  "Highland Form": "Forma de Terras Altas",
  "Snowfield Form": "Forma de Campo Nevado",
  "Sea of Flowers Form": "Forma do Mar de Flores",
  "Cloudmist Form": "Forma de Névoa das Nuvens",
  "Rainstorm Form": "Forma de Temporal",
  "Umbrabow Form": "Forma Umbrabow",
  "Mountain Form": "Forma de Montanha",
  "Bay Form": "Forma de Baía",
  "Mudflat Form": "Forma de Planície de Maré",
};

const DESCRIPTION_PT_BR = {
  "tubster-beach":
    "Enquanto tocam, as ondas crescem e se sincronizam com o ritmo, como se o mar respondesse à melodia.",
  "cornet-prismana":
    "A Prismana aprimorou seus órgãos vocais, permitindo que imitem os sons de outros instrumentos para acompanhar a própria música.",
  "sparki-sea-of-flowers":
    "Embora pareçam fogo, essas chamas são apenas energia em movimento. Elas não emitem calor algum — na verdade, absorvem o calor ao redor. Às vezes usam isso para se disfarçar de fogueiras e pregar peças nos outros.",
  "sparki-forest":
    "Embora pareçam fogo, essas chamas são apenas energia em movimento. Elas não emitem calor algum — na verdade, absorvem o calor ao redor. Às vezes usam isso para se disfarçar de fogueiras e pregar peças nos outros.",
  "sparki-highland":
    "Embora pareçam fogo, essas chamas são apenas energia em movimento. Elas não emitem calor algum — na verdade, absorvem o calor ao redor. Às vezes usam isso para se disfarçar de fogueiras e pregar peças nos outros.",
  "sparki-basic":
    "Embora pareçam fogo, essas chamas são apenas energia em movimento. Elas não emitem calor algum — na verdade, absorvem o calor ao redor. Às vezes usam isso para se disfarçar de fogueiras e pregar peças nos outros.",
  "hummin-mountain":
    "Vivem em grupos nas pradarias, gostam de cavar em busca de nutrientes e adoram cantar juntos — sempre desafinados!",
  "hummin-basic":
    "Vivem em grupos nas pradarias, gostam de cavar em busca de nutrientes e adoram cantar juntos — sempre desafinados!",
  "budclaw-bay":
    "Formam pares para a vida toda e são sempre encontrados em dupla. A Heartbloom no topo de suas conchas indica seu estado de felicidade.",
  "budclaw-beach":
    "Formam pares para a vida toda e são sempre encontrados em dupla. A Heartbloom no topo de suas conchas indica seu estado de felicidade.",
  "budclaw-mudflat":
    "Formam pares para a vida toda e são sempre encontrados em dupla. A Heartbloom no topo de suas conchas indica seu estado de felicidade.",
  "budclaw-basic":
    "Formam pares para a vida toda e são sempre encontrados em dupla. A Heartbloom no topo de suas conchas indica seu estado de felicidade.",
  "flutternym-mountain-woods":
    "São tímidos e se escondem sempre que percebem perigo, mas as escamas fluorescentes que soltam sempre acabam denunciando sua presença.",
};

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

  console.log("1/4 Validando o lote grande de formas...");
  const rows = await sql.query(
    `SELECT id, nome, slug, descricao
       FROM aniimo_formas
      WHERE id BETWEEN $1 AND $2
      ORDER BY id`,
    [START_ID, END_ID],
  );

  if (rows.length !== EXPECTED_COUNT) {
    throw new Error(
      `Esperadas ${EXPECTED_COUNT} formas entre IDs ${START_ID}-${END_ID}, mas foram encontradas ${rows.length}.`,
    );
  }

  for (const row of rows) {
    if (!FORM_NAMES_PT_BR[row.nome]) {
      throw new Error(`Nome de forma sem tradução no glossário: ${row.nome} (${row.slug}).`);
    }
    if (row.descricao && !DESCRIPTION_PT_BR[row.slug]) {
      throw new Error(`Descrição oficial sem tradução preparada: ${row.slug}.`);
    }
  }

  console.log("2/4 Localizando formas 31–80...");
  let translatedDescriptions = 0;

  for (const row of rows) {
    const nomePtBr = FORM_NAMES_PT_BR[row.nome];
    const descricaoPtBr = DESCRIPTION_PT_BR[row.slug] ?? null;

    await sql.query(
      `UPDATE aniimo_formas
          SET nome_pt_br = $2,
              descricao_pt_br = COALESCE($3, descricao_pt_br),
              atualizado_em = NOW()
        WHERE id = $1`,
      [Number(row.id), nomePtBr, descricaoPtBr],
    );

    await saveTranslationMeta(
      sql,
      Number(row.id),
      "nome",
      `Tradução editorial: ${row.nome} → ${nomePtBr}.`,
    );

    if (descricaoPtBr) {
      translatedDescriptions += 1;
      await saveTranslationMeta(
        sql,
        Number(row.id),
        "descricao",
        "Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.",
      );
    }
  }

  console.log(`   OK ${rows.length} nomes de formas localizados.`);
  console.log(`   OK ${translatedDescriptions} descrições existentes traduzidas.`);

  console.log("3/4 Auditando o lote...");
  const audit = await sql.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL)::int AS nomes_pt_br,
       COUNT(*) FILTER (
         WHERE descricao IS NOT NULL AND descricao_pt_br IS NOT NULL
       )::int AS descricoes_pt_br,
       COUNT(*) FILTER (WHERE descricao IS NOT NULL)::int AS descricoes_origem
     FROM aniimo_formas
    WHERE id BETWEEN $1 AND $2`,
    [START_ID, END_ID],
  );

  const result = audit[0];
  if (result.total !== EXPECTED_COUNT || result.nomes_pt_br !== EXPECTED_COUNT) {
    throw new Error(
      `Auditoria inválida: total=${result.total}, nomes_pt_br=${result.nomes_pt_br}.`,
    );
  }
  if (result.descricoes_pt_br !== result.descricoes_origem) {
    throw new Error(
      `Há descrições sem PT-BR: ${result.descricoes_pt_br}/${result.descricoes_origem}.`,
    );
  }

  console.log(`   OK ${result.nomes_pt_br}/${result.total} nomes em PT-BR.`);
  console.log(`   OK ${result.descricoes_pt_br}/${result.descricoes_origem} descrições existentes em PT-BR.`);

  console.log("4/4 Finalizando...");
  console.log(
    `\nLote PT-BR concluído: ${EXPECTED_COUNT} formas localizadas (IDs ${START_ID}–${END_ID}).`,
  );
}

main().catch((error) => {
  console.error("\nFalha ao localizar o lote grande de formas:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
