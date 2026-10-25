import { handle, sessionUser, jsonBody, HttpError, limit } from "@/lib/http";
import { isOperator } from "@/lib/operator-access";
import { reviewDecisionSchema, reviewEndpoint } from "@/lib/endpoint-review";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; endpoint: string }> },
) {
  return handle(async () => {
    const user = await sessionUser(req);
    if (!isOperator(user.id))
      throw new HttpError(403, "Operator access required");
    await limit(`operator-review:${user.id}`, 30);
    const { slug, endpoint } = await params;
    const decision = reviewDecisionSchema.parse(await jsonBody(req));
    return Response.json(
      await reviewEndpoint(slug, endpoint, decision, {
        type: "operator",
        id: user.id,
        name: user.name,
      }),
    );
  });
}
