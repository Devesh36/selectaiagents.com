import { randomBytes, randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { wallet } from "@/lib/billing";
import { handle, jsonBody, sessionUser, limit } from "@/lib/http";
export async function GET(req: Request) {
  return handle(async () => {
    const user = await sessionUser(req, false);
    const [keys, ledger, calls, owned] = await Promise.all([
      db.query(
        "SELECT id,name,prefix,created_at,revoked_at FROM api_keys WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100",
        [user.id],
      ),
      db.query(
        "SELECT amount_micros,kind,created_at FROM ledger WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
        [user.id],
      ),
      db.query(
        "SELECT id,status,charged_micros,created_at FROM requests WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
        [user.id],
      ),
      db.query(
        "SELECT slug,data->>'name' AS name FROM agents WHERE owner_id=$1",
        [user.id],
      ),
    ]);
    return Response.json({
      wallet: await wallet(user.id),
      keys: keys.rows,
      ledger: ledger.rows,
      calls: calls.rows,
      agents: owned.rows,
      paymentsEnabled: Boolean(
        process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
      ),
    });
  });
}
export async function POST(req: Request) {
  return handle(async () => {
    const user = await sessionUser(req);
    await limit(`keys:${user.id}`, 10, 3600);
    const { name } = z
      .object({ name: z.string().trim().min(1).max(60) })
      .parse(await jsonBody(req));
    const key = `saa_${randomBytes(32).toString("hex")}`;
    await db.query(
      "INSERT INTO api_keys(id,user_id,name,prefix,hash) VALUES($1,$2,$3,$4,$5)",
      [
        randomUUID(),
        user.id,
        name,
        key.slice(0, 12),
        createHash("sha256").update(key).digest("hex"),
      ],
    );
    return Response.json({ key }, { status: 201 });
  });
}
export async function DELETE(req: Request) {
  return handle(async () => {
    const user = await sessionUser(req);
    const { id } = z.object({ id: z.uuid() }).parse(await jsonBody(req));
    await db.query(
      "UPDATE api_keys SET revoked_at=now() WHERE id=$1 AND user_id=$2",
      [id, user.id],
    );
    return Response.json({ ok: true });
  });
}
