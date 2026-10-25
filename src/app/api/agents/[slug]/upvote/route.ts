import { NextResponse } from "next/server";
import { upvote } from "@/lib/store";

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const upvotes = await upvote((await params).slug);
  if (upvotes === undefined) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json({ upvotes });
}
