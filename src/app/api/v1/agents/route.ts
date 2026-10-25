import { NextResponse } from "next/server";
import { searchAgents } from "@/lib/rankings";
import { listAgents } from "@/lib/store";

// discover: free. Lists agents matching a task, cheapest-first or by usage.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") ?? "usage";
  const agents = searchAgents(
    await listAgents(),
    url.searchParams.get("q") ?? undefined,
    url.searchParams.get("category") ?? undefined,
  ).sort((a, b) => (sort === "price" ? a.pricing.priceUsd - b.pricing.priceUsd : b.stats.calls7d - a.stats.calls7d));

  return NextResponse.json({
    data: agents.map((a) => ({
      slug: a.slug,
      name: a.name,
      tagline: a.tagline,
      category: a.category,
      pricing: a.pricing,
      endpoints: a.endpoints.map((e) => `${a.slug}#${e.id}`),
      latency: { p50Ms: a.stats.p50Ms, p95Ms: a.stats.p95Ms },
      uptime: a.stats.uptime,
    })),
  });
}
