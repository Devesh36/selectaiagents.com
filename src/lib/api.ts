import { NextResponse } from "next/server";
import { agentId } from "./router";
import type { Agent } from "./types";

/**
 * In this preview any Bearer key is accepted and calls are not forwarded.
 * Replace with real key lookup and credit checks.
 */
export function requireKey(req: Request): NextResponse | undefined {
  if (!req.headers.get("authorization")?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: { message: "Missing Bearer API key", code: 401 } },
      { status: 401 },
    );
  }
}

export function agentSummary(a: Agent) {
  return {
    id: agentId(a),
    name: a.name,
    description: a.tagline,
    category: a.category,
    created: a.launchedAt,
    pricing: a.pricing,
    endpoints: a.endpoints.map((e) => ({ id: `${agentId(a)}#${e.id}`, price_usd: e.priceUsd, description: e.description })),
    stats: { calls_7d: a.stats.calls7d, p50_ms: a.stats.p50Ms, p95_ms: a.stats.p95Ms, uptime: a.stats.uptime },
  };
}
