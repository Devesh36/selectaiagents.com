import { NextResponse } from "next/server";
import { addAgent, listAgents } from "@/lib/store";
import { buildAgent } from "@/lib/submission";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const existing = new Set((await listAgents()).map((a) => a.slug));
  const result = buildAgent(body, existing);
  if ("errors" in result) return NextResponse.json({ errors: result.errors }, { status: 400 });
  await addAgent(result.agent);
  return NextResponse.json({ slug: result.agent.slug }, { status: 201 });
}
