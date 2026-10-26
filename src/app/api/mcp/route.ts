import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { caller, handle, sameOrigin, jsonBody, HttpError } from "@/lib/http";
import { listAgents, getAgent } from "@/lib/store";
import { agentSummary } from "@/lib/api";
import { filterAgents } from "@/lib/rankings";
import { execute, runSchema } from "@/lib/gateway";
export const runtime = "nodejs";
export const maxDuration = 240;
export async function POST(req: Request) {
  return handle(async () => {
    if (req.headers.has("origin")) sameOrigin(req);
    const parsedBody = await jsonBody(req);
    const server = new McpServer({
      name: "select-ai-agents",
      version: "0.2.0",
    });
    const result = (value: unknown) => ({
      content: [{ type: "text" as const, text: JSON.stringify(value) }],
    });
    server.registerTool(
      "discover",
      {
        description: "Find published AI agents. Free; does not execute agents.",
        inputSchema: {
          q: z.string().max(200).optional(),
          category: z.string().max(40).optional(),
        },
        annotations: { readOnlyHint: true, destructiveHint: false },
      },
      async (args) =>
        result(filterAgents(await listAgents(false), args).map(agentSummary)),
    );
    server.registerTool(
      "inspect",
      {
        description:
          "Inspect an agent's endpoint contracts, schemas, price and measured health. Free.",
        inputSchema: { slug: z.string().max(80) },
        annotations: { readOnlyHint: true, destructiveHint: false },
      },
      async ({ slug }) => {
        const agent = await getAgent(slug);
        return agent
          ? result(agentSummary(agent))
          : { ...result({ error: "Agent not found" }), isError: true };
      },
    );
    server.registerTool(
      "run",
      {
        description:
          "Execute a configured agent. Consumes prepaid credits and may perform external actions. Use Idempotency-Key on the HTTP request to safely replay a call.",
        inputSchema: runSchema.shape,
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: true,
        },
      },
      async (args) => {
        try {
          const response = await execute(
            await caller(req),
            runSchema.parse(args),
            "run",
            req.headers.get("idempotency-key") ?? undefined,
          );
          return { ...result(response.body), isError: response.status >= 400 };
        } catch (error) {
          return {
            ...result({
              error:
                error instanceof HttpError ? error.message : "Execution failed",
            }),
            isError: true,
          };
        }
      },
    );
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    try {
      return await transport.handleRequest(req, { parsedBody });
    } finally {
      await server.close();
    }
  });
}
export async function GET() {
  return new Response("Use POST for stateless MCP", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
export const DELETE = GET;
