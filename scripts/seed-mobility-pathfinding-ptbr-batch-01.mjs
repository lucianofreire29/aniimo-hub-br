import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T12:00:00Z";

const PATHFINDINGS = [
  { slug: "fly", nomePtBr: "Voo" },
  { slug: "swim", nomePtBr: "Natação" },
  { slug: "climb", nomePtBr: "Escalada" },
];

const MOBILITIES = [
  {
    slug: "hustle",
    nomePtBr: "Aceleração",
    descricaoPtBr: "Entra no estado de Aceleração, aumentando a velocidade de movimento ao consumir vigor.",
  },
  {
    slug: "take-off",
    nomePtBr: "Decolagem",
    descricaoPtBr: "Entra no estado de Voo para desviar de ataques de inimigos terrestres. Recebe mais dano enquanto está no ar.",
  },
  {
    slug: "blooming",
    nomePtBr: "Florescer",
    descricaoPtBr: "Flores desabrocham por onde ele dança.",
  },
  {
    slug: "puff-up",
    nomePtBr: "Inflar",
    descricaoPtBr: "Infla o corpo para saltar mais alto e realizar uma investida aérea.",
  },
  {
    slug: "cloudwalk",
    nomePtBr: "Caminhada nas Nuvens",
    descricaoPtBr: "Flutua livremente entre as nuvens.",
  },
  {
    slug: "dig-in",
    nomePtBr: "Escavação",
    descricaoPtBr: null,
  },
  {
    slug: "luminous-seed",
    nomePtBr: "Semente Luminosa",
    descricaoPtBr: "Arremessa sementes luminosas que iluminam a área ao redor quando pousam.",
  },
  {
    slug: "tunnel",
    nomePtBr: "Túnel",
    descricaoPtBr: "Escava por baixo da terra, ficando imune a ataques à distância enquanto consome vigor. Habilidades de impacto no chão podem lançar o Aniimo para o ar.",
  },
  {
    slug: "cloak",
    nomePtBr: "Camuflagem",
    descricaoPtBr: "Entra no estado de Camuflagem.",
  },
  {
    slug: "high-jump",
    nomePtBr: "Salto Alto",
    descricaoPtBr: "Permite realizar um salto mais alto.",
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

async function saveTranslationMeta(sql, entidade, entidadeId, campo, observacoes) {
  await sql.query(
    `INSERT INTO traducoes_pt_br (
       entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
     )
     VALUES ($1, $2, $3, 'ANIIMO_BRASIL', NULL, $4, $5::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
       origem = 'ANIIMO_BRASIL',
       observacoes = EXCLUDED.observacoes,
       revisado_em = EXCLUDED.revisado_em,
       atualizado_em = NOW()`,
    [entidade, entidadeId, campo, observacoes, REVIEWED_AT],
  );
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL não encontrada no .env.local.");

  const sql = neon(databaseUrl);

  console.log("1/5 Validando a estrutura PT-BR...");
  const required = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('pathfindings', 'mobilidades', 'traducoes_pt_br')
  `);
  if (required.length !== 3) {
    throw new Error("Estrutura PT-BR incompleta. Execute npm.cmd run db:ptbr:init primeiro.");
  }

  console.log("2/5 Localizando Pathfinding...");
  for (const entry of PATHFINDINGS) {
    const rows = await sql.query(
      `UPDATE pathfindings
          SET nome_pt_br = $2, atualizado_em = NOW()
        WHERE slug = $1
        RETURNING id, nome`,
      [entry.slug, entry.nomePtBr],
    );
    if (rows.length !== 1) throw new Error(`Pathfinding não encontrado: ${entry.slug}`);
    const row = rows[0];
    await saveTranslationMeta(
      sql,
      "pathfindings",
      Number(row.id),
      "nome",
      `Tradução editorial: ${row.nome} → ${entry.nomePtBr}.`,
    );
    console.log(`   OK ${row.nome} / ${entry.nomePtBr}`);
  }

  console.log("3/5 Localizando mobilidades — lote 01...");
  for (const entry of MOBILITIES) {
    const rows = await sql.query(
      `UPDATE mobilidades
          SET nome_pt_br = $2,
              descricao_pt_br = COALESCE($3, descricao_pt_br),
              atualizado_em = NOW()
        WHERE slug = $1
        RETURNING id, nome, descricao`,
      [entry.slug, entry.nomePtBr, entry.descricaoPtBr],
    );
    if (rows.length !== 1) throw new Error(`Mobilidade não encontrada: ${entry.slug}`);

    const row = rows[0];
    await saveTranslationMeta(
      sql,
      "mobilidades",
      Number(row.id),
      "nome",
      `Tradução editorial: ${row.nome} → ${entry.nomePtBr}.`,
    );
    if (entry.descricaoPtBr) {
      await saveTranslationMeta(
        sql,
        "mobilidades",
        Number(row.id),
        "descricao",
        "Descrição traduzida editorialmente a partir do texto oficial preservado em inglês.",
      );
    }
    console.log(`   OK ${row.nome} / ${entry.nomePtBr}`);
  }

  console.log("4/5 Auditando o lote...");
  const pathAudit = await sql.query(
    `SELECT slug, nome, nome_pt_br FROM pathfindings WHERE slug = ANY($1::text[]) ORDER BY slug`,
    [PATHFINDINGS.map((entry) => entry.slug)],
  );
  const mobilityAudit = await sql.query(
    `SELECT slug, nome, nome_pt_br, descricao, descricao_pt_br
       FROM mobilidades
      WHERE slug = ANY($1::text[])
      ORDER BY slug`,
    [MOBILITIES.map((entry) => entry.slug)],
  );

  if (pathAudit.length !== PATHFINDINGS.length) {
    throw new Error(`Auditoria encontrou ${pathAudit.length} de ${PATHFINDINGS.length} Pathfindings.`);
  }
  if (mobilityAudit.length !== MOBILITIES.length) {
    throw new Error(`Auditoria encontrou ${mobilityAudit.length} de ${MOBILITIES.length} mobilidades.`);
  }
  for (const row of [...pathAudit, ...mobilityAudit]) {
    if (!row.nome_pt_br) throw new Error(`Registro sem nome PT-BR: ${row.slug}`);
  }

  console.log(`   OK ${pathAudit.length} Pathfindings localizados.`);
  console.log(`   OK ${mobilityAudit.length} mobilidades localizadas.`);

  console.log("5/5 Finalizando...");
  console.log("\nLote PT-BR concluído: 3 Pathfindings + 10 mobilidades.");
}

main().catch((error) => {
  console.error("\nFalha ao localizar Pathfinding/mobilidades:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
