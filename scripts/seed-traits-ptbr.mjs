import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T13:00:00Z";

const TRAITS_PT_BR = {
  1: ["Chamas Escaldantes", "Aumenta em 15% o dano causado a inimigos fracos ao seu elemento."],
  2: ["Alma Plena", "Após 8 ataques básicos em batalha, Inferlupa entra no estado Alma Plena. A próxima habilidade é fortalecida e seu dano passa a ser tratado como dano de ataque básico."],
  7: ["Grande Feiticeiro", "Por 5s após usar uma habilidade, acertos de ataques básicos causam dano adicional igual a 5 de Poder."],
  8: ["Membro da Banda", "Ao trocar de Aniimo em batalha, restaura 12,5 EP ao próximo membro da família Chirpi que entrar em campo. Pode ocorrer no máximo uma vez a cada 20s."],
  9: ["Superioridade Aérea", "Aumenta a taxa crítica em 20% enquanto estiver voando."],
  10: ["Concerto da Vitória", "Enquanto estiver protegido por escudo, a eficiência de Ruptura (BREAK) aumenta em 40%. Ao causar BREAK, toca um Concerto que reduz em 30% o custo de stamina de toda a equipe. Com 3 buffs da série Movimento, aumenta todos os efeitos de Movimento em 30%."],
  11: ["Aniimo Disco", "Sobre grama, o dano aumenta. Acertos de habilidades acumulam Poder da Dança e podem fazer a próxima habilidade não consumir EP."],
  12: ["Aglomerado Floral", "Acertos dos clones acumulam Poder da Dança. Ao atingir o limite, a próxima habilidade custa menos EP e cura aliados próximos. Também inclui um efeito de reviver com duração limitada."],
  13: ["Espírito da Água", "Enquanto estiver em terreno com água, reduz em 10% o custo de EP de todas as habilidades."],
  14: ["Poder da Natureza", "Enquanto estiver fora de campo, cria grama sob um companheiro depois que esse companheiro usar três habilidades."],
  15: ["Envolto em Névoa", "Após seis ataques básicos, recebe Envolto em Névoa. A próxima habilidade consome o efeito para receber um aprimoramento."],
  16: ["Contando Carneirinhos", "Periodicamente aplica Sonolência por meio de habilidades. Acúmulos suficientes ativam Pesadelo, reduzindo a Resistência Sombria e controlando brevemente o alvo."],
  24: ["Energizado", "A cada 1.000 de HP máximo, aumenta em 2% o dano de Ruptura (BREAK)."],
  25: ["Travessura", "A cada 18s, a próxima habilidade aplica Maldição aos inimigos atingidos por 10s. Ataques básicos Sombrios restauram 0,25 EP ao atingir inimigos amaldiçoados."],
  26: ["Mestre das Travessuras", "Aumenta o dano de Ruptura (BREAK) em % a cada 21.000 de HP máximo, conforme o texto atualmente exibido na fonte oficial. Ao entrar em batalha, invoca 1 Hummin para ajudar. Um Hummin adicional é invocado a cada 10s, até o máximo de 3."],
  27: ["Furtividade", "Habilidades acumulam Impulso ao causar dano, até 6 acúmulos. O ganho de Impulso é dobrado durante escavação. No máximo de acúmulos, aumenta a eficiência de Ruptura (BREAK) em 30% por 15s."],
  28: ["Corrosão Gélida", "Ataques básicos acumulam anomalia elemental de Gelo no alvo. O BREAK causado a alvos com mais de 5 acúmulos de Gelo aumenta em 35%."],
  29: ["Chamas Ardentes", "Mantém sempre 20 acúmulos de Debuff de Fogo. Trick Fire Ring aplica 4 acúmulos de Debuff de Fogo, enquanto Fire Orb aplica 3."],
  30: ["Cura Alada", "Ao entrar em batalha como Aniimo ativo, aumenta a cura em 20%. Se estiver fora de campo, aparece como um fantasma. Quando outros Aniimos usam habilidades ou Ultimates, restaura HP equivalente a 0,5% do HP máximo."],
  31: ["Energia Plena", "Aumenta o EP máximo em 10."],
  32: ["Tempestade do Julgamento", "Quando uma habilidade aplica um debuff a um alvo, o dano de Vento de toda a equipe aumenta em 20% por 15s."],
  33: ["Dança das Espadas", "Cada habilidade usada concede 1 acúmulo de Dança das Espadas, até 4, por 15s. Cada ataque básico consome 1 acúmulo para causar 180% de dano adicional."],
  34: ["Abertura Fantasma", "Quando um companheiro causa dano de ataque básico, recebe 1 acúmulo de Marca da Rosa, até 10. Cada acúmulo reduz em 3 o custo de EP de Melloblum."],
  35: ["Sintonia", "Cada habilidade usada concede 1 acúmulo de Volume, até 6. Com 6 acúmulos, aumenta a taxa crítica em 15% por 15s."],
  36: ["Momento de Holofote", "A primeira habilidade usada nos 5s após entrar em batalha não consome EP. Recarga: 17s."],
  37: ["Fragrância Perigosa", "Quando uma habilidade causa dano a um alvo, reduz a Resistência Sombria do alvo em 7% por 20s."],
  38: ["Fervor de Batalha", "Derrotar um alvo concede 1 acúmulo de Sede de Batalha, aumentando o dano em 25% por 20s. Acumula até 2 vezes."],
  39: ["Reserva Elétrica", "Restaura 4 EP quando uma habilidade causa um acerto crítico."],
  40: ["Vento Cortante", "Ao causar dano a alvos com mais de 5 acúmulos de Debuff de Gelo, aumenta em 15% a taxa crítica desse dano."],
  41: ["Sustentação de Poder", "Depois que habilidades causam 6 acertos críticos, entra em Sobrecarregado e recebe imediatamente um escudo equivalente a 5% do HP. Todas as habilidades passam a custar 12 EP a menos, mas não é possível obter UP. Dura 6s."],
  42: ["Charme", "Ao entrar em batalha, se a equipe tiver um membro da família Susuta do sexo oposto, aumenta a própria eficiência de Ruptura (BREAK) em 30% por 15s. Recarga: 20s."],
  46: ["Charme Radiante", "Aumenta em 12% o dano de Água de todos os Aniimos do sexo oposto na equipe."],
  47: ["Coração das Marés", "Enquanto estiver em terreno com água ou após absorver água, aumenta o dano de Água em 20%. A duração depende do Aniimo/forma e fica armazenada na relação da forma."],
  48: ["Motor Sobrecarregado", "Mover-se e usar habilidades acumula Energia de Sobrecarga. O efeito exato ao atingir carga máxima fica armazenado na relação da forma quando houver variação."],
  49: ["Fortalecimento de Rocha", "Montes de Rocha criados por Bouldus podem ser destruídos por Stone Ball Drift de Waleetle, liberando ondas de choque e aplicando Desintegração."],
  50: ["Vínculo Trovejante", "Quando ataques atingem um alvo, recebe Vínculo Trovejante. Com 30 acúmulos, a próxima habilidade ou Ultimate ativa a Postura Asa do Trovão por 10s."],
  51: ["Ressonância de Ruptura", "Aumenta BREAK em 0, conforme exibido atualmente no Wiki Oficial do Aniimo."],
  52: ["Perseguição", "Causa 30% de dano adicional a alvos afetados por efeitos de controle ou BREAK."],
  53: ["Contra-Ataque", "Após ser atacado, aumenta a eficiência de Ruptura (BREAK) em 30% por 10s."],
  54: ["Poder do Fogo", "Causa 40% de dano adicional a inimigos com mais de 5 acúmulos de Debuff de Fogo."],
  55: ["Fúria Devastadora", "Acumula Fúria durante a batalha. Com 100 de Fúria, entra no estado Enfurecido, aumentando velocidade de ataque, dano de habilidades e recuperação de EP por 20s."],
  56: ["Afinidade com a Terra", "Enquanto estiver no estado de Escavação, pode usar habilidades e causa 30% de BREAK adicional."],
  57: ["Carga Ígnea", "Após gastar a quantidade necessária de EP, recebe Carga Ígnea e aplica periodicamente Debuff de Fogo a alvos próximos por 10s. A página oficial contém atualmente texto numérico malformado nesse efeito."],
  58: ["Erosão Potente", "Quando uma habilidade ou Ultimate atinge um alvo, reduz a Resistência à Terra do alvo em 2%. Acumula até 5 vezes e dura 10s."],
  59: ["Surto de Arco", "Companheiros que recebem o buff de habilidade deste Aniimo também recebem 25% de dano de Raio por 15s."],
  60: ["Bolha", "A cada 12s, entra em Banho. A próxima habilidade usada cria uma poça."],
  61: ["Surto de Poder", "Ao usar uma habilidade com menos de 20 EP, restaura 2,5 EP."],
  62: ["Coral Sobrecarregado", "Ao entrar em batalha, restaura 2,5 EP para cada Aniimo do tipo Terra na equipe. Recarga: 15s."],
  63: ["Inverno Rigoroso", "Após usar 3 habilidades, aprimora a próxima habilidade usada durante Icebreaker. Com HP abaixo de 75%, eficiência de BREAK +20%; abaixo de 50%, +40%."],
  64: ["Energia de Bolha", "Restaura automaticamente 1 Energia de Bolha a cada 3s. Habilidades que causam dano restauram mais 3, até o máximo de 10. Baa-Baa Healbubb consome 10 para restaurar 12% adicional."],
  65: ["Gachapon", "Ataques básicos e habilidades sorteiam bolhas coloridas. Bolhas iguais ou uma bolha dourada ativam Jackpot por 10s e aumentam o dano de ataques básicos em 60%."],
  66: ["Graça Solar", "Melhora o dano sem vantagem elemental e concede periodicamente Halo Solar para aprimorar a próxima habilidade."],
  67: ["Poder Lunar", "Melhora o dano sem vantagem elemental e usa acúmulos de Marca da Lua Prateada para fortalecer ataques básicos e restaurar HP."],
  68: ["Sede de Sangue", "O dano aumenta conforme o HP é perdido, até o limite exibido na página oficial."],
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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function saveMeta(sql, id, campo, observacoes) {
  await sql.query(
    `INSERT INTO traducoes_pt_br (
       entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
     ) VALUES ('traits', $1, $2, 'ANIIMO_BRASIL', NULL, $3, $4::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
       origem = 'ANIIMO_BRASIL',
       observacoes = EXCLUDED.observacoes,
       revisado_em = EXCLUDED.revisado_em,
       atualizado_em = NOW()`,
    [id, campo, observacoes, REVIEWED_AT],
  );
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");
  const sql = neon(databaseUrl);

  console.log("1/4 Validando traits...");
  const rows = await sql.query(`SELECT id, nome, descricao FROM traits ORDER BY id`);
  const expected = Object.keys(TRAITS_PT_BR).length;
  if (rows.length !== expected || expected !== 54) {
    throw new Error(`Esperados 54 traits, mas banco=${rows.length} e traduções=${expected}.`);
  }

  for (const row of rows) {
    if (!TRAITS_PT_BR[Number(row.id)]) {
      throw new Error(`Trait sem tradução preparada: ${row.id} - ${row.nome}.`);
    }
  }

  console.log("2/4 Localizando 54 traits...");
  for (const row of rows) {
    const id = Number(row.id);
    const [nomePtBr, descricaoPtBr] = TRAITS_PT_BR[id];
    await sql.query(
      `UPDATE traits
          SET nome_pt_br = $2,
              descricao_pt_br = $3,
              atualizado_em = NOW()
        WHERE id = $1`,
      [id, nomePtBr, descricaoPtBr],
    );
    await saveMeta(sql, id, "nome", `Tradução editorial: ${row.nome} → ${nomePtBr}.`);
    await saveMeta(sql, id, "descricao", "Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.");
  }
  console.log("   OK 54 nomes localizados.");
  console.log("   OK 54 descrições localizadas.");

  console.log("3/4 Auditando traits...");
  const audit = await sql.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL)::int AS nomes_pt_br,
            COUNT(*) FILTER (WHERE descricao_pt_br IS NOT NULL)::int AS descricoes_pt_br
       FROM traits`,
  );
  const result = audit[0];
  if (result.total !== 54 || result.nomes_pt_br !== 54 || result.descricoes_pt_br !== 54) {
    throw new Error(`Auditoria inválida: nomes=${result.nomes_pt_br}/54, descrições=${result.descricoes_pt_br}/54.`);
  }
  console.log("   OK 54/54 nomes em PT-BR.");
  console.log("   OK 54/54 descrições em PT-BR.");

  console.log("4/4 Finalizando...");
  console.log("\nTraits localizados e auditados.");
}

main().catch((error) => {
  console.error("\nFalha ao localizar traits:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
