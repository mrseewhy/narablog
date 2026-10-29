import "dotenv/config";
import { Pool } from "pg";
import { ROLES } from "../lib/roles.ts";

const emailIndex = process.argv.indexOf("--email");
const email = process.argv[emailIndex + 1];
if (emailIndex < 0 || !email || !email.includes("@")) {
  console.error(
    "Usage: npm run auth:bootstrap -- --email account@example.com",
  );
  process.exit(1);
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(73629411)");
  const admins = await client.query(
    `SELECT id FROM "user" WHERE $1 = ANY(string_to_array(role, ','))`,
    [ROLES.ADMIN],
  );
  if (admins.rowCount)
    throw new Error(
      "An admin already exists. Use an authenticated admin to manage roles.",
    );
  const found = await client.query(
    'SELECT id, banned FROM "user" WHERE lower(email) = lower($1) FOR UPDATE',
    [email],
  );
  if (
    found.rowCount !== 1 ||
    found.rows[0].banned
  )
    throw new Error("Register an active account first.");
  await client.query(
    'UPDATE "user" SET role=$1, updated_at=now() WHERE id=$2',
    [ROLES.ADMIN, found.rows[0].id],
  );
  await client.query("DELETE FROM session WHERE user_id=$1", [
    found.rows[0].id,
  ]);
  await client.query("COMMIT");
  console.log("Initial admin assigned. Sign in again to continue.");
} catch (error) {
  await client.query("ROLLBACK");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
