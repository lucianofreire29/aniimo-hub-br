import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T14:20:00Z";
const START_ID = 312;
const END_ID = 375;
const EXPECTED_COUNT = 64;

const NAME_PT_BR = {
  "Lightning Discharge": "Descarga Elétrica",
  ATK: "ATK",
  "Healing Impact": "Impacto Curativo",
  "Water Rush": "Surto de Água",
  "Spotlight Moment": "Momento de Holofote",
  "Self-Destruction": "Autodestruição",
  "Here Comes the Bubble": "Lá Vem a Bolha",
  "Bubble Blast": "Explosão de Bolha",
  Bubbles: "Bolhas",
  "Crazy Bubbles": "Bolhas Malucas",
  "Disruptive Current": "Corrente Disruptiva",
  "Charged Geyser": "Gêiser Carregado",
  "Beat of Passion": "Batida da Paixão",
  "Electric Dance Frenzy": "Frenesi da Dança Elétrica",
  "Coral Trap": "Armadilha de Coral",
  "Quicksand Slam": "Impacto de Areia Movediça",
  "Coral Impact": "Impacto de Coral",
  "Coral Prison": "Prisão de Coral",
  "Ground Slam": "Impacto no Chão",
  "Sand Rush": "Investida de Areia",
  Icebreaker: "Quebra-Gelo",
  "Wave Surge": "Surto de Onda",
  "Aurora Protection": "Proteção da Aurora",
  "Baa-Baa Healbubb": "Baa-Baa Bolha Curativa",
  "Baa-Baa Sweetbubb": "Baa-Baa Bolha Doce",
  "Baa-Baa Leaf Shot": "Baa-Baa Disparo de Folha",
  "Baa-Baa Darkbubb": "Baa-Baa Bolha Sombria",
  "Leafwave Bubble": "Bolha de Onda Folhosa",
  "Rigged Odds": "Probabilidades Manipuladas",
  "Clearance Sale": "Liquidação",
  "Enhanced Bubble": "Bolha Aprimorada",
  "Lumin Bolts": "Projéteis Lumin",
  "Sun-Kissed": "Beijado pelo Sol",
  "Moon-Washed": "Banhado pela Lua",
  "Light Bombardment": "Bombardeio de Luz",
  "Selene's Judgment": "Julgamento de Selene",
  "Wild Dance": "Dança Selvagem",
  "Demonic State": "Estado Demoníaco",
  "Super Jackpot": "Super Jackpot",
  "Holy Storm": "Tempestade Sagrada",
  "Moon Impact": "Impacto Lunar",
  "Ashfrost Judgment": "Julgamento Ashfrost",
  "Holy Roar": "Rugido Sagrado",
  "Demon Steps": "Passos Demoníacos",
  "Helios' Judgment": "Julgamento de Helios",
  "Lunar Eclipse": "Eclipse Lunar",
};

const DESCRIPTION_PT_BR = {
  312: "Dispara um feixe de energia que causa dano aos alvos e cura companheiros do tipo Raio dentro do alcance.",
  313: "Usa o poder do Raio para atacar alvos à distância.",
  314: "Usa o poder do Raio para atacar alvos à distância.",
  315: "Dispara um feixe de energia que causa dano aos alvos e cura companheiros dentro do alcance em 2% de HP por segundo.",
  316: "Dispara um feixe de energia que causa dano aos alvos e cura companheiros do tipo Água dentro do alcance.",
  317: "Recarrega os aliados e aumenta o dano de ataques básicos e a eficiência de BREAK dos companheiros de Raio por 15s.",
  318: "Acumula voltagem até explodir, causando dano em ampla área e criando um campo que aumenta o dano de Raio.",
  319: "Usa o poder do Raio para atacar alvos à distância.",
  320: "Cria uma bolha gigante que reduz a velocidade dos inimigos, diminui a recuperação de EP deles e acelera os aliados.",
  321: "Dispara uma bolha que empurra os alvos para trás e deixa uma pequena bolha no local.",
  322: "Usa o poder da Água para atacar alvos à distância.",
  323: "Cria um campo de bolhas. Habilidades de Água usadas dentro dele geram bolhas que restauram EP quando detonadas.",
  324: "Cria seis bolhas e aumenta o dano de Água dos companheiros por 30s.",
  325: "Usa o poder da Água para atacar alvos à distância.",
  326: "Libera uma corrente elétrica, causando dano aos alvos à frente.",
  327: "Restaura 15 EP e depois 0,5 EP por segundo durante 12s.",
  328: "Continua tocando, enviando ondas sonoras para a frente que causam dano aos alvos.",
  329: "Cria um espaço musical que causa dano aos alvos e reduz a Resistência a Raio deles por 30s.",
  330: "Usa o poder do Raio para atacar alvos a curta distância.",
  331: "Cria uma armadilha de coral que causa dano aos alvos a cada segundo e aplica Debuff de Terra.",
  332: "Cria areia movediça à frente, causando dano aos alvos e aprisionando-os por 2s.",
  333: "Usa o poder da Terra para atacar alvos a curta distância.",
  334: "Causa dano ao alvo e aplica Marca de Coral; depois, a marca causa dano adicional de Terra e restaura EP.",
  335: "Causa dano em ampla área, restaura 30 EP e aprisiona os alvos atingidos por 2s.",
  336: "Usa o poder da Terra para atacar alvos a curta distância.",
  337: "Salta em direção ao alvo e cai com força, causando dano circular em área.",
  338: "Avança para a frente, empurrando os alvos e consumindo HP atual ao acertar.",
  339: "Avança para a frente, empurrando os alvos e consumindo HP atual ao acertar.",
  340: "(BREAK) Usa o poder do Gelo para atacar alvos a curta distância.",
  341: "Desliza pelo gelo, causando dano em área; o uso aprimorado adiciona outro giro e restaura HP.",
  342: "Concede aos aliados próximos um Escudo baseado no HP perdido de Wavwal por 20s.",
  343: "(BREAK) Usa o poder do Gelo para atacar alvos a curta distância.",
  344: "Enquanto flutua e se movimenta, cura todos os aliados dentro do alcance ao longo de 6s.",
  345: "Dispara um feixe de bolha que atravessa aliados e inimigos, causando dano aos inimigos e concedendo escudo aos aliados.",
  346: "Usa o poder da Planta para atacar alvos à distância.",
  347: "Dispara um Orbe de Planta e reduz a Resistência a Planta do alvo por 20s.",
  348: "Dispara um feixe de bolha que atravessa aliados e inimigos, causando dano aos inimigos e concedendo escudo aos aliados.",
  349: "Aumenta a cura recebida pelos aliados próximos e restaura HP do usuário.",
  350: "Usa o poder da Planta para atacar alvos à distância.",
  351: "Consome a cor de bolha menos comum para fazer o próximo ataque básico usar a cor mais comum e receber aumento de dano.",
  352: "Cospe bolhas continuamente contra o alvo por 5s; o dano conta como dano de ataque básico.",
  353: "Usa o poder da Água para atacar alvos à distância.",
  354: "Dispara uma bolha aprimorada cujo efeito muda conforme a cor. Bolhas arco-íris e douradas combinam vários efeitos.",
  355: "Dispara vários projéteis de luz e aplica uma marca que reduz a Resistência à Luz.",
  356: "Banhe-se na luz do sol para restaurar energia, com efeito mais forte quando aprimorado por Halo Solar.",
  357: "Banhe-se ao luar para recuperar energia.",
  358: "Mergulha do ar e cria uma explosão sagrada ao aterrissar.",
  359: "Libera o julgamento lunar sobre alvos próximos e concede temporariamente aumento de dano próprio.",
  360: "Usa luz sagrada para atacar a curta distância.",
  361: "Executa uma rápida sequência de cortes e recebe redução de dano enquanto ataca.",
  362: "Entra em um estado de combate demoníaco que consome energia, aumenta o dano das habilidades, altera seus custos e restaura HP quando o estado termina.",
  363: "Lança uma grande bolha arco-íris para causar dano em área e inicia Jackpot imediatamente.",
  364: "Cria uma tempestade sagrada giratória que causa dano e puxa alvos próximos para o centro.",
  365: "Usa luz sagrada para atacar à distância.",
  366: "Usa poder de Gelo para atacar a curta distância.",
  367: "Faz energia lunar cair sobre um alvo, com um efeito adicional em área contra alvos marcados.",
  368: "Entra em um estado demoníaco supremo, liberando ataques repetidos de garra e um efeito de dano persistente.",
  369: "Usa um rugido sagrado para causar dano aos inimigos e acumular amplificação de dano de Luz.",
  370: "Avança até o alvo, ataca e restaura uma parte do HP máximo ao acertar.",
  371: "Versão aprimorada de Bombardeio de Luz, com cura e chance de preservar seu recurso solar.",
  372: "Libera o julgamento solar sobre alvos próximos e concede temporariamente aumento de dano próprio.",
  373: "Usa poder de Gelo para atacar a curta distância.",
  374: "Usa poder de Água para atacar à distância.",
  375: "Canaliza luz lunar no alvo e causa alto dano de BREAK.",
};

function loadLocalEnv(){const p=resolve(process.cwd(),".env.local");if(!existsSync(p))return;for(const r of readFileSync(p,"utf8").split(/\r?\n/)){const l=r.trim();if(!l||l.startsWith("#"))continue;const s=l.indexOf("=");if(s<1)continue;const k=l.slice(0,s).trim();let v=l.slice(s+1).trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!process.env[k])process.env[k]=v;}}
async function saveMeta(sql,id,campo,obs){await sql.query(`INSERT INTO traducoes_pt_br (entidade,entidade_id,campo,origem,fonte_id,observacoes,revisado_em,atualizado_em) VALUES ('habilidades',$1,$2,'ANIIMO_BRASIL',NULL,$3,$4::timestamptz,NOW()) ON CONFLICT (entidade,entidade_id,campo) DO UPDATE SET origem='ANIIMO_BRASIL',observacoes=EXCLUDED.observacoes,revisado_em=EXCLUDED.revisado_em,atualizado_em=NOW()`,[id,campo,obs,REVIEWED_AT]);}

async function main(){
  loadLocalEnv();const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL não encontrada no .env.local.");const sql=neon(url);
  console.log("1/4 Validando habilidades — lote 05...");
  const rows=await sql.query(`SELECT id,nome,descricao FROM habilidades WHERE id BETWEEN $1 AND $2 ORDER BY id`,[START_ID,END_ID]);
  if(rows.length!==EXPECTED_COUNT)throw new Error(`Esperadas ${EXPECTED_COUNT} habilidades, encontradas ${rows.length}.`);
  for(const row of rows){if(!NAME_PT_BR[row.nome])throw new Error(`Nome sem tradução: ${row.nome} (id ${row.id}).`);if(row.descricao&&!DESCRIPTION_PT_BR[Number(row.id)])throw new Error(`Descrição sem tradução: id ${row.id} - ${row.nome}.`);}
  console.log("2/4 Localizando habilidades...");
  for(const row of rows){const id=Number(row.id);const nome=NAME_PT_BR[row.nome];const desc=DESCRIPTION_PT_BR[id];await sql.query(`UPDATE habilidades SET nome_pt_br=$2,descricao_pt_br=$3,atualizado_em=NOW() WHERE id=$1`,[id,nome,desc]);await saveMeta(sql,id,"nome",nome===row.nome?`Termo técnico preservado em PT-BR: ${row.nome}.`:`Tradução editorial: ${row.nome} → ${nome}.`);await saveMeta(sql,id,"descricao","Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.");}
  console.log("   OK 64 nomes localizados.");console.log("   OK 64 descrições localizadas.");
  console.log("3/4 Auditando lote...");
  const a=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL)::int nomes_pt_br,COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'')::int descricoes_origem,COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'' AND descricao_pt_br IS NOT NULL)::int descricoes_pt_br FROM habilidades WHERE id BETWEEN $1 AND $2`,[START_ID,END_ID]);const r=a[0];if(r.total!==EXPECTED_COUNT||r.nomes_pt_br!==EXPECTED_COUNT||r.descricoes_origem!==r.descricoes_pt_br)throw new Error(`Auditoria inválida: nomes=${r.nomes_pt_br}/${r.total}, descrições=${r.descricoes_pt_br}/${r.descricoes_origem}.`);console.log(`   OK ${r.nomes_pt_br}/${r.total} nomes em PT-BR.`);console.log(`   OK ${r.descricoes_pt_br}/${r.descricoes_origem} descrições existentes em PT-BR.`);
  console.log("4/4 Finalizando...");console.log("\nLote 05 de habilidades localizado.");
}
main().catch(e=>{console.error("\nFalha ao localizar habilidades — lote 05:");console.error(e instanceof Error?e.message:e);process.exitCode=1;});
