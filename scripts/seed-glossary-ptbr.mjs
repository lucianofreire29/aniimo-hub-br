import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const REVIEWED_AT = "2026-09-12T11:45:00Z";

const GROUPS = [
  {
    table: "elementos",
    entries: [
      ["Holy", "Sagrado"],
      ["Fire", "Fogo"],
      ["Ice", "Gelo"],
      ["Dark", "Sombrio"],
      ["Electric", "Elétrico"],
      ["Grass", "Planta"],
      ["Water", "Água"],
      ["Rock", "Rocha"],
      ["Wind", "Vento"],
    ],
  },
  {
    table: "funcoes",
    entries: [
      ["DPS", "DPS"],
      ["Heal", "Cura"],
      ["Support", "Suporte"],
      ["BREAK", "Ruptura (BREAK)"],
      ["REGEN", "Regeneração (REGEN)"],
    ],
  },
  {
    table: "estagios",
    entries: [
      ["Lumin Stage", "Estágio Lumin"],
      ["Gamma Stage", "Estágio Gamma"],
      ["Nova Stage", "Estágio Nova"],
    ],
  },
];

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
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

async function upsertTranslationMeta(sql, table, id, note, sourceId) {
  await sql.query(
    `INSERT INTO traducoes_pt_br (
       entidade, entidade_id, campo, origem, fonte_id, observacoes, revisado_em, atualizado_em
     )
     VALUES ($1, $2, 'nome', 'ANIIMO_BRASIL', $3, $4, $5::timestamptz, NOW())
     ON CONFLICT (entidade, entidade_id, campo) DO UPDATE SET
       origem = 'ANIIMO_BRASIL',
       fonte_id = COALESCE(EXCLUDED.fonte_id, traducoes_pt_br.fonte_id),
       observacoes = EXCLUDED.observacoes,
       revisado_em = EXCLUDED.revisado_em,
       atualizado_em = NOW()`,
    [table, id, sourceId, note, REVIEWED_AT],
  );
}

async function main() {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não encontrada. Configure o .env.local antes de executar.");
  }

  const sql = neon(databaseUrl);

  console.log("1/4 Validando estrutura PT-BR...");
  const tables = await sql.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('elementos', 'funcoes', 'estagios', 'traducoes_pt_br', 'fontes')
  `);
  const found = new Set(tables.map((row) => row.table_name));
  for (const table of ["elementos", "funcoes", "estagios", "traducoes_pt_br", "fontes"]) {
    if (!found.has(table)) {
      throw new Error(`Tabela obrigatória ausente: ${table}. Execute npm.cmd run db:ptbr:init primeiro.`);
    }
  }

  const [wikiSource] = await sql.query(
    `SELECT id FROM fontes WHERE url = 'https://wiki.aniimo.com/' LIMIT 1`,
  );
  const sourceId = wikiSource ? Number(wikiSource.id) : null;

  console.log("2/4 Aplicando glossário PT-BR...");
  let translated = 0;
  for (const group of GROUPS) {
    for (const [officialName, ptBrName] of group.entries) {
      const rows = await sql.query(
        `UPDATE public."${group.table}"
            SET nome_pt_br = $2,
                atualizado_em = NOW()
          WHERE LOWER(nome) = LOWER($1)
          RETURNING id, nome, nome_pt_br`,
        [officialName, ptBrName],
      );

      if (rows.length !== 1) {
        throw new Error(
          `Esperava 1 registro em ${group.table} para '${officialName}', mas encontrei ${rows.length}.`,
        );
      }

      const row = rows[0];
      await upsertTranslationMeta(
        sql,
        group.table,
        Number(row.id),
        `Tradução editorial do Aniimo Brasil para o termo oficial '${officialName}'.`,
        sourceId,
      );
      translated += 1;
      console.log(`   OK ${group.table}: ${row.nome} -> ${row.nome_pt_br}`);
    }
  }

  console.log("3/4 Auditando cobertura...");
  const expected = GROUPS.reduce((sum, group) => sum + group.entries.length, 0);
  if (translated !== expected) {
    throw new Error(`Cobertura incompleta: ${translated}/${expected} termos.`);
  }

  for (const group of GROUPS) {
    const [count] = await sql.query(
      `SELECT COUNT(*)::int AS total
         FROM public."${group.table}"
        WHERE nome_pt_br IS NOT NULL`,
    );
    if (count.total < group.entries.length) {
      throw new Error(`Cobertura PT-BR insuficiente em ${group.table}: ${count.total}.`);
    }
    console.log(`   OK ${group.table}: ${count.total} com nome PT-BR`);
  }

  console.log("4/4 Glossário-base concluído.");
  console.log(`\n${translated} termos fundamentais localizados para PT-BR.`);
}

main().catch((error) => {
  console.error("\nFalha ao aplicar o glossário PT-BR:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
