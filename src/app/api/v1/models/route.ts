import { NextResponse } from "next/server";
import { agentSummary } from "@/lib/api";
import { listAgents } from "@/lib/store";

// OpenAI-compatible model list, so `client.models.list()` works.
export async function GET() {
  const agents = await listAgents();
  return NextResponse.json({
    object: "list",
    data: agents.map((a) => ({ ...agentSummary(a), object: "model", owned_by: a.maker })),
  });
}
