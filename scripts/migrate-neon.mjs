import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const TABLES = [
  "fontes",
  "elementos",
  "funcoes",
  "estagios",
  "pathfindings",
  "mobilidades",
  "traits",
  "regioes",
  "patches",
  "aniimos",
  "aniimo_formas",
  "habilidades",
  "forma_atributos",
  "forma_elementos",
  "forma_habilidades",
  "forma_traits",
  "forma_mobilidades",
  "forma_regioes",
  "forma_homeland_valores",
  "forma_pathfindings",
  "evolucoes",
  "alteracoes_aniimo",
];

const CHUNK_SIZE = 150;

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.migrate");
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

function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function normalizeType(column) {
  switch (column.data_type) {
    case "character varying":
      return column.character_maximum_length
        ? `character varying(${column.character_maximum_length})`
        : "character varying";
    case "character":
      return column.character_maximum_length
        ? `character(${column.character_maximum_length})`
        : "character";
    case "numeric":
      if (column.numeric_precision && column.numeric_scale !== null) {
        return `numeric(${column.numeric_precision},${column.numeric_scale})`;
      }
      return "numeric";
    case "timestamp with time zone":
      return "timestamp with time zone";
    case "timestamp without time zone":
      return "timestamp without time zone";
    case "USER-DEFINED":
      return quoteIdentifier(column.udt_name);
    default:
      return column.data_type;
  }
}

function serialize(value) {
  return JSON.stringify(value, (_, item) =>
    typeof item === "bigint" ? item.toString() : item,
  );
}

function extractSequence(defaultExpression) {
  if (!defaultExpression) return null;
  const match = defaultExpression.match(/^nextval\('(?:public\.)?([^']+)'::regclass\)$/);
  return match?.[1] ?? null;
}

async function queryRows(sql, text, params = []) {
  const result = await sql.query(text, params);
  return Array.isArray(result) ? result : result.rows;
}

async function main() {
  loadLocalEnv();

  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  const destinationUrl = process.env.DESTINATION_DATABASE_URL;

  if (!sourceUrl || !destinationUrl) {
    throw new Error(
      "Crie o arquivo .env.migrate com SOURCE_DATABASE_URL e DESTINATION_DATABASE_URL antes de executar a migração.",
    );
  }

  if (sourceUrl === destinationUrl) {
    throw new Error("Origem e destino não podem usar a mesma DATABASE_URL.");
  }

  const source = neon(sourceUrl);
  const destination = neon(destinationUrl);

  console.log("1/7 Verificando o banco de origem...");
  const sourceTableRows = await queryRows(
    source,
    `SELECT table_name
       FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name`,
  );
  const sourceTableNames = new Set(sourceTableRows.map((row) => row.table_name));
  const missingTables = TABLES.filter((table) => !sourceTableNames.has(table));
  if (missingTables.length) {
    throw new Error(`Tabelas ausentes na origem: ${missingTables.join(", ")}`);
  }

  console.log("2/7 Lendo schema e dados do banco antigo...");
  const columns = await queryRows(
    source,
    `SELECT table_name, column_name, ordinal_position, is_nullable, data_type,
            udt_name, character_maximum_length, numeric_precision, numeric_scale,
            column_default
       FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position`,
  );

  const constraints = await queryRows(
    source,
    `SELECT c.relname AS table_name,
            con.conname,
            con.contype,
            pg_get_constraintdef(con.oid, true) AS definition
       FROM pg_constraint con
       JOIN pg_class c ON c.oid = con.conrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
      ORDER BY c.relname, con.contype, con.conname`,
  );

  const indexes = await queryRows(
    source,
    `SELECT i.tablename AS table_name, i.indexname, i.indexdef
       FROM pg_indexes i
      WHERE i.schemaname = 'public'
        AND NOT EXISTS (
          SELECT 1 FROM pg_constraint c WHERE c.conname = i.indexname
        )
      ORDER BY i.tablename, i.indexname`,
  );

  const data = {};
  for (const table of TABLES) {
    const rows = await queryRows(
      source,
      `SELECT * FROM public.${quoteIdentifier(table)}`,
    );
    data[table] = rows;
    console.log(`   ${table}: ${rows.length} linhas`);
  }

  mkdirSync(resolve(process.cwd(), "backups"), { recursive: true });
  const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const backupPath = resolve(process.cwd(), "backups", `aniimo-brasil-${stamp}.json`);
  writeFileSync(
    backupPath,
    serialize({
      createdAt: new Date().toISOString(),
      tables: TABLES,
      columns,
      constraints,
      indexes,
      data,
    }),
    "utf8",
  );
  console.log(`3/7 Backup local criado em: ${backupPath}`);

  console.log("4/7 Verificando se o projeto novo está vazio...");
  const destinationTableRows = await queryRows(
    destination,
    `SELECT table_name
       FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'`,
  );
  const destinationNames = new Set(destinationTableRows.map((row) => row.table_name));
  const conflicts = TABLES.filter((table) => destinationNames.has(table));
  if (conflicts.length) {
    throw new Error(
      `Migração interrompida por segurança. O destino já contém: ${conflicts.join(", ")}. Nenhuma tabela do Aniimo Brasil foi sobrescrita.`,
    );
  }

  console.log("5/7 Recriando o schema no projeto novo...");
  const sequences = [];

  for (const table of TABLES) {
    const tableColumns = columns
      .filter((column) => column.table_name === table)
      .sort((a, b) => a.ordinal_position - b.ordinal_position);

    if (!tableColumns.length) {
      throw new Error(`Não foi possível ler as colunas de ${table}.`);
    }

    const definitions = tableColumns.map((column) => {
      const sequence = extractSequence(column.column_default);
      if (sequence) {
        sequences.push({
          table,
          column: column.column_name,
          sequence,
        });
      }

      const defaultClause =
        column.column_default && !sequence
          ? ` DEFAULT ${column.column_default}`
          : "";
      const notNullClause = column.is_nullable === "NO" ? " NOT NULL" : "";

      return `${quoteIdentifier(column.column_name)} ${normalizeType(column)}${defaultClause}${notNullClause}`;
    });

    await destination.query(
      `CREATE TABLE public.${quoteIdentifier(table)} (${definitions.join(", ")})`,
    );
  }

  for (const item of sequences) {
    await destination.query(
      `CREATE SEQUENCE public.${quoteIdentifier(item.sequence)}`,
    );
    await destination.query(
      `ALTER SEQUENCE public.${quoteIdentifier(item.sequence)} OWNED BY public.${quoteIdentifier(item.table)}.${quoteIdentifier(item.column)}`,
    );
    await destination.query(
      `ALTER TABLE public.${quoteIdentifier(item.table)} ALTER COLUMN ${quoteIdentifier(item.column)} SET DEFAULT nextval('public.${item.sequence}'::regclass)`,
    );
  }

  console.log("6/7 Copiando os dados e reconstruindo constraints...");
  for (const table of TABLES) {
    const rows = data[table];
    for (let offset = 0; offset < rows.length; offset += CHUNK_SIZE) {
      const chunk = rows.slice(offset, offset + CHUNK_SIZE);
      await destination.query(
        `INSERT INTO public.${quoteIdentifier(table)}
         SELECT * FROM jsonb_populate_recordset(NULL::public.${quoteIdentifier(table)}, $1::jsonb)`,
        [serialize(chunk)],
      );
    }
  }

  for (const item of sequences) {
    await destination.query(
      `SELECT setval(
         $1::regclass,
         COALESCE((SELECT MAX(${quoteIdentifier(item.column)}) FROM public.${quoteIdentifier(item.table)}), 1),
         EXISTS (SELECT 1 FROM public.${quoteIdentifier(item.table)})
       )`,
      [`public.${item.sequence}`],
    );
  }

  const supportedConstraints = constraints.filter(
    (constraint) =>
      TABLES.includes(constraint.table_name) &&
      ["p", "u", "c", "f"].includes(constraint.contype),
  );

  const constraintPriority = { p: 1, u: 2, c: 3, f: 4 };
  supportedConstraints.sort(
    (a, b) =>
      constraintPriority[a.contype] - constraintPriority[b.contype] ||
      a.table_name.localeCompare(b.table_name),
  );

  for (const constraint of supportedConstraints) {
    await destination.query(
      `ALTER TABLE public.${quoteIdentifier(constraint.table_name)}
       ADD CONSTRAINT ${quoteIdentifier(constraint.conname)} ${constraint.definition}`,
    );
  }

  for (const index of indexes.filter((item) => TABLES.includes(item.table_name))) {
    await destination.query(index.indexdef);
  }

  console.log("7/7 Validando as contagens...");
  let valid = true;
  for (const table of TABLES) {
    const [destinationCount] = await queryRows(
      destination,
      `SELECT COUNT(*)::int AS total FROM public.${quoteIdentifier(table)}`,
    );
    const sourceCount = data[table].length;
    const targetCount = Number(destinationCount.total);
    const status = sourceCount === targetCount ? "OK" : "ERRO";
    if (status !== "OK") valid = false;
    console.log(`   ${status} ${table}: ${sourceCount} -> ${targetCount}`);
  }

  if (!valid) {
    throw new Error(
      "A cópia terminou, mas uma ou mais contagens não conferem. Preserve o backup local e não use o banco novo até revisar.",
    );
  }

  console.log("\nMigração concluída com sucesso.");
  console.log("O backup local foi preservado e todas as contagens conferem.");
}

main().catch((error) => {
  console.error("\nFalha na migração:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
