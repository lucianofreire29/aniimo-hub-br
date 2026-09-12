import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T13:10:00Z";
const START_ID = 81;
const END_ID = 130;
const EXPECTED_COUNT = 50;

const FORM_NAMES_PT_BR = {
  "Basic Form": "Forma Básica",
  "Nighttime Form": "Forma Noturna",
  "Sea of Flowers Form": "Forma do Mar de Flores",
  "Umbrabow Form": "Forma Umbrabow",
  "Prismana Form": "Forma Prismana",
  "Mountain Form": "Forma de Montanha",
  "Forest Form": "Forma de Floresta",
  "Highland Form": "Forma de Terras Altas",
  "Bay Form": "Forma de Baía",
  "Beach Form": "Forma de Praia",
  "Mudflat Form": "Forma de Planície de Maré",
  "Mountain Woods Form": "Forma das Florestas Montanhosas",
  "Towerwood Form": "Forma Towerwood",
  "Rainstorm Form": "Forma de Temporal",
  "Snowfield Form": "Forma de Campo Nevado",
};

const DESCRIPTION_PT_BR = {};

function addDescriptions(slugs, translation) {
  for (const slug of slugs) DESCRIPTION_PT_BR[slug] = translation;
}

addDescriptions(
  ["flutternym-nighttime", "flutternym-sea-of-flowers", "flutternym-basic"],
  "São tímidos e se escondem sempre que percebem perigo, mas as escamas fluorescentes que soltam sempre acabam denunciando sua presença.",
);

addDescriptions(
  ["witchin-umbrabow", "witchin-prismana", "witchin-mountain", "witchin-basic"],
  "Produzem ruídos estranhos para levar invasores à loucura, reduzir suas defesas e até fazê-los desmaiar.",
);

addDescriptions(
  ["flamerion-sea-of-flowers", "flamerion-forest", "flamerion-highland", "flamerion-basic"],
  "Só aparecem à noite, e seus corpos são feitos de energia gasosa, podendo se dividir à vontade!",
);

addDescriptions(
  ["tuckin-mountain", "tuckin-basic"],
  "Precisam absorver nutrientes do solo por suas raízes para manter a vitalidade e detestam sair do chão.",
);

addDescriptions(
  ["shrubclaw-bay", "shrubclaw-beach", "shrubclaw-mudflat", "shrubclaw-basic"],
  "As plantas exuberantes que cobrem suas conchas convertem luz solar em nutrientes, por isso, em dias ensolarados, nem precisam comer.",
);

addDescriptions(
  ["geoclaw-basic"],
  "Esconde-se em cavernas. Os minerais presentes em sua alimentação cobrem gradualmente sua concha com cristais; permanece no subsolo e usa sua bela concha para atrair presas.",
);

addDescriptions(
  ["gracewing-mountain-woods", "gracewing-nighttime", "gracewing-sea-of-flowers", "gracewing-basic"],
  "Andarilhos solitários. Criam ilusões ao liberar escamas das asas quando ameaças se aproximam.",
);

addDescriptions(
  ["somniwing-basic"],
  "Suas magníficas asas espalham escamas que ajudam as flores a crescer e disseminam vitalidade por onde voam.",
);

addDescriptions(
  ["eko-basic"],
  "Com as grandes orelhas sempre erguidas, são extremamente sensíveis aos sons. Não deixam passar nenhum movimento que desperte sua atenção, perto ou longe.",
);

addDescriptions(
  ["eklue-basic"],
  "Curiosos e atentos à busca por rastros e ao rastreamento de alvos. O anel em sua cauda amplifica o ultrassom, permitindo detectar facilmente criaturas camufladas.",
);

addDescriptions(
  ["budsquire-basic"],
  "Esses chorões tímidos também conseguem se levantar contra os inimigos quando encurralados. Os brotos em suas cabeças florescem quando fazem isso.",
);

addDescriptions(
  ["budsquire-towerwood"],
  "O espinho na mão de Budsquire pode ser macio e frágil, mas sua coragem não é. Para proteger aquilo que valoriza, segue Thornblade sem hesitar.",
);

addDescriptions(
  ["thornblade-basic"],
  "As espadas feitas de caules espinhosos só são desembainhadas quando chega a hora de proteger seu grupo dos inimigos.",
);

addDescriptions(
  ["thornblade-rainstorm"],
  "Esses assassinos de sangue frio aperfeiçoam suas habilidades em noites chuvosas, com olhos afiados como relâmpagos. Quando fixam o olhar na presa, o alvo já está marcado.",
);

addDescriptions(
  ["thornblade-prismana"],
  "Suas espadas, cobertas por Prismana, jamais podem ser quebradas, não importa quão forte sejam atingidas.",
);

addDescriptions(
  ["thornblade-towerwood"],
  "Com um coração inabalável, tornou-se um verdadeiro cavaleiro por mérito próprio. Thornblade honrará seu juramento de proteção e expulsará todos os invasores.",
);

addDescriptions(
  ["thornblade-umbrabow"],
  "A energia instável de Prismana deixa os espinhos de Thornblade ainda mais afiados — e aumenta sua sede de batalha. Quanto maior o perigo, mais difícil é se conter!",
);

addDescriptions(
  ["melloblum-basic"],
  "Para apaziguar conflitos, espalham pétalas perfumadas que fazem quem as toca sentir felicidade e perder o ímpeto de lutar.",
);

addDescriptions(
  ["pomegg-basic"],
  "Recolhem-se em suas conchas para descansar e muitas vezes são confundidos com ovos. Temem batalhas, mas adoram multidões, dançando com bolas de grama para animar os outros.",
);

addDescriptions(
  ["pomegg-snowfield"],
  "Esses Pomeggs tremem e ficam com o nariz escorrendo na neve congelante. Equilibram bolas de neve sobre a cabeça para se camuflar, parecendo pequenos bonecos de neve quando se recolhem na concha.",
);

addDescriptions(
  ["pomegg-highland"],
  "Os Pomeggs das terras altas empilham folhas secas na cabeça para se misturar ao ambiente. Porém, esse disfarce bloqueia sua visão, então às vezes escorregam e rolam encosta abaixo.",
);

addDescriptions(
  ["pomegg-sea-of-flowers"],
  "Os Pomeggs que vivem no Mar de Flores usam flores na cabeça como camuflagem. Seus corpos absorvem os pigmentos, adquirindo um tom rosa-claro e suave.",
);

addDescriptions(
  ["dazmand-basic"],
  "Têm membros flexíveis e adoram exibir seus chutes chamativos para quem estiver olhando. Usam a pele que trocaram sobre a cabeça como um capuz estiloso.",
);

addDescriptions(
  ["pomawk-basic"],
  "Suas jubas imponentes demonstram sua natureza selvagem, enquanto seus rugidos ferozes revelam sua verdadeira personalidade. Suas caudas armazenam ondas sonoras e liberam um estrondo sônico quando atingem um oponente.",
);

addDescriptions(
  ["pomawk-snowfield"],
  "O clima congelante transforma suas jubas em espinhos de gelo, realçando seu espírito rebelde. A pele trocada forma uma roupa justa, permitindo manter estilo e calor no frio.",
);

addDescriptions(
  ["pomawk-highland"],
  "Vagam pelos campos das terras altas com jubas rígidas em forma de folhas de sicômoro. Essas folhas balançam livremente ao vento, farfalhando junto de suas vozes roucas.",
);

addDescriptions(
  ["pomawk-sea-of-flowers"],
  "Evoluíram dos Pomeggs do Mar de Flores. Sua pele permanece vibrante mesmo após a troca, mas os espinhos na cabeça mostram que têm uma personalidade bastante espinhosa.",
);

addDescriptions(
  ["dewy-basic"],
  "Como parceiros de perfumistas, armazenam e fermentam néctar em seus corpos, transformando-o em ingredientes para perfumes.",
);

addDescriptions(
  ["fragrancier-basic"],
  "São exigentes com odores, por isso coletam e armazenam diversos néctares dentro de si para produzir ingredientes de perfume únicos.",
);

addDescriptions(
  ["wisptis-basic"],
  "Se a única forma de evoluir é derrotar outros Wisptises, então não resta escolha além de manter as garras afiadas.",
);

addDescriptions(
  ["wisptis-forest"],
  "Os fungos da névoa deixam suas conchas em um tom verde-acinzentado e espalham esporos quando batem as asas.",
);

addDescriptions(
  ["wisptis-highland"],
  "Afiam suas garras até ficarem em brasa, acrescentando um brilho ardente aos seus cortes.",
);

addDescriptions(
  ["ignitis-basic"],
  "Afiam suas lâminas e aguardam o momento perfeito, escondendo-se nas sombras enquanto brincam com a presa.",
);

addDescriptions(
  ["ignitis-forest"],
  "A infecção fúngica deformou suas conchas e cobriu suas asas com esporos que se espalham quando batem as asas.",
);

addDescriptions(
  ["ignitis-prismana"],
  "A Prismana tinge suas foices de carmesim enquanto suas silhuetas negras se escondem na noite como assassinos.",
);

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

  console.log("2/4 Localizando formas 81–130...");
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
