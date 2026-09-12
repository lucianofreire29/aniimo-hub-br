import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T13:35:00Z";
const START_ID = 76;
const END_ID = 161;
const EXPECTED_COUNT = 75;

const NAME_PT_BR = {
  "Whirling Blossom Rain": "Chuva Giratória de Flores",
  "Dancing Petals": "Pétalas Dançantes",
  "Focused Beam": "Feixe Concentrado",
  "Vortex of Petals": "Vórtice de Pétalas",
  "Floral Storm": "Tempestade Floral",
  ATK: "ATK",
  "Plant Charge": "Investida Vegetal",
  "Euphoric Sonic Blast": "Explosão Sônica Eufórica",
  "Gravel Tackle": "Investida de Cascalho",
  "Annihilation Bomb": "Bomba de Aniquilação",
  "Oozing Malice": "Malícia Transbordante",
  "Black Hole Domain": "Domínio do Buraco Negro",
  "Shard Impact": "Impacto de Estilhaços",
  "Malice Burst": "Explosão de Malícia",
  "Breaking Roar": "Rugido Rompedor",
  "Off-Key Shock Wave": "Onda de Choque Desafinada",
  "Gravel Strike": "Golpe de Cascalho",
  "Haunting Choir": "Coral Assombrado",
  "Nutrient Absorption": "Absorção de Nutrientes",
  "Leaf Slash": "Corte de Folhas",
  "Verdant Beam": "Feixe Verdejante",
  "The Luminus Gust": "Rajada Luminosa",
  "Quake Impact": "Impacto Sísmico",
  "Charged Strike": "Golpe Carregado",
  "Ice Pincer": "Pinça de Gelo",
  "Frost Cutting Blade": "Lâmina Cortante de Geada",
  "Ice Whirlwind": "Redemoinho de Gelo",
  "Ice Spike": "Espinho de Gelo",
  "Fire Orb": "Orbe de Fogo",
  "Trick Fire Ring": "Anel de Fogo Ardiloso",
  "Phantom Flame Cannon": "Canhão de Chama Fantasma",
  "Phantom Barrage": "Barragem Fantasma",
  "Wind of Regeneration": "Vento da Regeneração",
  "Wind of Rejuvenation": "Vento do Rejuvenescimento",
  "Phantom Dance": "Dança Fantasma",
  "Healing Dance": "Dança Curativa",
  "Purifying Dance": "Dança Purificadora",
  "Help! Gracewing!": "Socorro, Gracewing!",
  Phantomflutter: "Esvoaçar Fantasma",
  "Hypnotic Spores": "Esporos Hipnóticos",
  "Energy Orb": "Orbe de Energia",
  "Ethereal Light Wave": "Onda de Luz Etérea",
  "Butterfly Dance": "Dança da Borboleta",
  "Ice Arc Strike": "Golpe em Arco de Gelo",
  "Arc Strike": "Golpe em Arco",
  "Water Arc Strike": "Golpe em Arco de Água",
  "Sonar Attack": "Ataque de Sonar",
  "Detect Weakness": "Detectar Fraqueza",
  "Tactical Kick": "Chute Tático",
  "Target Weakness": "Marcar Fraqueza",
  "Thorny Defense": "Defesa Espinhosa",
  "Thorny Impact": "Impacto Espinhoso",
  "Aqua Defense": "Defesa Aquática",
  "Lightning Impact": "Impacto Relâmpago",
  "Thorny Rain": "Chuva de Espinhos",
  "Elegant Waltz": "Valsa Elegante",
  "Thorny Blessing": "Bênção Espinhosa",
  "Healing Rose": "Rosa Curativa",
  "Blasting Roses": "Rosas Explosivas",
  "Rose Garden": "Jardim de Rosas",
};

const DESCRIPTION_PT_BR = {
  81: "(BREAK) Usa o poder da Planta para atacar alvos a curta distância.",
  82: "Avança contra o alvo usando o próprio corpo.",
  83: "Solta um grito especial, causando dano aos inimigos em um cone frontal e restaurando 10 de energia.",
  84: "Avança contra o alvo com o corpo, causando dano de Terra.",
  85: "Usa poder Sombrio para atacar alvos à distância.",
  86: "Concentra energia de aniquilação na palma da mão e a arremessa contra o alvo, causando enorme dano em área.",
  87: "Libera uma onda de choque de energia ao redor do alvo, causando dano aos inimigos atingidos e reduzindo em 50% a cura recebida por 10s.",
  88: "Recua rapidamente por uma curta distância enquanto deixa um buraco negro sob o alvo, puxando-o continuamente e causando dano.",
  89: "Recua rapidamente enquanto invoca um selo de Terra sob o alvo; estilhaços são lançados continuamente do selo para atingi-lo.",
  91: "Libera uma grande onda de choque de energia ao redor do alvo, causando dano aos inimigos atingidos e reduzindo em 50% a cura recebida por 10s.",
  92: "(BREAK) Usa o poder da Planta para atacar alvos a curta distância.",
  93: "Restaura as unidades Hummin ao número máximo e, junto delas, solta um rugido que libera uma enorme onda de choque contra o alvo.",
  94: "Teleporta todas as unidades de Planta Desafinada para perto do alvo e desfere uma Investida, causando dano.",
  95: "Teleporta todas as unidades Hummin para perto do alvo para usar Investida de Cascalho, causando dano.",
  96: "Todas as unidades Hummin se teleportam para perto dos inimigos e liberam ataques sônicos, causando dano em área e atordoando os alvos por 1s.",
  97: "Finca-se firmemente no solo, recebendo 20% de Redução de Dano e cura contínua de 2% por segundo. Restaura instantaneamente 50% do HP de todos os Hummin e aumenta em 20% o dano e em 20% a eficiência de BREAK dos Hummin próximos.",
  98: "(BREAK) Usa o poder da Terra para atacar alvos a curta distância.",
  99: "Gira folhas ao redor de si, causando dano por 6s.",
  100: "Dispara um feixe de energia na direção da câmera, causando dano continuamente aos inimigos dentro do alcance. Acertos consecutivos aumentam gradualmente seu Poder.",
  101: "Gira Núcleos ao redor de si, causando dano continuamente e aplicando Debuff de Terra por 6s.",
  102: "(BREAK) Usa o poder da Terra para atacar alvos a curta distância.",
  103: "Irrompe do chão, gerando ondas de choque em uma grande área.",
  106: "Ergue as pinças para carregar. Ao atingir carga máxima ou ao usar novamente, executa 2 golpes rápidos, atacando e atordoando brevemente o alvo. Pode consumir 3 acúmulos de Debuff de Terra para causar dano adicional igual a 20% de Poder.",
  108: "Usa poder elemental de Gelo para atacar alvos próximos enquanto exerce a função BREAK.",
  109: "Causa dano em uma ampla área.",
  110: "Concentra energia de Gelo nas duas pinças e golpeia rapidamente, causando dano em área à frente e criando uma parede de gelo por 5s.",
  111: "Invoca uma tempestade de gelo que aplica continuamente anomalia elemental de Gelo enquanto avança até atingir uma parede ou alvo.",
  112: "Cria um espinho de gelo à frente para atacar e congelar o alvo por 1s. Pode ser usada durante escavação e, em seguida, avança pelo subsolo.",
  113: "Usa o poder do Fogo para atacar alvos à distância.",
  114: "Arremessa uma bola de fogo explosiva contra o alvo. Segure para mirar.",
  115: "Lança um anel de fogo que se expande e depois se contrai para atacar o alvo. Quanto mais distante o alvo estiver, maior o dano, até 50% de aumento.",
  116: "Usa o poder do Fogo para atacar alvos à distância.",
  117: "Salta e arremessa uma enorme bola de fogo contra o alvo. Ela explode ao atingir o chão, causando dano em ampla área e aplicando 12 acúmulos de Debuff de Fogo.",
  119: "Golpeia à distância todos os alvos dentro do alcance afetados por Debuff de Fogo. Restaura 2 EP para cada acúmulo de Debuff de Fogo no alvo, até 18 EP.",
  121: "Usa o poder do Vento para atacar alvos à distância.",
  122: "Cria uma área de vento quente sob os pés, curando continuamente toda a equipe em 9% do HP máximo do usuário ao longo de 8s. Aniimos de Terra recebem 3% de cura adicional.",
  123: "Cria uma área de vento quente sob os pés, curando continuamente toda a equipe em 9% do HP máximo do usuário ao longo de 8s. Aniimos de Vento recebem 3% de cura adicional.",
  124: "Remove todos os debuffs do usuário. Quando Gracewing não está em campo, emerge automaticamente para remover debuffs dos companheiros ativos.",
  125: "Cria uma área de vento quente sob os pés, curando continuamente toda a equipe em 9% do HP máximo do usuário ao longo de 8s. Aniimos de Planta recebem 3% de cura adicional.",
  126: "Remove todos os debuffs dos companheiros próximos. Depois da remoção, aumenta em 20% a taxa de recuperação de EP deles por 10s.",
  127: "Usa o poder do Vento para atacar alvos à distância.",
  128: "Cura instantaneamente toda a equipe em 30% do HP máximo do usuário.",
  130: "Cria uma Phantomfly no local, restaurando 20 EP a todos os companheiros que a tocarem após 3s. Podem existir até 2 Phantomflies ao mesmo tempo.",
  135: "Ao acertar, aplica Hipnose, aumentando em 25% o dano recebido e impedindo ações até que o alvo sofra dano ou 5s se passem.",
  136: "Carrega Energia acima do alvo e a faz cair; manter a habilidade pressionada consome mais Energia para aumentar o dano.",
  137: "Envia uma onda de luz para a frente, absorvendo projéteis inimigos e aumentando a taxa de recuperação de EP dos companheiros.",
  138: "Usa o poder da Planta para atacar alvos à distância.",
  139: "Voa para cima e usa poder rejuvenescedor, recuperando 22,5 EP.",
  140: "Executa uma varredura em arco que causa dano de Gelo; alvos com Marca de Fraqueza também são atordoados.",
  141: "Executa uma varredura em arco; alvos com Marca de Fraqueza também são atordoados.",
  142: "Executa uma varredura em arco que causa dano de Água; alvos com Marca de Fraqueza também são atordoados.",
  143: "Dispara sonar em um cone e aplica Marca de Fraqueza no golpe final.",
  144: "Usa o poder do Vento para atacar alvos a curta distância.",
  145: "Usa sonar para detectar pontos fracos e aplicar Marca de Fraqueza.",
  146: "Avança contra o alvo, executa um chute com mortal para trás e reduz a Velocidade de Movimento.",
  147: "Usa o poder do Vento para atacar alvos a curta distância.",
  148: "Aplica Marca de Fraqueza aos alvos dentro do campo de visão e reduz a Resistência a Vento.",
  149: "Entra em postura defensiva, reduz o dano recebido e contra-ataca ao ser atingido.",
  150: "Avança com uma estocada contra o alvo e aumenta a taxa crítica ao acertar.",
  151: "Usa o poder da Planta para atacar alvos a curta distância.",
  152: "Entra em postura defensiva, reduz o dano recebido e contra-ataca ao ser atingido.",
  153: "Avança com uma estocada contra o alvo e aumenta a taxa crítica ao acertar.",
  154: "Ataca rapidamente o alvo com sua lâmina de espinho até três vezes.",
  155: "Perfura repetidamente um alvo com sua lâmina de espinho.",
  156: "Usa o poder da Planta para atacar alvos a curta distância.",
  157: "Concede Bênção Espinhosa a toda a equipe; dano crítico de Planta pode criar espinhos que causam dano.",
  158: "Invoca uma rosa que aplica Marca da Rosa e pode curar aliados próximos após acertos críticos.",
  159: "Libera pétalas que perseguem e atacam o alvo com taxa crítica adicional.",
  160: "Cria um círculo mágico no qual aliados recebem aumento de dano crítico de Planta.",
  161: "Usa o poder da Planta para atacar alvos à distância.",
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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function saveMeta(sql, id, campo, observacoes) {
  await sql.query(
    `INSERT INTO traducoes_pt_br (entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em)
     VALUES ('habilidades', $1, $2, 'ANIIMO_BRASIL', NULL, $3, $4::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
       origem='ANIIMO_BRASIL', observacoes=EXCLUDED.observacoes, revisado_em=EXCLUDED.revisado_em, atualizado_em=NOW()`,
    [id, campo, observacoes, REVIEWED_AT],
  );
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/4 Validando habilidades — lote 02...");
  const rows = await sql.query(`SELECT id, nome, descricao FROM habilidades WHERE id BETWEEN $1 AND $2 ORDER BY id`, [START_ID, END_ID]);
  if (rows.length !== EXPECTED_COUNT) throw new Error(`Esperadas ${EXPECTED_COUNT} habilidades, encontradas ${rows.length}.`);
  for (const row of rows) {
    if (!NAME_PT_BR[row.nome]) throw new Error(`Nome sem tradução: ${row.nome} (id ${row.id}).`);
    if (row.descricao && !DESCRIPTION_PT_BR[Number(row.id)]) throw new Error(`Descrição sem tradução: id ${row.id} - ${row.nome}.`);
  }

  console.log("2/4 Localizando habilidades...");
  let translatedDescriptions = 0;
  for (const row of rows) {
    const id = Number(row.id);
    const nomePtBr = NAME_PT_BR[row.nome];
    const descricaoPtBr = DESCRIPTION_PT_BR[id] ?? null;
    await sql.query(`UPDATE habilidades SET nome_pt_br=$2, descricao_pt_br=COALESCE($3, descricao_pt_br), atualizado_em=NOW() WHERE id=$1`, [id, nomePtBr, descricaoPtBr]);
    await saveMeta(sql, id, "nome", nomePtBr === row.nome ? `Termo técnico preservado em PT-BR: ${row.nome}.` : `Tradução editorial: ${row.nome} → ${nomePtBr}.`);
    if (descricaoPtBr) {
      translatedDescriptions += 1;
      await saveMeta(sql, id, "descricao", "Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.");
    }
  }
  console.log(`   OK ${rows.length} nomes localizados.`);
  console.log(`   OK ${translatedDescriptions} descrições existentes localizadas.`);

  console.log("3/4 Auditando lote...");
  const audit = await sql.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL)::int AS nomes_pt_br, COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao) <> '')::int AS descricoes_origem, COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao) <> '' AND descricao_pt_br IS NOT NULL)::int AS descricoes_pt_br FROM habilidades WHERE id BETWEEN $1 AND $2`, [START_ID, END_ID]);
  const result = audit[0];
  if (result.total !== EXPECTED_COUNT || result.nomes_pt_br !== EXPECTED_COUNT || result.descricoes_origem !== result.descricoes_pt_br) throw new Error(`Auditoria inválida: nomes=${result.nomes_pt_br}/${result.total}, descrições=${result.descricoes_pt_br}/${result.descricoes_origem}.`);
  console.log(`   OK ${result.nomes_pt_br}/${result.total} nomes em PT-BR.`);
  console.log(`   OK ${result.descricoes_pt_br}/${result.descricoes_origem} descrições existentes em PT-BR.`);

  console.log("4/4 Finalizando...");
  console.log("\nLote 02 de habilidades localizado.");
}

main().catch((error) => {
  console.error("\nFalha ao localizar habilidades — lote 02:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
