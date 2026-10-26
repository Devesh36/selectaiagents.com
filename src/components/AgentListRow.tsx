import Link from "next/link";
import { categoryLabel, compact, duration, priceLabel } from "@/lib/format";
import { agentId } from "@/lib/router";
import type { Agent } from "@/lib/types";
import { AgentLogo } from "./AgentLogo";

/** Dense catalog row in the style of OpenRouter's model list. */
export function AgentListRow({ agent }: { agent: Agent }) {
  return (
    <li>
      <Link
        href={`/agents/${agent.slug}`}
        className="flex gap-4 px-1 py-4 hover:bg-surface sm:px-3"
      >
        <AgentLogo name={agent.name} color={agent.color} size={36} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-semibold">
              {agent.name}{" "}
              {agent.demo && (
                <span className="ml-2 rounded bg-line px-2 py-0.5 text-xs font-normal">
                  Demo
                </span>
              )}
            </span>
            <span className="text-sm tabular-nums text-muted">
              {compact(agent.stats.calls7d)} calls/wk
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted">{agent.description}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            <code className="text-ink">{agentId(agent)}</code>
            <span>{categoryLabel(agent.category)}</span>
            <span>{priceLabel(agent.pricing)}</span>
            {agent.stats.p50Ms > 0 && (
              <span>p50 {duration(agent.stats.p50Ms)}</span>
            )}
            <span>
              {agent.healthSamples
                ? `${agent.stats.uptime.toFixed(1)}% uptime`
                : "Health not yet measured"}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
