import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T13:50:00Z";
const START_ID = 162;
const END_ID = 236;
const EXPECTED_COUNT = 75;

const NAME_PT_BR = {
  "Frost Strike": "Golpe Gélido",
  "Jittering Beats": "Batidas Vibrantes",
  "Rhythm Combo": "Combo Rítmico",
  ATK: "ATK",
  "Lightning Break": "Ruptura Relâmpago",
  "Thunder Sweep": "Varredura Trovejante",
  "Electricity Shock": "Choque Elétrico",
  "Lightning Storm": "Tempestade Elétrica",
  "Wild Show": "Show Selvagem",
  "Sonic Boom": "Explosão Sônica",
  "Blossoming Moment": "Momento do Florescer",
  "Withering Bloom": "Florescer Murchante",
  "Fragrance Marking": "Marcação de Fragrância",
  "Fragrance Bomb": "Bomba de Fragrância",
  "Scythe Dance": "Dança da Foice",
  "Forest Whirl": "Giro da Floresta",
  "Dark Dash": "Investida Sombria",
  "Dark Soul": "Alma Sombria",
  "Fire Dash": "Investida de Fogo",
  "Dimension Rupture": "Ruptura Dimensional",
  "Lightning Blade Storm": "Tempestade de Lâminas Elétricas",
  "Lightning Blade Impact": "Impacto de Lâmina Elétrica",
  "Enhanced Lightning Blade": "Lâmina Elétrica Aprimorada",
  "Enhanced Light Blade": "Lâmina de Luz Aprimorada",
  "Thunder Lance": "Lança Trovejante",
  "Ice Strikes": "Golpes de Gelo",
  "Night Slash": "Corte Noturno",
  "Boomerang Blade": "Lâmina Bumerangue",
  "Frost Tail Strike": "Golpe de Cauda Gélida",
  "Prismana Slash": "Corte Prismana",
  "Ice Tornado": "Tornado de Gelo",
  "High-Voltage Dash": "Investida de Alta Tensão",
  "Thunder Tail": "Cauda Trovejante",
  "Lightning Cross": "Cruz Relâmpago",
  "Electrified Impact": "Impacto Eletrificado",
  "Dark Claw": "Garra Sombria",
  "Lightning Claw": "Garra Relâmpago",
  "Lightning Flash": "Clarão Relâmpago",
  "Water Cannon": "Canhão de Água",
  "Water Dash": "Investida de Água",
  Surge: "Surto",
  "Dark Tide": "Maré Sombria",
  Surf: "Surfe",
  "Wrath of the Sea": "Ira do Mar",
  "Water Cannonade": "Barragem de Água",
  "Hydro Roll": "Rolamento Aquático",
  "Splash Shield": "Escudo de Respingo",
  "Home Run": "Rebatida Perfeita",
  "Torrent Slam": "Impacto de Torrente",
  "Flowing Water Slash": "Corte de Água Corrente",
  "Prismana Slam": "Impacto Prismana",
  "Thunder Slam": "Impacto Trovejante",
  "Torrent Blade": "Lâmina de Torrente",
  "Stone Ball Drift": "Derrapagem da Bola de Pedra",
};

const DESCRIPTION_PT_BR = {
  162: "Golpeia os alvos ao redor e aplica Silêncio por 1,5s.",
  163: "Golpeia os alvos ao redor e aplica Silêncio por 1,5s.",
  164: "Executa um combo rítmico de até três golpes; acertar o tempo correto adiciona Volume.",
  165: "Usa o poder da Planta para atacar alvos a curta distância.",
  166: "Ataca os alvos enquanto executa passos de break dance.",
  167: "Usa um chute giratório para causar dano em área, puxar alvos e aumentar a taxa crítica de Raio da equipe.",
  168: "Avança contra o alvo, aplica Debuff de Raio e pode causar Paralisia.",
  169: "Usa o poder do Raio para atacar alvos a curta distância.",
  170: "Cria uma enorme tempestade elétrica que atinge repetidamente e aplica Debuff de Raio.",
  171: "Carrega o microfone e libera uma onda sonora; acertar o tempo correto adiciona dano de BREAK.",
  172: "Usa o poder da Planta para atacar alvos a curta distância.",
  173: "Libera uma explosão sônica ao redor de si e preenche o Volume instantaneamente.",
  174: "Salta para desviar de um ataque e depois mergulha com uma bicada contra o alvo; uma esquiva bem-sucedida concede um escudo.",
  175: "Libera fragrância para causar dano aos alvos e restaurar HP da equipe; a cura dobra contra um único alvo.",
  176: "Usa poder Sombrio para atacar alvos a curta distância.",
  177: "Libera uma fragrância, causando dano aos alvos dentro do alcance e restaurando HP de todos os membros da equipe.",
  178: "Causa dano aos alvos à frente e os marca com Fragrância Secreta; ataques básicos Sombrios causam dano adicional enquanto a marca estiver ativa.",
  179: "Libera uma fragrância, aumentando o dano Sombrio de toda a equipe e encantando alvos próximos.",
  180: "Usa poder Sombrio para atacar alvos a curta distância.",
  181: "Gira com a foice, causando dano Sombrio 3 vezes a todos os alvos próximos.",
  182: "Gira para cortar, causando dano de Planta 3 vezes a todos os alvos próximos.",
  183: "Avança contra o alvo com o poder das sombras, aumentando o dano de ataques básicos por 10s.",
  184: "Usa poder Sombrio para atacar alvos a curta distância.",
  185: "Teleporta-se até um alvo e ataca, recebendo aumento de dano de acordo com o HP que falta ao alvo.",
  186: "Avança contra o alvo com o poder do Fogo, aumentando o dano de ataques básicos por 10s.",
  187: "Usa poder Sombrio para atacar alvos a curta distância.",
  188: "Corta o próprio espaço, causando alto dano Físico.",
  189: "Avança e executa cortes consecutivos, terminando com um corte giratório.",
  190: "Dispara duas Ondas de Choque de Lâmina Elétrica; acertos críticos podem causar Paralisia.",
  191: "Aprimora a lâmina, aumentando a taxa crítica das habilidades por 20s.",
  192: "Imbui a lâmina com Luz, aumentando a taxa crítica das habilidades por 20s.",
  193: "Usa o poder do Raio para atacar alvos a curta distância.",
  194: "Causa vários golpes em alvos alinhados em linha reta e pode paralisá-los.",
  195: "Cria um campo mágico que dispara lâminas de gelo e aplica Debuff de Gelo.",
  196: "Avança e libera lâminas sombrias.",
  197: "Arremessa uma lâmina de gelo para a frente, causando dano e aplicando Debuff de Gelo.",
  198: "Usa o poder do Gelo para atacar alvos a curta distância.",
  199: "Usa o poder do Gelo para atacar alvos a curta distância.",
  200: "Salta em direção ao alvo e golpeia o chão com a cauda; pode consumir acúmulos de Debuff de Gelo para causar dano adicional.",
  201: "Cria um campo mágico que dispara três lâminas de gelo.",
  202: "Transforma-se em um tornado de gelo para atacar continuamente os alvos.",
  203: "Usa o poder do Gelo para atacar alvos a curta distância.",
  204: "Avança contra os alvos envolto em eletricidade para causar dano.",
  205: "Canaliza eletricidade e balança a cauda para atacar os alvos à frente.",
  206: "Usa o poder do Raio para atacar alvos a curta distância.",
  207: "Envia para a frente uma marca de garra elétrica que empurra e pode atingir várias vezes.",
  208: "Avança contra o alvo com eletricidade; acertos críticos restauram EP.",
  209: "Desfere golpes consecutivos de garra Sombria contra o alvo.",
  210: "Canaliza eletricidade e golpeia o alvo com um combo de três garras.",
  211: "Usa o poder do Raio para atacar alvos a curta distância.",
  212: "Salta, concentra eletricidade e então cai com força sobre o alvo, entrando no estado Sobrecarregado.",
  213: "Salta e arremessa uma enorme bola de água, causando dano em área e criando uma poça.",
  214: "Avança contra o alvo, causando dano e empurrando-o para trás.",
  215: "Usa o poder da Água para atacar alvos a curta distância.",
  216: "(BREAK) Usa o poder da Água para atacar alvos a curta distância.",
  217: "Absorve poças próximas; cada poça absorvida cura toda a equipe em 4% do próprio HP máximo.",
  218: "Absorve poças próximas; cada poça absorvida cura toda a equipe em 4% do próprio HP máximo.",
  219: "Invoca uma onda sob os pés, surfa em direção ao alvo e cria quatro poças.",
  220: "Usa o poder da Água para atacar alvos a curta distância.",
  221: "Invoca uma enorme onda em direção ao alvo e aumenta o dano de Água da equipe por 30s.",
  222: "Arremessa uma enorme bola de água, cria uma poça e aplica Debuff de Água.",
  223: "Rola continuamente contra o alvo; perto de uma poça, absorve água e aumenta a eficiência de BREAK.",
  224: "Recebe um Escudo de Água por 15s; enquanto estiver ativo, acertos de habilidades causam uma instância adicional de dano.",
  225: "Balança a pá com força total para desferir um golpe poderoso.",
  226: "(BREAK) Usa o poder da Água para atacar alvos a curta distância.",
  227: "Arremessa uma concha contra o alvo; poças próximas causam dano adicional e aumentam o dano de Água.",
  228: "Consome stamina continuamente para rolar para a frente e atingir os alvos, criando uma poça quando o rolamento termina.",
  229: "Usa o poder da Água para atacar alvos a curta distância.",
  230: "Usa o poder da Água para atacar alvos a curta distância.",
  231: "Concentra correntes de água para executar cortes consecutivos.",
  232: "Arremessa uma concha contra um alvo; perto de terreno com água, absorve água para ampliar a área de impacto.",
  233: "Arremessa uma concha contra um alvo; perto de terreno com água, absorve água para ampliar a área de impacto.",
  234: "Usa o poder da Água para atacar alvos a curta distância.",
  235: "Desfere um corte em uma grande área e pode absorver água próxima para causar dano adicional.",
  236: "Gira ao redor para causar dano; cada acerto aumenta temporariamente o dano.",
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
  await sql.query(`INSERT INTO traducoes_pt_br (entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em) VALUES ('habilidades',$1,$2,'ANIIMO_BRASIL',NULL,$3,$4::timestamptz,NOW()) ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET origem='ANIIMO_BRASIL', observacoes=EXCLUDED.observacoes, revisado_em=EXCLUDED.revisado_em, atualizado_em=NOW()`, [id, campo, observacoes, REVIEWED_AT]);
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/4 Validando habilidades — lote 03...");
  const rows = await sql.query(`SELECT id,nome,descricao FROM habilidades WHERE id BETWEEN $1 AND $2 ORDER BY id`, [START_ID, END_ID]);
  if (rows.length !== EXPECTED_COUNT) throw new Error(`Esperadas ${EXPECTED_COUNT} habilidades, encontradas ${rows.length}.`);
  for (const row of rows) {
    if (!NAME_PT_BR[row.nome]) throw new Error(`Nome sem tradução: ${row.nome} (id ${row.id}).`);
    if (row.descricao && !DESCRIPTION_PT_BR[Number(row.id)]) throw new Error(`Descrição sem tradução: id ${row.id} - ${row.nome}.`);
  }

  console.log("2/4 Localizando habilidades...");
  for (const row of rows) {
    const id = Number(row.id);
    const nomePtBr = NAME_PT_BR[row.nome];
    const descricaoPtBr = DESCRIPTION_PT_BR[id] ?? null;
    await sql.query(`UPDATE habilidades SET nome_pt_br=$2, descricao_pt_br=COALESCE($3,descricao_pt_br), atualizado_em=NOW() WHERE id=$1`, [id,nomePtBr,descricaoPtBr]);
    await saveMeta(sql,id,"nome",nomePtBr===row.nome?`Termo técnico preservado em PT-BR: ${row.nome}.`:`Tradução editorial: ${row.nome} → ${nomePtBr}.`);
    if (descricaoPtBr) await saveMeta(sql,id,"descricao","Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.");
  }
  console.log("   OK 75 nomes localizados.");
  console.log("   OK 75 descrições localizadas.");

  console.log("3/4 Auditando lote...");
  const audit = await sql.query(`SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL)::int nomes_pt_br, COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'')::int descricoes_origem, COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'' AND descricao_pt_br IS NOT NULL)::int descricoes_pt_br FROM habilidades WHERE id BETWEEN $1 AND $2`, [START_ID,END_ID]);
  const result = audit[0];
  if (result.total!==EXPECTED_COUNT || result.nomes_pt_br!==EXPECTED_COUNT || result.descricoes_origem!==result.descricoes_pt_br) throw new Error(`Auditoria inválida: nomes=${result.nomes_pt_br}/${result.total}, descrições=${result.descricoes_pt_br}/${result.descricoes_origem}.`);
  console.log(`   OK ${result.nomes_pt_br}/${result.total} nomes em PT-BR.`);
  console.log(`   OK ${result.descricoes_pt_br}/${result.descricoes_origem} descrições existentes em PT-BR.`);

  console.log("4/4 Finalizando...");
  console.log("\nLote 03 de habilidades localizado.");
}

main().catch((error)=>{console.error("\nFalha ao localizar habilidades — lote 03:");console.error(error instanceof Error?error.message:error);process.exitCode=1;});
