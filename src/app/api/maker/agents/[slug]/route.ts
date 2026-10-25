import { transaction } from "@/lib/db";
import { handle, sessionUser, jsonBody, HttpError, limit } from "@/lib/http";
import { draftSchema } from "@/lib/maker";
import { buildAgent } from "@/lib/submission";
import type { Agent } from "@/lib/types";
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handle(async () => {
    const user = await sessionUser(req);
    await limit(`listing-edit:${user.id}`, 30);
    const { slug } = await params;
    const details = draftSchema.shape.details.parse(await jsonBody(req));
    await transaction(async (c) => {
      const row = (
        await c.query(
          "SELECT data FROM agents WHERE slug=$1 AND owner_id=$2 AND NOT demo FOR UPDATE",
          [slug, user.id],
        )
      ).rows[0];
      if (!row) throw new HttpError(404, "Your agent was not found");
      const old = row.data as Agent;
      const result = buildAgent(
        {
          ...details,
          pricingModel: old.pricing.model,
          priceUsd: old.pricing.priceUsd,
          unit: old.pricing.unit,
        },
        new Set(),
        old.launchedAt,
      );
      if ("errors" in result)
        throw new HttpError(400, Object.values(result.errors).join(" "));
      // Preserve URL/API identity, launch date, price and endpoint settings.
      if (details.name !== old.name || details.maker !== old.maker)
        throw new HttpError(
          400,
          "Agent and maker names cannot change after publication because they identify the agent in the API.",
        );
      await c.query("UPDATE agents SET data=$2 WHERE slug=$1", [
        slug,
        {
          ...old,
          tagline: result.agent.tagline,
          description: result.agent.description,
          category: result.agent.category,
          website: result.agent.website,
          tags: result.agent.tags,
        },
      ]);
    });
    return Response.json({ ok: true });
  });
}
