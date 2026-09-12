import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T14:05:00Z";
const START_ID = 237;
const END_ID = 311;
const EXPECTED_COUNT = 75;

const NAME_PT_BR = {
  "Stone Ball Cutter": "Cortador de Bola de Pedra",
  "Ice Ball Cutting": "Corte da Bola de Gelo",
  ATK: "ATK",
  "Sandstorm Spin": "Giro de Tempestade de Areia",
  "Rock Ball Blast": "Explosão da Bola de Rocha",
  "Clay Ball": "Bola de Argila",
  "Rock Tackle": "Investida Rochosa",
  "Ice Sphere": "Esfera de Gelo",
  "Rolling Ball": "Bola Rolante",
  "Boulder Blast": "Explosão de Pedregulho",
  "Thunder Field": "Campo Trovejante",
  "Lightning Dart": "Dardo Relâmpago",
  "Thunder Imprint": "Marca Trovejante",
  "Radiant Dart": "Dardo Radiante",
  "Thunderfeather Volley": "Saraivada de Penas Trovejantes",
  "Defense Mode": "Modo Defesa",
  "Guardbreak Slam": "Impacto Rompe-Guarda",
  "Guardbreak Smash": "Esmagamento Rompe-Guarda",
  "Weakening Smash": "Esmagamento Enfraquecedor",
  "Elastic Sword": "Espada Elástica",
  "Shadow Cut": "Corte Sombrio",
  "Weakening Slam": "Impacto Enfraquecedor",
  "Ironclad Armament": "Armamento Blindado",
  "Bouncy Sling": "Lançamento Saltitante",
  "Ballistic Guard": "Guarda Balística",
  "Heavy Slam": "Impacto Pesado",
  "Wind Tackle": "Investida de Vento",
  "Overcharged Claw Strike": "Golpe de Garra Sobrecarregada",
  "Wind Counter": "Contra-Ataque de Vento",
  Skyfall: "Queda Celeste",
  "Fiery Charge": "Investida Flamejante",
  "Lava Breath": "Sopro de Lava",
  "Flaming Claws": "Garras Flamejantes",
  "Hot Breath": "Sopro Ardente",
  "Fanatic Clawing": "Garras Fanáticas",
  Earthquake: "Terremoto",
  "Claw of Madness": "Garra da Loucura",
  "Critical Hit": "Acerto Crítico",
  "Rock Smash": "Esmagamento Rochoso",
  "Earth Spikes": "Espinhos de Terra",
  "Stone Shell": "Projétil de Pedra",
  "Fiery Punch": "Soco Flamejante",
  "Lava Punch": "Soco de Lava",
  "Magma Surge": "Surto de Magma",
  "Dark Energy Surge": "Surto de Energia Sombria",
  "Burning Sun": "Sol Ardente",
  "Seismic Wave": "Onda Sísmica",
  Meteors: "Meteoros",
  "Smoke Screen": "Cortina de Fumaça",
  "Roll Out": "Rolamento Ofensivo",
  "Turret Mode": "Modo Torreta",
  "Ant Nest Sentinel": "Sentinela do Formigueiro",
  "Annihilation Barrage": "Barragem de Aniquilação",
  "Swift Retreat": "Recuo Veloz",
};

const DESCRIPTION_PT_BR = {
  237: "Ergue a bola de pedra e rola para a frente, causando uma grande quantidade de dano.",
  238: "Ergue a bola de gelo e rola para a frente, causando uma grande quantidade de dano.",
  239: "Usa o poder da Terra para atacar alvos a curta distância.",
  240: "Gira continuamente consumindo EP; a velocidade de rotação e a frequência do dano aumentam com o tempo.",
  241: "Lança uma enorme bola de rocha que atravessa os alvos rolando e explode.",
  242: "Usa o poder da Terra para atacar alvos a curta distância.",
  243: "Arremessa uma bola de argila para a frente, causando dano e aplicando Desmoronamento.",
  244: "Avança contra o alvo e cria Montes de Rocha ao redor dele.",
  245: "Transforma-se em uma bola que se move automaticamente e pode ricochetear nas paredes.",
  246: "Transforma-se em uma bola que se move automaticamente e pode ricochetear nas paredes.",
  247: "Gira rapidamente, puxa escombros para perto e depois explode, criando Montes de Rocha.",
  248: "Usa o poder da Terra para atacar alvos a curta distância.",
  249: "Gera um campo elétrico que acompanha o alvo e fortalece ataques de Raio dentro dele.",
  250: "Lança um dardo elétrico que atravessa os alvos enquanto os puxa para mais perto.",
  251: "Usa o poder do Raio para atacar alvos à distância.",
  252: "Armazena o dano causado enquanto o efeito estiver ativo e o libera quando termina; pode consumir Debuff de Raio para causar dano adicional.",
  253: "Lança um dardo elétrico que atravessa os alvos enquanto os puxa para mais perto.",
  254: "Usa o poder do Raio para atacar alvos à distância.",
  255: "Transforma a eletricidade ao redor das duas asas em flechas e as dispara contra o alvo.",
  256: "Concede redução de dano e gera uma onda de choque quando é atingido.",
  257: "Salta e esmaga o alvo ao cair; o terceiro impacto consecutivo atordoa.",
  258: "Salta e esmaga o alvo ao cair; o terceiro impacto consecutivo atordoa.",
  259: "(BREAK) Usa o poder Sombrio para atacar alvos a curta distância.",
  260: "Salta e esmaga o alvo ao cair; o terceiro impacto consecutivo atordoa.",
  261: "Estende o braço e arremessa a espada; ao retornar, a espada puxa alvos comuns para mais perto.",
  262: "Enrola-se em forma de bola e gira com uma lâmina projetada para fora.",
  263: "Salta e esmaga o alvo ao cair; o terceiro impacto consecutivo atordoa.",
  264: "Endurece o corpo, melhora a recuperação de EP e o dano contra alvos em BREAK, além de liberar Dragon Slayer Strike.",
  265: "Usa poder Sombrio para atacar alvos a curta distância.",
  266: "Lança-se para a frente e pode ricochetear entre alvos próximos, aumentando o dano de BREAK recebido por eles.",
  267: "Transforma-se em uma bola, salta alto e cai causando dano enquanto entra em Defesa Total.",
  268: "(BREAK) Usa o poder Sombrio para atacar alvos a curta distância.",
  269: "Faz as mãos crescerem e esmaga o chão, causando dano a todos os alvos próximos.",
  270: "Avança e empurra alvos pequenos, aumentando a própria redução de dano.",
  271: "Golpeia o alvo com as garras, causando dano.",
  272: "(BREAK) Usa o poder do Vento para atacar alvos a curta distância.",
  273: "(BREAK) Usa o poder do Vento para atacar alvos a curta distância.",
  274: "Entra em postura defensiva e contra-ataca; acertar o tempo correto aumenta a eficiência de BREAK e atordoa.",
  275: "Voa para cima e mergulha contra o chão para causar dano elevado.",
  276: "(BREAK) Usa o poder do Vento para atacar alvos a curta distância.",
  277: "Avança contra o alvo; enquanto estiver voando, mergulha e recebe um escudo ao acertar.",
  278: "Varre a área à frente com um sopro de fogo e aplica Debuff de Fogo.",
  279: "Golpeia o alvo com as garras e pode consumir Debuff de Fogo para causar dano adicional.",
  280: "Expele chamas poderosas em uma grande área e aplica Debuff de Fogo.",
  281: "Usa o poder do Fogo para atacar alvos a curta distância.",
  282: "Golpeia o alvo com as garras até quatro vezes e interage com Fúria e Marca de Garra enquanto estiver Enfurecido.",
  283: "Pisa com força no chão, consumindo Marcas de Garra para causar dano adicional e atordoar.",
  284: "Usa o poder da Terra para atacar alvos a curta distância.",
  285: "Golpeia o alvo com as garras até quatro vezes e interage com Fúria e Marca de Garra enquanto estiver Enfurecido.",
  286: "Desfere um golpe poderoso e consome Marcas de Garra para causar dano adicional.",
  287: "Preenche imediatamente a Fúria, entra em estado Enfurecido e cai com força para causar dano explosivo após um atraso.",
  288: "Usa o poder da Terra para atacar alvos a curta distância.",
  289: "Gera uma linha de espinhos de pedra que avança, perfurando todos os alvos no caminho.",
  290: "Dispara um projétil de pedra contra o alvo.",
  291: "(BREAK) Usa o poder da Terra para atacar alvos a curta distância.",
  292: "Avança com um soco, atravessando alvos e consumindo acúmulos de Debuff de Fogo para causar dano adicional.",
  293: "Expele chamas contra o alvo, causando dano contínuo e aplicando Debuff de Fogo.",
  294: "(BREAK) Usa o poder do Fogo para atacar alvos a curta distância.",
  295: "Avança com um soco e consome acúmulos de Debuff de Fogo para causar dano adicional.",
  296: "Crava as duas garras no chão e cria um cone de espinhos derretidos; alvos com muito Debuff de Fogo são atordoados.",
  297: "Cria uma onda em forma de cone com espinhos de pedra de lava Sombria, causando dano e atordoando os alvos.",
  298: "Arremessa um enorme pedregulho derretido que explode em uma grande área, causando mais dano conforme os acúmulos de Debuff de Fogo.",
  299: "(BREAK) Usa o poder do Fogo para atacar alvos a curta distância.",
  300: "(BREAK) Usa o poder da Terra para atacar alvos a curta distância.",
  301: "Libera ondas de choque continuamente, causando dano a cada segundo por 8s.",
  302: "Lança a energia mineral armazenada para o alto, criando meteoros que caem sobre os alvos.",
  303: "(BREAK) Usa o poder da Terra para atacar alvos a curta distância.",
  304: "Cria fumaça para bloquear a visão, impedindo que alvos sejam mirados através dela.",
  305: "Chuta uma bola de lama rolante para a frente, causando dano em área no impacto.",
  306: "Usa o poder da Terra para atacar alvos à distância.",
  307: "Abaixa o chassi e substitui ataques básicos por disparos de canhão em área que consomem EP.",
  308: "Lança Cozite para pairar por perto e coordenar ataques quando a equipe usa habilidades ou Ultimates.",
  309: "Libera um golpe devastador e deixa energia transbordando na cratera para causar dano contínuo.",
  310: "Usa o poder da Terra para atacar alvos à distância.",
  311: "Recua rapidamente, deixando um clone que ataca com Descarga Elétrica e reduz a velocidade dos alvos.",
};

function loadLocalEnv(){const p=resolve(process.cwd(),".env.local");if(!existsSync(p))return;for(const r of readFileSync(p,"utf8").split(/\r?\n/)){const l=r.trim();if(!l||l.startsWith("#"))continue;const s=l.indexOf("=");if(s<1)continue;const k=l.slice(0,s).trim();let v=l.slice(s+1).trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!process.env[k])process.env[k]=v;}}
async function saveMeta(sql,id,campo,obs){await sql.query(`INSERT INTO traducoes_pt_br (entidade,entidade_id,campo,origem,fonte_id,observacoes,revisado_em,atualizado_em) VALUES ('habilidades',$1,$2,'ANIIMO_BRASIL',NULL,$3,$4::timestamptz,NOW()) ON CONFLICT (entidade,entidade_id,campo) DO UPDATE SET origem='ANIIMO_BRASIL',observacoes=EXCLUDED.observacoes,revisado_em=EXCLUDED.revisado_em,atualizado_em=NOW()`,[id,campo,obs,REVIEWED_AT]);}

async function main(){
  loadLocalEnv();const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL não encontrada no .env.local.");const sql=neon(url);
  console.log("1/4 Validando habilidades — lote 04...");
  const rows=await sql.query(`SELECT id,nome,descricao FROM habilidades WHERE id BETWEEN $1 AND $2 ORDER BY id`,[START_ID,END_ID]);
  if(rows.length!==EXPECTED_COUNT)throw new Error(`Esperadas ${EXPECTED_COUNT} habilidades, encontradas ${rows.length}.`);
  for(const row of rows){if(!NAME_PT_BR[row.nome])throw new Error(`Nome sem tradução: ${row.nome} (id ${row.id}).`);if(row.descricao&&!DESCRIPTION_PT_BR[Number(row.id)])throw new Error(`Descrição sem tradução: id ${row.id} - ${row.nome}.`);}
  console.log("2/4 Localizando habilidades...");
  for(const row of rows){const id=Number(row.id);const nome=NAME_PT_BR[row.nome];const desc=DESCRIPTION_PT_BR[id]??null;await sql.query(`UPDATE habilidades SET nome_pt_br=$2,descricao_pt_br=COALESCE($3,descricao_pt_br),atualizado_em=NOW() WHERE id=$1`,[id,nome,desc]);await saveMeta(sql,id,"nome",nome===row.nome?`Termo técnico preservado em PT-BR: ${row.nome}.`:`Tradução editorial: ${row.nome} → ${nome}.`);if(desc)await saveMeta(sql,id,"descricao","Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.");}
  console.log("   OK 75 nomes localizados.");console.log("   OK 75 descrições localizadas.");
  console.log("3/4 Auditando lote...");
  const a=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL)::int nomes_pt_br,COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'')::int descricoes_origem,COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'' AND descricao_pt_br IS NOT NULL)::int descricoes_pt_br FROM habilidades WHERE id BETWEEN $1 AND $2`,[START_ID,END_ID]);const r=a[0];if(r.total!==EXPECTED_COUNT||r.nomes_pt_br!==EXPECTED_COUNT||r.descricoes_origem!==r.descricoes_pt_br)throw new Error(`Auditoria inválida: nomes=${r.nomes_pt_br}/${r.total}, descrições=${r.descricoes_pt_br}/${r.descricoes_origem}.`);console.log(`   OK ${r.nomes_pt_br}/${r.total} nomes em PT-BR.`);console.log(`   OK ${r.descricoes_pt_br}/${r.descricoes_origem} descrições existentes em PT-BR.`);
  console.log("4/4 Finalizando...");console.log("\nLote 04 de habilidades localizado.");
}
main().catch(e=>{console.error("\nFalha ao localizar habilidades — lote 04:");console.error(e instanceof Error?e.message:e);process.exitCode=1;});
