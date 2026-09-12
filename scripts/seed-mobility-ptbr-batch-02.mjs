import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T12:20:00Z";

const MOBILITIES = [
  {
    slug: "scurry",
    nomePtBr: "Disparada",
    descricaoPtBr: "Avança rapidamente por uma curta distância.",
  },
  {
    slug: "detection",
    nomePtBr: "Detecção",
    descricaoPtBr: "Concede uma visão investigativa especial que permite enxergar objetos metálicos e Aniimos camuflados nas proximidades.",
  },
  {
    slug: "hookshot",
    nomePtBr: "Gancho",
    descricaoPtBr: "Estende um braço em direção ao centro da visão e, ao atingir paredes ou inimigos, puxa o Aniimo até o alvo.",
  },
  {
    slug: "bilateral",
    nomePtBr: "Bilateral",
    descricaoPtBr: "Entra no modo Bilateral para oferecer uma perspectiva diferente.",
  },
  {
    slug: "head-hammer",
    nomePtBr: "Martelada de Cabeça",
    descricaoPtBr: "Usa a Martelada de Cabeça para lançar uma Onda de Choque.",
  },
  {
    slug: "fast-and-furious",
    nomePtBr: "Rápido e Furioso",
    descricaoPtBr: "Aumenta a velocidade de movimento e permite arremessar certos obstáculos enquanto consome vigor.",
  },
  {
    slug: "glow",
    nomePtBr: "Brilho",
    descricaoPtBr: "Emite luz de cima para iluminar os arredores.",
  },
  {
    slug: "floaty-bubble",
    nomePtBr: "Bolha Flutuante",
    descricaoPtBr: "Esfrega o próprio corpo para criar uma grande bolha ao seu redor.",
  },
  {
    slug: "bubble-drift",
    nomePtBr: "Deriva de Bolha",
    descricaoPtBr: "Sopra uma grande bolha flutuante.",
  },
];

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
     VALUES ('mobilidades', $1, $2, 'ANIIMO_BRASIL', NULL, $3, $4::timestamptz, NOW())
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

  console.log("1/4 Validando a estrutura PT-BR...");
  const required = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('mobilidades', 'traducoes_pt_br')
  `);
  if (required.length !== 2) {
    throw new Error("Estrutura PT-BR incompleta. Execute npm.cmd run db:ptbr:init primeiro.");
  }

  console.log("2/4 Localizando mobilidades — lote 02...");
  for (const entry of MOBILITIES) {
    const rows = await sql.query(
      `UPDATE mobilidades
          SET nome_pt_br = $2,
              descricao_pt_br = $3,
              atualizado_em = NOW()
        WHERE slug = $1
        RETURNING id, nome`,
      [entry.slug, entry.nomePtBr, entry.descricaoPtBr],
    );

    if (rows.length !== 1) throw new Error(`Mobilidade não encontrada: ${entry.slug}`);
    const row = rows[0];

    await saveTranslationMeta(
      sql,
      Number(row.id),
      "nome",
      `Tradução editorial: ${row.nome} → ${entry.nomePtBr}.`,
    );
    await saveTranslationMeta(
      sql,
      Number(row.id),
      "descricao",
      "Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.",
    );

    console.log(`   OK ${row.nome} / ${entry.nomePtBr}`);
  }

  console.log("3/4 Auditando o lote...");
  const audit = await sql.query(
    `SELECT slug, nome, nome_pt_br, descricao_pt_br
       FROM mobilidades
      WHERE slug = ANY($1::text[])
      ORDER BY slug`,
    [MOBILITIES.map((entry) => entry.slug)],
  );

  if (audit.length !== MOBILITIES.length) {
    throw new Error(`Auditoria encontrou ${audit.length} de ${MOBILITIES.length} mobilidades.`);
  }
  for (const row of audit) {
    if (!row.nome_pt_br || !row.descricao_pt_br) {
      throw new Error(`Mobilidade sem localização completa: ${row.slug}`);
    }
  }
  console.log(`   OK ${audit.length} mobilidades localizadas.`);

  console.log("4/4 Finalizando...");
  console.log("\nLote PT-BR concluído: 9 mobilidades restantes.");
}

main().catch((error) => {
  console.error("\nFalha ao localizar mobilidades — lote 02:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
