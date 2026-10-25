import { z } from "zod";
import { db } from "@/lib/db";
import { handle, sessionUser, jsonBody, HttpError, limit } from "@/lib/http";
import { draftSchema } from "@/lib/maker";
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await sessionUser(req);
    const id = z.uuid().parse((await params).id);
    await limit(`draft-save:${user.id}`, 60);
    const body = draftSchema.parse(await jsonBody(req));
    const result = await db.query(
      "UPDATE maker_drafts SET details=$3,endpoint=$4,updated_at=now() WHERE id=$1 AND owner_id=$2 AND published_slug IS NULL RETURNING id",
      [id, user.id, body.details, body.endpoint],
    );
    if (!result.rowCount)
      throw new HttpError(
        404,
        "Draft not found or already submitted. Open your maker dashboard to continue.",
      );
    return Response.json({ id });
  });
}
