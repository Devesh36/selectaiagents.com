import { caller, handle, jsonBody } from "@/lib/http";
import { execute, runSchema } from "@/lib/gateway";
export const runtime = "nodejs";
export const maxDuration = 240;
export async function POST(req: Request) {
  return handle(async () => {
    const userId = await caller(req);
    const body = runSchema.parse(await jsonBody(req));
    const result = await execute(
      userId,
      body,
      "run",
      req.headers.get("idempotency-key") ?? undefined,
    );
    return Response.json(result.body, { status: result.status });
  });
}
