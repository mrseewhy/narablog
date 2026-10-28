import "dotenv/config";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Pool } from "pg";

// One-time adoption of the exact pre-existing schema, never a schema reset.
const snapshot = JSON.parse(
  await readFile("drizzle/meta/0003_snapshot.json", "utf8"),
);
const journal = JSON.parse(
  await readFile("drizzle/meta/_journal.json", "utf8"),
);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
const normalizeType = (s) =>
  s
    .replace("character varying", "varchar")
    .replace("timestamp without time zone", "timestamp");
const normalizeDefault = (s) =>
  s == null
    ? null
    : String(s)
        .replace(/::(?:text|character varying)/g, "")
        .replace(/\s+/g, " ")
        .trim();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(73629412)");
  const existing = await client.query(
    "SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations",
  );
  if (existing.rows[0].count !== 0)
    throw new Error(
      "Migration history is not empty; reconcile it manually instead of baselining.",
    );
  const errors = [];
  for (const table of Object.values(snapshot.tables)) {
    const columns = await client.query(
      `SELECT a.attname AS name, format_type(a.atttypid,a.atttypmod) AS type, a.attnotnull AS not_null, a.attidentity AS identity, pg_get_expr(d.adbin,d.adrelid) AS default_value FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum WHERE n.nspname='public' AND c.relname=$1 AND a.attnum>0 AND NOT a.attisdropped`,
      [table.name],
    );
    for (const expected of Object.values(table.columns)) {
      const actual = columns.rows.find((c) => c.name === expected.name);
      if (
        !actual ||
        normalizeType(actual.type) !== expected.type ||
        actual.not_null !== expected.notNull ||
        normalizeDefault(actual.default_value) !==
          normalizeDefault(expected.default ?? null) ||
        (expected.identity && actual.identity !== "a")
      )
        errors.push(`${table.name}.${expected.name}`);
    }
    const constraints = await client.query(
      `SELECT con.conname AS name,con.contype AS type FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=$1`,
      [table.name],
    );
    for (const name of Object.keys(table.uniqueConstraints ?? {}))
      if (!constraints.rows.some((c) => c.name === name && c.type === "u"))
        errors.push(`${table.name} unique ${name}`);
    for (const name of Object.keys(table.foreignKeys ?? {}))
      if (!constraints.rows.some((c) => c.name === name && c.type === "f"))
        errors.push(`${table.name} foreign key ${name}`);
    const indexes = await client.query(
      "SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename=$1",
      [table.name],
    );
    for (const name of Object.keys(table.indexes ?? {}))
      if (!indexes.rows.some((i) => i.indexname === name))
        errors.push(`${table.name} index ${name}`);
  }
  if (errors.length)
    throw new Error(`Schema differs from baseline: ${errors.join(", ")}`);
  console.log(
    "Existing columns, defaults, nullability, identities, constraints, and indexes match snapshot 0003.",
  );
  if (process.argv.includes("--apply")) {
    for (const entry of journal.entries.filter((e) => e.idx <= 3)) {
      const sql = await readFile(`drizzle/${entry.tag}.sql`, "utf8");
      await client.query(
        "INSERT INTO drizzle.__drizzle_migrations(hash,created_at) VALUES($1,$2)",
        [createHash("sha256").update(sql).digest("hex"), entry.when],
      );
    }
    await client.query("COMMIT");
    console.log(
      "Recorded the four pre-existing migrations. No account or content records changed.",
    );
  } else {
    await client.query("ROLLBACK");
    console.log("Dry run only. Use --apply to record the baseline.");
  }
} catch (error) {
  await client.query("ROLLBACK");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
