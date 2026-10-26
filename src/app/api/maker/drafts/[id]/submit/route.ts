import { z } from "zod";
import { transaction } from "@/lib/db";
import { handle, sessionUser, HttpError, limit } from "@/lib/http";
import { listingForSubmission, reviewedEndpoint } from "@/lib/maker";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await sessionUser(req);
    const id = z.uuid().parse((await params).id);
    await limit(`draft-submit:${user.id}`, 10, 3600);
    try {
      const slug = await transaction(async (c) => {
        const draft = (
          await c.query(
            "SELECT * FROM maker_drafts WHERE id=$1 AND owner_id=$2 FOR UPDATE",
            [id, user.id],
          )
        ).rows[0];
        if (!draft) throw new HttpError(404, "Draft not found");
        // Safe to repeat after a lost response: never publish a second listing.
        if (draft.published_slug) return draft.published_slug as string;
        if (!draft.endpoint)
          throw new HttpError(400, "Add your endpoint before submitting.");
        const config = reviewedEndpoint(draft.endpoint);
        const agent = listingForSubmission(draft.details, config);
        agent.endpoints = [
          {
            id: config.id,
            method: "POST",
            path: "/v1/run",
            description: config.description,
            priceUsd: config.priceMicros / 1e6,
          },
        ];
        await c.query(
          "INSERT INTO agents(slug,owner_id,data) VALUES($1,$2,$3)",
          [agent.slug, user.id, agent],
        );
        await c.query(
          "INSERT INTO endpoints(agent_slug,id,config,approved) VALUES($1,$2,$3,false)",
          [agent.slug, config.id, config],
        );
        await c.query(
          "UPDATE maker_drafts SET published_slug=$2,updated_at=now() WHERE id=$1",
          [id, agent.slug],
        );
        return agent.slug;
      });
      return Response.json({ slug });
    } catch (error) {
      if ((error as { code?: string }).code === "23505")
        throw new HttpError(
          409,
          "That agent name is already taken. Change the name in Details and submit again.",
        );
      throw error;
    }
  });
}
