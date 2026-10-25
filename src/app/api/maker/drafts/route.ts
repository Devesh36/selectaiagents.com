import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { handle, sessionUser, jsonBody, limit } from "@/lib/http";
import { draftSchema } from "@/lib/maker";
export async function POST(req: Request) {
  return handle(async () => {
    const user = await sessionUser(req);
    await limit(`drafts:${user.id}`, 20, 3600);
    const body = draftSchema.parse(await jsonBody(req));
    const id = randomUUID();
    await db.query(
      "INSERT INTO maker_drafts(id,owner_id,details,endpoint) VALUES($1,$2,$3,$4)",
      [id, user.id, body.details, body.endpoint],
    );
    return Response.json({ id }, { status: 201 });
  });
}
