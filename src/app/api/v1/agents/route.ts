import { NextResponse } from "next/server";
import { agentSummary } from "@/lib/api";
import { filterAgents, type CatalogSort } from "@/lib/rankings";
import { listAgents } from "@/lib/store";

// discover: free. Lists agents matching a task.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = (k: string) => url.searchParams.get(k) ?? undefined;
  const agents = filterAgents(await listAgents(), {
    q: p("q"),
    category: p("category"),
    pricing: p("pricing"),
    maxPrice: p("max_price") ? Number(p("max_price")) : undefined,
    sort: p("sort") as CatalogSort | undefined,
  });
  return NextResponse.json({ data: agents.map(agentSummary) });
}
