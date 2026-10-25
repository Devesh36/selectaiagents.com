import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { handle, HttpError, sessionUser, jsonBody, limit } from "@/lib/http";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { rows } = await db.query(
    `SELECT c.id,c.body,c.created_at,u.name,u.id AS user_id FROM comments c JOIN "user" u ON u.id=c.user_id WHERE agent_slug=$1 ORDER BY c.created_at DESC LIMIT 100`,
    [(await params).slug],
  );
  return Response.json({ comments: rows });
}
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handle(async () => {
    const user = await sessionUser(req);
    await limit(`comments:${user.id}`, 10, 3600);
    const { slug } = await params;
    if (
      !(
        await db.query("SELECT slug FROM agents WHERE slug=$1 AND NOT demo", [
          slug,
        ])
      ).rowCount
    )
      throw new HttpError(404, "Agent not found");
    const { body } = z
      .object({ body: z.string().trim().min(1).max(2000) })
      .parse(await jsonBody(req));
    await db.query(
      "INSERT INTO comments(id,agent_slug,user_id,body) VALUES($1,$2,$3,$4)",
      [randomUUID(), slug, user.id, body],
    );
    return Response.json({ ok: true }, { status: 201 });
  });
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handle(async () => {
    const user = await sessionUser(req);
    const { id } = z.object({ id: z.uuid() }).parse(await jsonBody(req));
    await db.query(
      "DELETE FROM comments WHERE id=$1 AND user_id=$2 AND agent_slug=$3",
      [id, user.id, (await params).slug],
    );
    return Response.json({ ok: true });
  });
}
