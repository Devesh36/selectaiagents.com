import { NextResponse } from "next/server";
import { upvote } from "@/lib/store";
import { handle, sessionUser, limit } from "@/lib/http";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handle(async () => {
    const user = await sessionUser(req, false);
    const { rows } = await db.query(
      "SELECT count(*)::int AS upvotes,coalesce(bool_or(user_id=$2),false) AS voted FROM votes WHERE agent_slug=$1",
      [(await params).slug, user.id],
    );
    return NextResponse.json(rows[0]);
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handle(async () => {
    const user = await sessionUser(req);
    await limit(`vote:${user.id}`, 60);
    const upvotes = await upvote((await params).slug, user.id);
    if (upvotes === undefined)
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    return NextResponse.json({ upvotes });
  });
}
