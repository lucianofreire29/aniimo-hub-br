import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T14:40:00Z";
const START_ID = 1;
const END_ID = 50;
const EXPECTED_COUNT = 50;

const DESCRIPTION_PT_BR = {
  1: "Criaturas vivazes que gostam de seguir os Flameruffs. Quando o pelo em brasa começa a queimar, elas prosperam.",
  2: "Criaturas de matilha que valorizam lealdade e união. Esses caçadores mantêm um olhar focado e calmo que esconde seus corações ardentes.",
  3: "Gostam da emoção da batalha, pois as chamas e as queimaduras marcam seu crescimento.",
  4: "Após ser derrotado ao desafiar adversários mais fortes, Inferlupa absorve as almas de companheiros caídos que compartilham a mesma frustração, transformando seu desejo de vingança em poder.",
  5: "Costumam pairar em baixa altitude, atentos a cada movimento na praia para não perder nenhuma oportunidade.",
  6: "Adoram comida! Quando procuram alimento na floresta, as estrelas brilhantes em suas cabeças costumam ser confundidas com cometas. Gostam de acumular comida e decorar seus ninhos com ela.",
  7: "Produz sons graves, semelhantes aos de uma tuba, que combinam com seu jeito constante e amigável.",
  8: "Gostam de se divertir e produzir música rítmica, então não se surpreenda ao encontrar uma grande sinfonia.",
  9: "Preferem a solidão e costumam se mover durante a noite. Com formas estreladas que lembram mantos, parecem magos misteriosos e podem se teleportar usando energia psíquica.",
  10: "Conseguem produzir sons altos e penetrantes que ecoam por toda a praia apenas para chamar atenção.",
  11: "Iris é um Aniimo leve de Planta cujas formas variam de acordo com o habitat.",
  12: "Um Aniimo dançarino evoluído que aprimora continuamente sua técnica e canaliza vitalidade por meio do movimento.",
  13: "Um Aniimo Prismana de Planta que canaliza cor e vitalidade por meio de clones florais.",
  14: "Um Aniimo de Água que se esconde debaixo d'água e observa os arredores sob uma folha de lótus.",
  15: "Um Aniimo de Água que gosta de umidade, com formas regionais adaptadas a flores e neve.",
  16: "Um Aniimo curandeiro elegante que protege os mais fracos e possui formas relacionadas a Água, Gelo e Prismana.",
  17: "Um Aniimo de Planta e Água que vive entre lótus, focado em regeneração de energia e suporte à equipe.",
  18: "Um Aniimo flutuante de Vento cujas formas regionais também podem canalizar poder Elétrico ou de Gelo.",
  19: "Um Aniimo de suporte semelhante a uma nuvem, com várias formas regionais e Prismana.",
  20: "Um Aniimo de suporte Sombrio cujo pelo impregnado de sonhos está ligado aos efeitos de Sonolência e Pesadelo.",
  21: "Embora pareçam fogo, essas chamas são apenas energia em movimento. Elas não emitem calor algum — na verdade, absorvem o calor ao redor. Às vezes usam isso para se disfarçar de fogueiras e pregar peças nos outros.",
  22: "Vivem em grupos nas pradarias, gostam de cavar em busca de nutrientes e adoram cantar juntos — sempre desafinados!",
  23: "Formam pares para a vida toda e são sempre encontrados em dupla. A Heartbloom no topo de suas conchas indica seu estado de felicidade.",
  24: "São tímidos e se escondem sempre que percebem perigo, mas as escamas fluorescentes que soltam sempre acabam denunciando sua presença.",
  25: "Produzem ruídos estranhos para levar intrusos à loucura, reduzir suas defesas e até fazê-los desmaiar.",
  26: "Só aparecem à noite. Seus corpos são feitos de energia gasosa e podem se dividir como quiserem!",
  27: "Precisam absorver nutrientes do solo pelas raízes para manter a vitalidade e odeiam sair do chão.",
  28: "As plantas exuberantes que cobrem suas conchas transformam a luz do sol em nutrientes, então em dias ensolarados eles nem precisam comer.",
  29: "Esconde-se em cavernas. Os minerais presentes em sua alimentação cobrem gradualmente sua concha com cristais; permanece no subsolo e usa sua bela concha para atrair presas.",
  30: "Viajantes solitários. Criam ilusões ao soltar escamas das asas quando ameaças se aproximam.",
  31: "Suas magníficas asas espalham escamas que ajudam as flores a crescer e levam vitalidade por onde passam.",
  32: "Com as grandes orelhas sempre erguidas, são extremamente sensíveis ao som. Não deixam passar nenhum movimento que chame sua atenção, perto ou longe.",
  33: "Curiosos e habilidosos em procurar rastros e perseguir alvos. O anel em sua cauda amplifica ultrassons, permitindo detectar facilmente criaturas camufladas.",
  34: "Esses chorões tímidos também conseguem enfrentar inimigos quando ficam encurralados. Quando isso acontece, os brotos em suas cabeças florescem.",
  35: "As espadas feitas de caules espinhosos só são desembainhadas quando chega a hora de proteger a matilha contra inimigos.",
  36: "Para encerrar conflitos, espalham pétalas perfumadas que fazem quem as toca sentir felicidade e perder a vontade de lutar.",
  37: "Recolhem-se dentro das conchas para descansar e muitas vezes são confundidos com ovos. Têm medo de batalhas, mas adoram plateias e dançam com bolas de grama para animar os outros.",
  38: "Têm membros flexíveis e adoram exibir seus chutes chamativos para quem estiver olhando. Usam a pele trocada sobre a cabeça como um capuz estiloso.",
  39: "Suas crinas enormes revelam sua natureza selvagem, enquanto os rugidos ferozes mostram quem realmente são. As caudas armazenam ondas sonoras e liberam uma explosão sônica ao atingir um oponente.",
  40: "Como parceiros de perfumistas, armazenam e fermentam néctar dentro do corpo, transformando-o em ingredientes para perfumes.",
  41: "São exigentes com odores, por isso coletam e armazenam diferentes tipos de néctar para criar ingredientes de perfume únicos.",
  42: "Se a única maneira de evoluir é derrotar outros Wisptis, então não há outra escolha além de manter as garras afiadas.",
  43: "Afiando suas lâminas, esperam o momento perfeito escondidos nas sombras enquanto brincam com a presa. Como assassinos de sangue-frio, buscam encerrar cada luta com um único golpe.",
  44: "Evoluiu de um Wisptis com os membros dianteiros quebrados ao absorver o poder do Raio. As lâminas invertidas remodeladas são extremamente afiadas e brilham com intensa luz elétrica.",
  45: "Um filhote cheio de energia com um par de orelhas grandes. A gravata de osso de gelo em seu peito é seu brinquedo favorito. Detesta Emberpups que não respeitam espaço pessoal.",
  46: "Resistindo a carinhos que poderiam amolecer sua determinação, lidera caçadas em matilha usando sua lâmina de gelo.",
  47: "Guerreiros orgulhosos e confiantes. As lâminas geladas em sua boca fazem os inimigos estremecerem.",
  48: "Vivem entre as árvores. Ao atacar, faíscas douradas brilham em suas caudas com estalos elétricos. Ágeis e rápidos, são muito difíceis de capturar.",
  49: "Usam seu pelo especial para capturar partículas carregadas no ar, produzindo e armazenando eletricidade.",
  50: "Cavam por toda parte em busca de presentes para oferecer às suas paixões, mas suas tentativas de conquista sempre falham porque são muito tímidos.",
};

function loadLocalEnv(){const p=resolve(process.cwd(),".env.local");if(!existsSync(p))return;for(const r of readFileSync(p,"utf8").split(/\r?\n/)){const l=r.trim();if(!l||l.startsWith("#"))continue;const s=l.indexOf("=");if(s<1)continue;const k=l.slice(0,s).trim();let v=l.slice(s+1).trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!process.env[k])process.env[k]=v;}}
async function saveMeta(sql,id){await sql.query(`INSERT INTO traducoes_pt_br (entidade,entidade_id,campo,origem,fonte_id,observacoes,revisado_em,atualizado_em) VALUES ('aniimos',$1,'descricao','ANIIMO_BRASIL',NULL,'Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.',$2::timestamptz,NOW()) ON CONFLICT (entidade,entidade_id,campo) DO UPDATE SET origem='ANIIMO_BRASIL',observacoes=EXCLUDED.observacoes,revisado_em=EXCLUDED.revisado_em,atualizado_em=NOW()`,[id,REVIEWED_AT]);}

async function main(){
  loadLocalEnv();const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL não encontrada no .env.local.");const sql=neon(url);
  console.log("1/4 Validando Aniimos 1–50...");const rows=await sql.query(`SELECT id,nome,descricao FROM aniimos WHERE id BETWEEN $1 AND $2 ORDER BY id`,[START_ID,END_ID]);if(rows.length!==EXPECTED_COUNT)throw new Error(`Esperados ${EXPECTED_COUNT} Aniimos, encontrados ${rows.length}.`);for(const row of rows){if(!DESCRIPTION_PT_BR[Number(row.id)])throw new Error(`Descrição sem tradução: ${row.nome} (id ${row.id}).`);}
  console.log("2/4 Localizando descrições...");for(const row of rows){const id=Number(row.id);await sql.query(`UPDATE aniimos SET descricao_pt_br=$2,atualizado_em=NOW() WHERE id=$1`,[id,DESCRIPTION_PT_BR[id]]);await saveMeta(sql,id);}console.log("   OK 50 descrições localizadas.");
  console.log("3/4 Auditando lote...");const a=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE descricao_pt_br IS NOT NULL AND btrim(descricao_pt_br)<>'')::int traduzidas FROM aniimos WHERE id BETWEEN $1 AND $2`,[START_ID,END_ID]);if(a[0].total!==EXPECTED_COUNT||a[0].traduzidas!==EXPECTED_COUNT)throw new Error(`Auditoria inválida: ${a[0].traduzidas}/${a[0].total}.`);console.log("   OK 50/50 descrições em PT-BR.");
  console.log("4/4 Finalizando...");console.log("\nLote 01 de descrições dos Aniimos concluído.");
}
main().catch(e=>{console.error("\nFalha ao localizar Aniimos — lote 01:");console.error(e instanceof Error?e.message:e);process.exitCode=1;});
