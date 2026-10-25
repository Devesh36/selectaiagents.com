import { NextResponse } from "next/server";
import { requireKey } from "@/lib/api";
import { agentId, route, type SortBy } from "@/lib/router";
import { listAgents } from "@/lib/store";

// run: billed. Calls `<agent>#<endpoint>` with structured `input`, trying
// `fallbacks` in order. `endpoint: "auto"` picks by `route.category`/`route.sort`.
//
// Preview: returns a sandbox response without contacting the agent. The real
// router will validate `input`, inject the maker's credentials, forward the
// request, meter usage, and record the call for rankings.
export async function POST(req: Request) {
  const denied = requireKey(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const result = route(await listAgents(), {
    model: String(body?.endpoint ?? ""),
    models: Array.isArray(body?.fallbacks) ? body.fallbacks.map(String) : undefined,
    category: body?.route?.category,
    sort: body?.route?.sort as SortBy | undefined,
  });
  if ("error" in result) {
    return NextResponse.json(
      { error: "Unknown or unavailable endpoint; expected `<agent>#<endpoint>`", routing: { attempts: result.attempts } },
      { status: 404 },
    );
  }

  const { agent, endpoint, attempts } = result;
  return NextResponse.json({
    id: `run_${crypto.randomUUID()}`,
    endpoint: `${agentId(agent)}#${endpoint.id}`,
    mode: "sandbox",
    output: { message: `Sandbox response from ${agent.name}. Live routing is not enabled yet.` },
    usage: { costUsd: 0, wouldCostUsd: endpoint.priceUsd },
    routing: { attempts },
  });
}
