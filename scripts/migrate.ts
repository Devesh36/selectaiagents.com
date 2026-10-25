import { readFile } from "node:fs/promises";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const client = await db.connect();
  try {
    await client.query("SELECT pg_advisory_lock(72190421)");
    const migration = await getMigrations(auth.options);
    await migration.runMigrations();
    await client.query("BEGIN");
    await client.query(
      await readFile(
        new URL("../db/001_platform.sql", import.meta.url),
        "utf8",
      ),
    );
    await client.query(
      await readFile(
        new URL("../db/002_maker_drafts.sql", import.meta.url),
        "utf8",
      ),
    );
    await client.query("COMMIT");
    console.log("Auth and platform migrations applied");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.query("SELECT pg_advisory_unlock(72190421)");
    client.release();
    await db.end();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
