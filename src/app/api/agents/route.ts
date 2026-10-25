import { NextResponse } from "next/server";
import { addAgent, listAgents } from "@/lib/store";
import { buildAgent } from "@/lib/submission";
import { handle, sessionUser, jsonBody, limit, HttpError } from "@/lib/http";
import { z } from "zod";

export async function POST(req: Request) {
  return handle(async () => {
    const user = await sessionUser(req);
    await limit(`submit:${user.id}`, 10, 3600);
    const body = z
      .record(z.string(), z.union([z.string().max(2000), z.number()]))
      .parse(await jsonBody(req));
    const existing = new Set((await listAgents()).map((a) => a.slug));
    const result = buildAgent(body, existing);
    if ("errors" in result)
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    try {
      await addAgent(result.agent, user.id);
    } catch (error) {
      if ((error as { code?: string }).code === "23505")
        throw new HttpError(409, "This agent name is already taken");
      throw error;
    }
    return NextResponse.json({ slug: result.agent.slug }, { status: 201 });
  });
}
