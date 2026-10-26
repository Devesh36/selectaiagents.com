import { Pool, type PoolClient } from "pg";

if (!process.env.DATABASE_URL)
  throw new Error(
    "DATABASE_URL is required; configure .env.local before starting the app",
  );

// A shared pool also survives Next's development module reloads.
const state = globalThis as typeof globalThis & { selectPool?: Pool };
export const db = (state.selectPool ??= new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
}));

export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
