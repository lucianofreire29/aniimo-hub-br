import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T13:20:00Z";
const START_ID = 1;
const END_ID = 75;
const EXPECTED_COUNT = 75;

const NAME_PT_BR = {
  "Fire Kick": "Chute de Fogo",
  "Pebble Kick": "Chute de Pedregulho",
  "Fire Bolt": "Projétil de Fogo",
  ATK: "ATK",
  "Burn Breaker": "Rompedor Ardente",
  "Lightning Kick": "Chute Relâmpago",
  "Falling Star": "Estrela Cadente",
  "Immortal Wolf Soul": "Alma Imortal do Lobo",
  "Wolf Pack": "Matilha",
  Crossfire: "Fogo Cruzado",
  "Wolf Pack Assault": "Investida da Matilha",
  "Pause Gust": "Rajada Suspensa",
  "Gale Guard": "Guarda do Vendaval",
  "Lay down arms": "Depor as Armas",
  "Shooting Star Bombs": "Bombas de Estrela Cadente",
  "Star Glide": "Deslize Estelar",
  "Leaf Tornado": "Tornado de Folhas",
  "Tornado Wind Orb": "Orbe de Tornado",
  March: "Marcha",
  "Water Tornado": "Tornado de Água",
  Tornado: "Tornado",
  "Lightning Splitter": "Divisor Relâmpago",
  "Wind Bomb Rush": "Rajada de Bombas de Vento",
  "Scream Splitter": "Divisor de Gritos",
  "Avian Harmony Ensemble": "Conjunto de Harmonia Aviária",
  "Spiral Blade": "Lâmina Espiral",
  Waltz: "Valsa",
  "Zephyr's Breath": "Sopro de Zéfiro",
  "Shadow Magic": "Magia Sombria",
  "Chill Glide": "Deslize Gélido",
  "Shooting Star Glide": "Deslize de Estrelas Cadentes",
  "Shooting Stars": "Estrelas Cadentes",
  "Aquatic Glide": "Deslize Aquático",
  "Comet Aureus": "Cometa Áureo",
  "Dream Blast": "Explosão Onírica",
  "Hypnotic Cloud Shot": "Disparo de Nuvem Hipnótica",
  "Nightmare Devourer": "Devorador de Pesadelos",
  "Nimbi Attack": "Ataque de Nimbi",
  "Collectible Drop": "Queda Colecionável",
  "Nebula Burst": "Explosão de Nebulosa",
  "Nimbi Burst": "Explosão de Nimbi",
  "Cloud Shield": "Escudo de Nuvem",
  "Thunder Bolt": "Raio",
  "Cloud Orb": "Orbe de Nuvem",
  "Lotus Bloom": "Florescer de Lótus",
  "Vine Entanglement": "Emaranhado de Vinhas",
  "Cyclone of Leaves": "Ciclone de Folhas",
  "Blooms of Vigor": "Flores do Vigor",
  "Spring of Life": "Fonte da Vida",
  "Bubble Rush": "Rajada de Bolhas",
  "Glimmer Shot": "Disparo Cintilante",
  "Ice Orb": "Orbe de Gelo",
  "Water Orb": "Orbe de Água",
  "Healing Water": "Água Curativa",
  "Florae Descent": "Descida de Florae",
  "Irisalis Shadow": "Sombra de Irisalis",
};

const DESCRIPTION_PT_BR = {
  1: "Salta para desviar de um ataque, envolve-se em chamas e desfere um chute em mergulho, causando dano a todos os alvos próximos ao impacto. Uma esquiva bem-sucedida também causa 120% de dano e aumenta o dano em 20% por 20s.",
  2: "Salta para desviar de um ataque, envolve-se em pedras quebradas e desfere um chute em mergulho, causando dano a todos os alvos próximos ao impacto. Uma esquiva bem-sucedida também causa 120% de dano e aumenta o dano em 20% por 20s.",
  3: "Lança uma bola de fogo no alvo e aplica 2 acúmulos de Debuff de Fogo por 5s. Segure o botão da habilidade para mirar.",
  4: "Usa o poder do Fogo para atacar alvos a curta distância.",
  5: "Usa o poder do Fogo para atacar alvos a curta distância.",
  6: "Após carregar, libera uma poderosa explosão para a frente, causando dano. Na carga máxima, consome todo o EP restante. A cada 10 EP adicionais consumidos, causa 25% de dano adicional.",
  7: "Salta para desviar de um ataque, envolve-se em eletricidade e desfere um chute em mergulho, causando dano a todos os alvos próximos ao impacto. Uma esquiva bem-sucedida também causa 120% de dano e aumenta o dano em 20% por 20s.",
  8: "Salta e golpeia o chão com um punho envolto em chamas, causando dano em uma grande área.",
  9: "Usa o poder do Fogo para atacar alvos a curta distância.",
  10: "Lança uma alma de lobo que ricocheteia entre alvos. Cada acerto aumenta a eficiência de Ruptura (BREAK) em 10% por acúmulo, até 3 acúmulos por 20s. Normalmente ricocheteia 5 vezes; no estado Alma Plena, 7 vezes.",
  11: "Invoca dois clones espirituais que atacam o local designado. No estado Alma Plena, invoca um clone adicional.",
  12: "Dispara um feixe de chamas que atravessa alvos e pode atingir até 9 vezes. No estado Alma Plena, o poder aumenta em 45%.",
  13: "(BREAK) Usa poder Sombrio para atacar alvos a curta distância.",
  14: "Os clones espirituais invocados avançam e explodem ao atingir um alvo, causando dano.",
  15: "Usa poder Sombrio para atacar alvos à distância.",
  16: "Usa poder Sombrio para atacar alvos à distância.",
  17: "(BREAK) Usa o poder do Vento para atacar alvos à distância.",
  18: "Usa o poder do Vento para atacar alvos à distância.",
  19: "Usa o poder do Vento para atacar alvos à distância.",
  20: "Usa o poder do Vento para atacar alvos à distância.",
  21: "Bate as asas para lançar 2 redemoinhos curvos que puxam os alvos ao longo de suas trajetórias. Quando se encontram, explodem e causam dano em área.",
  22: "Assume uma postura defensiva e recebe 20% de Redução de Dano. Quando a postura termina, recebe um escudo baseado no HP máximo.",
  23: "Cria um campo que concede continuamente 35% de redução de dano aos aliados dentro do alcance por 7s. O nome é provisório porque a página oficial em inglês exibe atualmente um placeholder de tradução.",
  24: "Dispara estrelas para atacar um alvo, causando dano.",
  25: "Voa sobre os alvos, deixando cair estrelas que causam dano. Atingir o mesmo alvo 3 vezes aumenta em 10% a taxa de recuperação de EP deste Aniimo por 10s.",
  26: "Libera um vórtice de folhas no local do alvo, causando dano e puxando inimigos para o centro.",
  27: "Lança um orbe de vento em forma de tornado que explode ao atingir o alvo e gera um tornado que avança para a frente.",
  28: "Toca música e recebe Marcha, restaurando 0,8% do HP máximo por segundo durante 20s. Com 3 buffs da série Movimento ativos, todos os efeitos aumentam em 30%.",
  29: "Libera um vórtice de água no local do alvo, causando dano e puxando inimigos para o centro.",
  30: "Libera um vórtice de ar no local do alvo, causando dano e puxando inimigos para o centro.",
  31: "Dispara vários projéteis Elétricos em alvos próximos. Vários acertos na mesma unidade aumentam o dano de Cornet em 30% por 15s.",
  32: "Dispara rapidamente uma barragem contínua de projéteis de Vento.",
  33: "Dispara vários projéteis estridentes em alvos próximos. Vários acertos na mesma unidade aumentam o dano de Cornet em 30% por 15s.",
  34: "Dispara um poderoso feixe do tipo Vento contra o alvo. Se os três Movimentos estiverem equipados, a área do ataque é ampliada.",
  35: "Dispara uma Bomba de Vento contra o alvo. Uma segunda explosão causa dano adicional em área e reduz a Resistência a Vento dos alvos atingidos.",
  36: "Toca música e recebe Valsa, aumentando o Dano Crítico em 17% por 20s. Com 3 buffs da série Movimento ativos, todos os efeitos aumentam em 30%.",
  37: "Causa dano de Vento em uma grande área e aumenta em 25% o dano de Vento de todos os membros da equipe por 30s.",
  38: "Liberta-se imediatamente de efeitos de controle e recua do alvo, deixando um clone por 20s. O clone imita ataques básicos e habilidades com dano reduzido.",
  39: "Voa sobre os alvos, deixando cair estrelas de Gelo que causam dano. Atingir o mesmo alvo 3 vezes aumenta em 10% a taxa de recuperação de EP por 10s.",
  40: "Voa sobre os alvos, deixando cair estrelas que causam dano. Atingir o mesmo alvo 3 vezes aumenta em 10% a taxa de recuperação de EP por 10s.",
  41: "Dispara 3 estrelas teleguiadas. Cada vez que uma estrela causa dano, o usuário recebe 1% de Bônus de Dano, acumulando até 15 vezes.",
  42: "Voa sobre os alvos, deixando cair estrelas de Água que causam dano. Atingir o mesmo alvo 3 vezes aumenta em 10% a taxa de recuperação de EP por 10s.",
  43: "Invoca uma grande quantidade de cometas do céu para atacar um alvo, causando uma enorme quantidade de dano.",
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
    `INSERT INTO traducoes_pt_br (
       entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
     ) VALUES ('habilidades', $1, $2, 'ANIIMO_BRASIL', NULL, $3, $4::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
       origem = 'ANIIMO_BRASIL', observacoes = EXCLUDED.observacoes,
       revisado_em = EXCLUDED.revisado_em, atualizado_em = NOW()`,
    [id, campo, observacoes, REVIEWED_AT],
  );
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/4 Validando habilidades 1–75...");
  const rows = await sql.query(
    `SELECT id, nome, descricao FROM habilidades WHERE id BETWEEN $1 AND $2 ORDER BY id`,
    [START_ID, END_ID],
  );
  if (rows.length !== EXPECTED_COUNT) {
    throw new Error(`Esperadas ${EXPECTED_COUNT} habilidades, mas foram encontradas ${rows.length}.`);
  }
  for (const row of rows) {
    if (!NAME_PT_BR[row.nome]) throw new Error(`Nome sem tradução: ${row.nome} (id ${row.id}).`);
    if (row.descricao && !DESCRIPTION_PT_BR[Number(row.id)]) {
      throw new Error(`Descrição sem tradução: id ${row.id} - ${row.nome}.`);
    }
  }

  console.log("2/4 Localizando habilidades...");
  let translatedDescriptions = 0;
  for (const row of rows) {
    const id = Number(row.id);
    const nomePtBr = NAME_PT_BR[row.nome];
    const descricaoPtBr = DESCRIPTION_PT_BR[id] ?? null;
    await sql.query(
      `UPDATE habilidades SET nome_pt_br = $2, descricao_pt_br = COALESCE($3, descricao_pt_br), atualizado_em = NOW() WHERE id = $1`,
      [id, nomePtBr, descricaoPtBr],
    );
    await saveMeta(sql, id, "nome", nomePtBr === row.nome ? `Termo técnico preservado em PT-BR: ${row.nome}.` : `Tradução editorial: ${row.nome} → ${nomePtBr}.`);
    if (descricaoPtBr) {
      translatedDescriptions += 1;
      await saveMeta(sql, id, "descricao", "Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.");
    }
  }
  console.log(`   OK ${rows.length} nomes localizados.`);
  console.log(`   OK ${translatedDescriptions} descrições existentes localizadas.`);

  console.log("3/4 Auditando lote...");
  const audit = await sql.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL)::int AS nomes_pt_br,
            COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao) <> '')::int AS descricoes_origem,
            COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao) <> '' AND descricao_pt_br IS NOT NULL)::int AS descricoes_pt_br
       FROM habilidades WHERE id BETWEEN $1 AND $2`,
    [START_ID, END_ID],
  );
  const result = audit[0];
  if (result.total !== EXPECTED_COUNT || result.nomes_pt_br !== EXPECTED_COUNT || result.descricoes_origem !== result.descricoes_pt_br) {
    throw new Error(`Auditoria inválida: nomes=${result.nomes_pt_br}/${result.total}, descrições=${result.descricoes_pt_br}/${result.descricoes_origem}.`);
  }
  console.log(`   OK ${result.nomes_pt_br}/${result.total} nomes em PT-BR.`);
  console.log(`   OK ${result.descricoes_pt_br}/${result.descricoes_origem} descrições existentes em PT-BR.`);

  console.log("4/4 Finalizando...");
  console.log("\nLote 01 de habilidades localizado: IDs 1–75.");
}

main().catch((error) => {
  console.error("\nFalha ao localizar habilidades — lote 01:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
