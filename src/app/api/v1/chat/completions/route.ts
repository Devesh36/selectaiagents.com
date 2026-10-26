import { caller, handle, jsonBody } from "@/lib/http";
import { execute, chatSchema } from "@/lib/gateway";
export const runtime = "nodejs";
export const maxDuration = 240;
export async function POST(req: Request) {
  return handle(async () => {
    const userId = await caller(req);
    const body = chatSchema.parse(await jsonBody(req));
    const result = await execute(
      userId,
      body,
      "chat",
      req.headers.get("idempotency-key") ?? undefined,
    );
    return Response.json(result.body, { status: result.status });
  });
}
