import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T14:05:00Z";
const START_ID = 181;
const END_ID = 225;
const EXPECTED_COUNT = 45;

const FORM_NAMES_PT_BR = {
  "Basic Form": "Forma Básica",
  "Snowfield Form": "Forma de Campo Nevado",
  "Mountain Woods Form": "Forma das Florestas Montanhosas",
  "Mountain Form": "Forma de Montanha",
  "Prismana Form": "Forma Prismana",
  "Umbrabow Form": "Forma Umbrabow",
  "Rainstorm Form": "Forma de Temporal",
};

const DESCRIPTION_PT_BR = {
  "rookey-snowfield": "Forram a armadura com pelo de outros Aniimos para se aquecer e ganhar mais tração na neve quando se enrolam.",
  "rookey-mountain-woods": "Carregando a responsabilidade de proteger seu clã, sua armadura foi polida até adquirir tom dourado após bloquear incontáveis ataques.",
  "jawling-basic": "Adora morder tudo o que vê. Sua mandíbula flexível consegue se abrir de forma extremamente ampla. Demonstra afeto com mordidinhas suaves.",
  "jawling-mountain": "Adora afiar os dentes em minérios de Metal. Os elementos de Metal que consome deixam toda a sua pele mais resistente.",
  "helmwhelp-basic": "Um filhote que esconde sua fraqueza sob o capacete, sonhando em se tornar forte o bastante para voar livremente.",
  "helmwhelp-mountain": "Evoluiu de um Jawling das montanhas; seu capacete é várias vezes mais duro que sua pele.",
  "helgon-basic": "Cobertos por uma armadura rígida, parecem estátuas altas quando ficam imóveis, como se montassem guarda sobre tesouros antigos.",
  "helgon-mountain": "Evoluiu de um Helmwhelp das montanhas e coleciona objetos dourados incansavelmente.",
  "infergon-basic": "Cobertos por uma armadura forjada pelas chamas, o fogo que expelem quando enfurecidos pode derreter quase tudo.",
  "cubbo-basic": "Passam o dia sonâmbulos. Se forem acordados, tornam-se violentos instantaneamente e perdem o controle. Quando esgotam a energia, voltam a dormir como bebês.",
  "grizbo-basic": "Escondem resistência e autocontrole constantes sob uma aparência gentil. Porém, se provocados ou com fome, perdem o controle e entram em frenesi.",
  "grizbo-prismana": "A energia de Prismana acalma suas almas em fúria, conduzindo-os a sonhos tranquilos.",
  "pebbling-basic": "São geólogos natos que gostam de comer todo tipo de mineral. E aquilo que comem determina como crescem.",
  "lavazar-basic": "Usam garras duras para esmagar cristais e comê-los para armazenar calor, fazendo surgir padrões vermelho-fogo pelo corpo.",
  "magmarex-basic": "Cristais escaldantes crescem em seus corpos como lava solidificada. Se o calor armazenado entrar em erupção, pode derreter tudo em seu caminho.",
  "magmarex-prismana": "Os cristais em suas costas absorvem energia de Prismana, liberando magníficos jatos de energia e irradiando um calor aterrorizante.",
  "magmarex-umbrabow": "Seus cristais ardentes absorvem energia instável de Prismana e escurecem como obsidiana, enquanto o calor interno continua aumentando.",
  "geodeback-basic": "Os minerais que comem voltam a crescer em seus corpos, agora com energia refinada armazenada em seu interior.",
  "minespine-basic": "Onde houver minerais cristalinos, eles também estarão. Seus espinhos duros servem tanto como proteção quanto como armazenamento de energia.",
  "cozite-basic": "Os Cozites constroem suas conchas pouco a pouco com lama. Quando estão em perigo, liberam fumaça pelo orifício superior para encobrir a área e se esconder.",
  "bailite-basic": "Bailites conseguem girar a parte superior e inferior do corpo de forma independente, permitindo observar o ambiente com flexibilidade e se transformar em uma torre.",
  "bulbly-basic": "Sua primeira reação a qualquer coisa é fugir, e seus órgãos em forma de bulbo indicam se estão saudáveis.",
  "veilfloat-basic": "Uma criatura dependente de luz que brilha ao cair da noite, mantendo sua luz acesa mesmo enquanto dorme.",
  "luminelle-basic": "Muda seu brilho conforme o humor, enquanto seus tentáculos criam padrões hipnotizantes e desferem ataques elétricos.",
  "luminelle-rainstorm": "Sua pele precisa de umidade constante, mas a única saída para a água são os olhos, por isso parecem estar chorando.",
  "luminelle-prismana": "A energia de Prismana fortalece o órgão elétrico em sua cabeça, permitindo gerar uma suave luz curativa.",
  "luminelle-umbrabow": "Repleto de energia instável de Prismana, Luminelle emerge de um mar iluminado pelas estrelas e vigia silenciosamente a noite.",
  "fahloo-basic": "Esfregam o óleo de seus corpos para criar uma espuma espessa. Essa espuma os limpa e protege, embora às vezes escorreguem nela por acidente.",
  "erlath-basic": "Suas penas secretam óleo constantemente, criando diversos tipos de bolhas com apenas um pouco de atrito. Instintivamente usam a espuma mais macia e densa para proteger os Fahloos em suas costas.",
  "besauce-basic": "Sempre tentando encontrar batidas que abafem seu coração persistente, Besauce adora dançar no ritmo da música.",
  "reefish-basic": "Enterram-se no solo para se camuflar como coral e mordem qualquer presa que se aproxime. Porém, às vezes ficam impacientes e espiam ao redor.",
  "reefish-rainstorm": "Sem luz solar, Reefish fica azedo e irritadiço. A camada semelhante a uma concha em suas costas se retorce em bordas serrilhadas.",
  "coraliz-basic": "Adoram se enterrar na areia, imitando aglomerados de coral. Usam o brilho do coral na cabeça e nas costas para atrair criaturas e lançar um ataque surpresa.",
  "coraliz-rainstorm": "Sob a chuva que cai, o perigo cresce em silêncio, assim como os espinhos de coral ao longo de suas costas.",
  "cheekie-basic": "As pessoas costumam confundir os círculos em suas bochechas com olhos. Adoram se reunir em grupos na costa e só se sentem seguros quando ficam bem próximos de seus companheiros.",
  "wavwal-basic": "Movem-se de forma desajeitada em terra usando os quatro membros, mas são especialistas em deslizar sobre a barriga.",
  "bubbeep-basic": "Estica suas penas folhosas com preguiça, sempre mastigando enquanto transforma algas e lodo em bolhas flutuantes.",
  "glameep-basic": "Coberto por penas folhosas verdes e frescas, Glameep se move com leveza pela margem do lago.",
  "glameep-prismana": "A Prismana transformou as penas folhosas de Glameep em algo transparente e semelhante a vidro, enquanto o galho dourado em sua cabeça cresceu e virou uma coroa.",
  "popapus-basic": "Adora colecionar bolhas coloridas e usá-las para rabiscar pequenas maravilhas estranhas no ar.",
  "gachapus-basic": "Um Aniimo de Água que lança bolhas-cápsula imprevisíveis e as transforma em efeitos de batalha.",
  "malangel-basic": "Um Aniimo de Gelo que esconde um estilo de luta agressivo por trás de uma aparência inocente.",
  "malevsera-basic": "Um Aniimo de Gelo que esconde garras e presas em um corpo macio antes de congelar alvos desprevenidos.",
  "fennelun-basic": "Um Aniimo Sagrado associado ao luar, combinando uma aparência serena com emoções intensas.",
  "helion-basic": "Um Aniimo Sagrado confiante que protege seus companheiros e desfere poderosos ataques solares.",
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

  console.log("1/4 Validando o lote final de formas...");
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

  console.log("2/4 Localizando formas 181–225...");
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
  console.error("\nFalha ao localizar o lote final de formas:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
