import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T14:55:00Z";
const START_ID = 51;
const END_ID = 95;
const EXPECTED_COUNT = 45;

const DESCRIPTION_PT_BR = {
  51: "Selecionam conchas e as transformam em pás. Dizem que produzem bolhas cor-de-rosa quando veem alguém por quem estão apaixonados.",
  52: "Pequenas criaturas narcisistas que passam muito tempo cuidando do pelo e buscando a pose perfeita.",
  53: "São fortes e poderosos, mas preferem ficar em seus ninhos decorando tudo em vez de exibir os músculos.",
  54: "Camufla-se entre conchas da praia, usando seus apêndices macios para mantê-las no lugar. Permanece fechado durante o dia.",
  55: "Deitados sobre suas conchas, encaram o céu noturno e se perdem em um sonho tecido pelas estrelas.",
  56: "Transformam as conchas que antes os protegiam em espadas e escudos para defender os frágeis Shellies ao longo da costa.",
  57: "Nunca vão a lugar algum sem suas bolas de pedra, e o rolamento constante deixa essas bolas cada vez mais redondas e estranhas.",
  58: "Movem-se para trás como seus parentes, mas de uma maneira muito mais elegante.",
  59: "Uma pedra redonda que acompanhava Baleetle dia e noite despertou depois de tantas pancadas. Cansada de ser controlada, engoliu um inseto e finalmente passou a se mover por vontade própria.",
  60: "Sempre carregam seu sorriso característico e convidam outros Aniimos para brincar. Mesmo causando problemas por travessura e ganância, acabam sempre perdoados.",
  61: "Usando a excelente condutividade do pelo, condensam o poder do Raio para estender as asas, avançando para dissipar a névoa e melhorar o humor.",
  62: "Seu capacete resistente protege o corpo macio, enquanto as garras extensíveis da boca ajudam na caça.",
  63: "Armado com uma espada quebrada e uma armadura, e dotado de coragem e força, defende seus amigos e enfrenta seus inimigos.",
  64: "Apesar do tamanho imponente, é tímido e evita conflitos. Encontra coragem quando seus amigos precisam de proteção.",
  65: "Adora morder tudo o que vê. Sua mandíbula flexível pode se abrir extremamente. Demonstra carinho com mordidinhas suaves.",
  66: "Um jovem que esconde sua fraqueza sob o capacete e sonha em ficar forte o bastante para voar livremente.",
  67: "Cobertos por uma armadura rígida, parecem estátuas altas quando ficam imóveis, como se guardassem antigos tesouros.",
  68: "Coberto por uma armadura forjada em chamas, o fogo que expele quando está furioso pode derreter quase qualquer coisa.",
  69: "Passam o dia sonâmbulos. Se forem acordados, tornam-se violentos e perdem o controle imediatamente. Depois de gastar toda a energia, voltam a dormir como bebês.",
  70: "Escondem enorme resistência e autocontrole sob uma aparência gentil. Porém, quando provocados ou famintos, perdem o controle e entram em frenesi.",
  71: "São geólogos naturais que gostam de comer todos os tipos de minerais. O que comem determina como irão crescer.",
  72: "Usam garras rígidas para esmagar cristais e comê-los, armazenando calor e fazendo padrões vermelhos flamejantes aparecerem pelo corpo.",
  73: "Cristais escaldantes crescem em seu corpo como lava solidificada. Se o calor armazenado entrar em erupção, pode derreter tudo em seu caminho.",
  74: "Os minerais que comem voltam a crescer em seus corpos, armazenando energia refinada em seu interior.",
  75: "Onde existem minerais cristalinos, eles também estão. Seus espinhos rígidos servem tanto como proteção quanto como armazenamento de energia.",
  76: "Cozites constroem suas conchas aos poucos usando lama. Quando estão em perigo, soltam fumaça pelo orifício superior para cobrir a área e se esconder.",
  77: "Bailites conseguem girar independentemente as partes superior e inferior do corpo, permitindo observar com flexibilidade e se transformar em uma torreta.",
  78: "Sua primeira reação a qualquer coisa é fugir, e os órgãos em forma de bulbo indicam se estão saudáveis.",
  79: "Uma criatura dependente de luz que brilha quando a noite chega e mantém a luz acesa até enquanto dorme.",
  80: "Muda seu brilho de acordo com o humor, enquanto os tentáculos criam padrões hipnotizantes e desferem ataques eletrizantes.",
  81: "Esfregam o óleo do próprio corpo para criar uma espuma espessa. Essa espuma limpa e protege, embora às vezes acabem escorregando nela por acidente.",
  82: "Suas penas secretam óleo constantemente, criando diferentes bolhas com um pouco de atrito. Naturalmente usam a espuma mais macia e densa para proteger os Fahloos em suas costas.",
  83: "Sempre procurando batidas que abafem seu coração insistente, Besauce adora entrar no ritmo da música.",
  84: "Cavam no subsolo para se camuflar como coral e mordem qualquer presa que se aproxime. Às vezes, porém, ficam impacientes e espiam ao redor.",
  85: "Adoram se enterrar na areia, imitando aglomerados de coral. Usam o brilho dos corais na cabeça e nas costas para atrair criaturas e atacá-las de surpresa.",
  86: "As pessoas costumam confundir os círculos em suas bochechas com olhos. Gostam de se reunir em grupos na costa e só se sentem seguros quando ficam bem próximos dos companheiros.",
  87: "Movem-se de forma desajeitada em terra usando os quatro membros, mas são especialistas em deslizar sobre a barriga.",
  88: "Estica suas penas folhosas com preguiça, mastigando sem parar enquanto transforma algas e lodo em bolhas flutuantes.",
  89: "Coberto por penas folhosas de um verde fresco, Glameep se move com leveza pela margem do lago.",
  90: "Adora colecionar bolhas coloridas e usá-las para desenhar pequenas maravilhas estranhas no ar.",
  91: "Um Aniimo de Água que lança bolhas-cápsula imprevisíveis e as transforma em efeitos de batalha.",
  92: "Um Aniimo de Gelo que esconde um estilo de luta agressivo por trás de uma aparência inocente.",
  93: "Um Aniimo de Gelo que esconde garras e presas em um corpo macio antes de congelar alvos desprevenidos.",
  94: "Um Aniimo Sagrado associado ao luar, combinando uma aparência serena com emoções intensas.",
  95: "Um Aniimo Sagrado confiante que protege seus companheiros e libera poderosos ataques solares.",
};

function loadLocalEnv(){const p=resolve(process.cwd(),".env.local");if(!existsSync(p))return;for(const r of readFileSync(p,"utf8").split(/\r?\n/)){const l=r.trim();if(!l||l.startsWith("#"))continue;const s=l.indexOf("=");if(s<1)continue;const k=l.slice(0,s).trim();let v=l.slice(s+1).trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!process.env[k])process.env[k]=v;}}
async function saveMeta(sql,id){await sql.query(`INSERT INTO traducoes_pt_br (entidade,entidade_id,campo,origem,fonte_id,observacoes,revisado_em,atualizado_em) VALUES ('aniimos',$1,'descricao','ANIIMO_BRASIL',NULL,'Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.',$2::timestamptz,NOW()) ON CONFLICT (entidade,entidade_id,campo) DO UPDATE SET origem='ANIIMO_BRASIL',observacoes=EXCLUDED.observacoes,revisado_em=EXCLUDED.revisado_em,atualizado_em=NOW()`,[id,REVIEWED_AT]);}

async function main(){
  loadLocalEnv();const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL não encontrada no .env.local.");const sql=neon(url);
  console.log("1/4 Validando Aniimos 51–95...");const rows=await sql.query(`SELECT id,nome,descricao FROM aniimos WHERE id BETWEEN $1 AND $2 ORDER BY id`,[START_ID,END_ID]);if(rows.length!==EXPECTED_COUNT)throw new Error(`Esperados ${EXPECTED_COUNT} Aniimos, encontrados ${rows.length}.`);for(const row of rows){if(!DESCRIPTION_PT_BR[Number(row.id)])throw new Error(`Descrição sem tradução: ${row.nome} (id ${row.id}).`);}
  console.log("2/4 Localizando descrições...");for(const row of rows){const id=Number(row.id);await sql.query(`UPDATE aniimos SET descricao_pt_br=$2,atualizado_em=NOW() WHERE id=$1`,[id,DESCRIPTION_PT_BR[id]]);await saveMeta(sql,id);}console.log("   OK 45 descrições localizadas.");
  console.log("3/4 Auditando lote...");const a=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE descricao_pt_br IS NOT NULL AND btrim(descricao_pt_br)<>'')::int traduzidas FROM aniimos WHERE id BETWEEN $1 AND $2`,[START_ID,END_ID]);if(a[0].total!==EXPECTED_COUNT||a[0].traduzidas!==EXPECTED_COUNT)throw new Error(`Auditoria inválida: ${a[0].traduzidas}/${a[0].total}.`);console.log("   OK 45/45 descrições em PT-BR.");
  console.log("4/4 Finalizando...");console.log("\nLote 02 de descrições dos Aniimos concluído.");
}
main().catch(e=>{console.error("\nFalha ao localizar Aniimos — lote 02:");console.error(e instanceof Error?e.message:e);process.exitCode=1;});
