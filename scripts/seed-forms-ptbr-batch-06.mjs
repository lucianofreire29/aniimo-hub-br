import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T13:35:00Z";
const START_ID = 131;
const END_ID = 180;
const EXPECTED_COUNT = 50;

const FORM_NAMES_PT_BR = {
  "Basic Form": "Forma Básica",
  "Highland Form": "Forma de Terras Altas",
  "Umbrabow Form": "Forma Umbrabow",
  "Prismana Form": "Forma Prismana",
  "Nighttime Form": "Forma Noturna",
  "Mountain Woods Form": "Forma das Florestas Montanhosas",
  "Thunderstorm Form": "Forma de Tempestade",
  "Snowfield Form": "Forma de Campo Nevado",
};

const DESCRIPTION_PT_BR = {
  "ignitis-highland": "Afiam suas lâminas duplas para acumular calor, liberado instantaneamente quando atacam.",
  "ignitis-umbrabow": "A energia instável de Prismana envolve Ignitis em luz estelar.",
  "fulmintis-basic": "Evoluiu de um Wisptis com os membros dianteiros quebrados após absorver o poder dos relâmpagos.",
  "fulmintis-prismana": "A energia de Prismana concede a Fulmintis uma nova explosão de poder, transformando-o em um borrão vermelho no campo de batalha.",
  "bonesky-basic": "Um filhote cheio de energia com um par de orelhas grandes.",
  "bonesky-nighttime": "Um jovem Bonesky adaptado à vida noturna.",
  "fenrier-basic": "Resistindo a carinhos gentis que poderiam enfraquecer sua determinação, lidera caçadas em grupo com sua lâmina de gelo.",
  "fenrier-nighttime": "O pelo cinza-escuro se mistura perfeitamente à noite.",
  "glynsera-basic": "Guerreiros orgulhosos e confiantes, as lâminas geladas em sua boca fazem os inimigos tremerem.",
  "glynsera-prismana": "A Prismana torna vermelhas as pontas de seu pelo e as lâminas em sua boca, servindo de aviso às outras criaturas.",
  "glynsera-nighttime": "Um caçador arrogante sob a luz da lua.",
  "bolty-basic": "Vivem entre as árvores e produzem faíscas douradas com suas caudas.",
  "bolty-mountain-woods": "Vivendo em regiões de floresta ensolarada, a cor mais clara do corpo ajuda a evitar a absorção excessiva de calor.",
  "blazen-basic": "Usam seu pelo especial para capturar partículas carregadas no ar, produzindo e armazenando eletricidade.",
  "blazen-prismana": "O poder da Prismana percorre seu pelo, emitindo raios ofuscantes e ameaçadores.",
  "blazen-mountain-woods": "Evoluíram de Bolties que vivem em florestas montanhosas e possuem uma coloração corporal mais clara.",
  "blazen-umbrabow": "A energia instável de Prismana leva a eletricidade de Blazen ao limite.",
  "susuta-basic": "Cavam por toda parte em busca de presentes para oferecer a quem gostam.",
  "susuta-nighttime": "As olheiras vêm de passar a noite inteira cavando em busca de tesouros.",
  "popota-basic": "Escolhem conchas e as transformam em pás. Dizem que produzem bolhas cor-de-rosa quando veem alguém que amam.",
  "popota-nighttime": "Esses Popotas passam as noites pensando em quem gostam, e seu pelo perdeu a cor por causa do humor amargo.",
  "piopiota-basic": "Pequenas criaturas narcisistas que passam muito tempo cuidando do pelo e ensaiando a pose perfeita.",
  "piopiota-nighttime": "A falta de exposição ao sol deixa seu pelo sem cor, já que só saem para encontros à noite — mas o visual até que fica estiloso.",
  "panpanta-basic": "São fortes e poderosos, mas preferem ficar em seus ninhos decorando-os a exibir seus músculos.",
  "panpanta-prismana": "Sua preciosa concha foi remodelada pela luz da Prismana, tornando-se um símbolo de comando.",
  "shelly-basic": "Camufla-se entre conchas da praia usando seus apêndices macios para mantê-las no lugar. Permanece fechado durante o dia.",
  "sheldon-basic": "Deitados sobre suas conchas, contemplam o céu noturno, mergulhados em um sonho tecido pelas estrelas.",
  "sherro-basic": "Transformam as conchas que antes os cobriam em espadas e escudos para proteger as frágeis Shellies ao longo da costa.",
  "sherro-umbrabow": "Tocado pela energia instável de Prismana, o desejo de Sherro de proteger os seus faz sua concha brilhar mais intensamente do que nunca.",
  "baleetle-basic": "Nunca vão a lugar algum sem suas bolas de pedra, e o rolamento constante as deixa cada vez mais redondas e estranhas.",
  "baleetle-snowfield": "Os Baleetles da neve empurram as bolas de pedra que carregam desde o nascimento. Cobertos por uma grossa camada de geada e neve, executam manobras difíceis no gelo e na neve.",
  "waleetle-basic": "Movem-se para trás como seus parentes, mas de um jeito muito mais elegante.",
  "waleetle-snowfield": "Os Waleetles que correm pela neve enrolam espinhos congelados em suas bolas de neve como correntes, evitando capotar mesmo ao correr sobre gelo liso.",
  "bouldus-basic": "Uma pedra redonda que passou dia e noite ao lado de Baleetle despertou depois de tantas pancadas. Cansada de ser controlada, engoliu um inseto e finalmente conseguiu se mover por vontade própria.",
  "bouldus-snowfield": "Um Bouldus que vive nos campos nevados. Rola constantemente pela neve, comprimindo a geada sobre o corpo até formar cristais sólidos de gelo.",
  "fentuft-basic": "Sempre exibem um sorriso marcante e convidam outros Aniimos para brincar. Embora às vezes causem problemas por travessura e ganância, acabam sempre perdoados.",
  "fenmane-basic": "Usando a excelente condutividade de seu pelo, condensam o poder dos relâmpagos para estender as asas, avançando para dissipar a névoa e melhorar o humor.",
  "fenmane-prismana": "Afetado pela Prismana, seu pelo adquire uma romântica cor de doce. Só o sorriso já faz as pessoas sentirem o sabor doce da felicidade.",
  "helmut-basic": "Esse capacete resistente protege seu corpo macio, enquanto as garras extensíveis da boca ajudam na caça.",
  "helmut-snowfield": "Helmuts mais espertos gostam de forrar seus capacetes com o pelo de outros Aniimos para se manterem aquecidos mesmo no inverno congelante.",
  "helmut-mountain-woods": "Um Helmut corajoso que poliu seu capacete até deixá-lo brilhando após inúmeras colisões.",
  "pawney-basic": "Armado com uma espada quebrada e uma armadura, abençoado com coragem e força, protege os amigos e desafia os inimigos.",
  "pawney-snowfield": "Remodelam lâminas em machados e revestem as articulações com pelo de outros Aniimos para se aquecer no inverno.",
  "pawney-mountain-woods": "Obcecado em desafiar inimigos fortes, cada ataque que suporta lustra sua armadura, deixando-a ainda mais brilhante.",
  "pawney-prismana": "A energia de Prismana desperta um fragmento do dragão que um dia foi derrotado por esta espada.",
  "pawney-umbrabow": "A energia instável de Prismana desperta os espíritos guerreiros dentro da lâmina de Pawney.",
  "rookey-basic": "Apesar do tamanho imponente, é tímido e evita conflitos. Encontra coragem quando seus amigos precisam de proteção.",
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

  console.log("2/4 Localizando formas 131–180...");
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
