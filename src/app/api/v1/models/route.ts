import { NextResponse } from "next/server";
import { agentSummary } from "@/lib/api";
import { listAgents } from "@/lib/store";

// OpenAI-compatible model list, so `client.models.list()` works.
export async function GET() {
  const agents = await listAgents(false);
  return NextResponse.json({
    object: "list",
    data: agents.map((a) => ({
      ...agentSummary(a),
      created: Math.floor(
        new Date(`${a.launchedAt}T00:00:00Z`).getTime() / 1000,
      ),
      object: "model",
      owned_by: a.maker,
    })),
  });
}
