import { NextResponse } from "next/server";
import { getAgent } from "@/lib/store";

// run: billed. Routes a call to `<agent>#<endpoint>`.
//
// MVP: returns a sandbox response without contacting the agent. The real
// router will validate `input` against the endpoint schema, inject the
// maker's credentials, forward the request, meter usage, and record the call
// for rankings.
export async function POST(req: Request) {
  if (!req.headers.get("authorization")?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer API key" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const [slug, endpointId] = String(body?.endpoint ?? "").split("#");
  const agent = slug ? await getAgent(slug) : undefined;
  const endpoint = agent?.endpoints.find((e) => e.id === endpointId);
  if (!agent || !endpoint) {
    return NextResponse.json({ error: "Unknown endpoint; expected `<agent>#<endpoint>`" }, { status: 404 });
  }

  return NextResponse.json({
    id: `run_${crypto.randomUUID()}`,
    endpoint: `${agent.slug}#${endpoint.id}`,
    mode: "sandbox",
    output: { message: `Sandbox response from ${agent.name}. Live routing is not enabled yet.` },
    usage: { costUsd: 0, wouldCostUsd: endpoint.priceUsd },
  });
}
