import Link from "next/link";
import { categoryLabel, priceLabel } from "@/lib/format";
import type { Agent } from "@/lib/types";
import { AgentLogo } from "./AgentLogo";
import { UpvoteButton } from "./UpvoteButton";

export function LaunchRow({ agent, rank }: { agent: Agent; rank?: number }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-surface"
    >
      {rank !== undefined && <span className="w-5 text-right text-sm text-muted">{rank}</span>}
      <AgentLogo name={agent.name} color={agent.color} size={48} />
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{agent.name}</div>
        <div className="truncate text-sm text-muted">{agent.tagline}</div>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded bg-line/60 px-1.5 py-0.5">{categoryLabel(agent.category)}</span>
          <span>{priceLabel(agent.pricing)}</span>
        </div>
      </div>
      <UpvoteButton slug={agent.slug} initial={agent.upvotes} />
    </Link>
  );
}
