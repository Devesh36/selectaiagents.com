import { NextResponse } from "next/server";
import { fastestGrowing, mostUsed } from "@/lib/rankings";
import { listAgents } from "@/lib/store";
import type { CategoryId } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") === "30d" ? "30d" : "7d";
  const category = (url.searchParams.get("category") ?? undefined) as CategoryId | undefined;
  const agents = await listAgents();
  return NextResponse.json({
    period,
    mostUsed: mostUsed(agents, period, category).map((r) => ({
      slug: r.agent.slug,
      calls: r.calls,
      changePct: r.changePct,
    })),
    fastestGrowing: fastestGrowing(agents).map((g) => ({
      slug: g.agent.slug,
      calls: g.calls,
      prevCalls: g.prevCalls,
      multiple: g.multiple,
    })),
  });
}
