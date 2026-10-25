import { NextResponse } from "next/server";
import { requireKey } from "@/lib/api";
import { agentId, route, type SortBy } from "@/lib/router";
import { listAgents } from "@/lib/store";

interface Message {
  role: string;
  content: string;
}

// OpenAI-compatible entry point: point any OpenAI SDK at /api/v1 and use an
// agent id as the model. Supports OpenRouter-style `models` fallbacks and
// `model: "auto"` with `route: { category, sort }`.
//
// Preview: the chosen agent is not contacted; a sandbox reply is returned.
export async function POST(req: Request) {
  const denied = requireKey(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const messages: Message[] = Array.isArray(body?.messages) ? body.messages : [];
  if (!body?.model || !messages.length) {
    return NextResponse.json({ error: { message: "`model` and `messages` are required", code: 400 } }, { status: 400 });
  }
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const result = route(await listAgents(), {
    model: String(body.model),
    models: Array.isArray(body.models) ? body.models.map(String) : undefined,
    category: body.route?.category,
    sort: body.route?.sort as SortBy | undefined,
    query: typeof lastUser === "string" ? lastUser : "",
  });
  if ("error" in result) {
    return NextResponse.json({ error: { message: result.error, code: 404 }, routing: { attempts: result.attempts } }, { status: 404 });
  }

  const { agent, endpoint, attempts } = result;
  const model = `${agentId(agent)}#${endpoint.id}`;
  return NextResponse.json({
    id: `gen-${crypto.randomUUID()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        finish_reason: "stop",
        message: {
          role: "assistant",
          content: `[sandbox] ${agent.name} (${endpoint.description.toLowerCase()}) would handle: "${String(lastUser).slice(0, 200)}"`,
        },
      },
    ],
    usage: { cost_usd: 0, would_cost_usd: endpoint.priceUsd },
    routing: { attempts },
  });
}
