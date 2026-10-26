import Link from "next/link";
import { categoryLabel, compact, duration, priceLabel } from "@/lib/format";
import { agentId } from "@/lib/router";
import type { Agent } from "@/lib/types";
import { AgentLogo } from "./AgentLogo";

/** Comparable details in a compact, full-width catalog row. */
export function AgentListRow({ agent }: { agent: Agent }) {
  const available = !agent.demo && agent.endpoints.some((e) => e.available);
  return (
    <li className="catalog-agent">
      <Link href={`/agents/${agent.slug}`}>
        <div className="catalog-agent-title">
          <AgentLogo name={agent.name} color={agent.color} size={40} />
          <div>
            <h2>{agent.name}</h2>
            <span className="catalog-agent-id">{agentId(agent)}</span>
          </div>
          <span className={available ? "availability-tag" : "demo-tag"}>
            {agent.demo
              ? "Demo"
              : available
                ? "Endpoint approved"
                : "Not approved"}
          </span>
        </div>
        <p className="catalog-agent-description">{agent.description}</p>
        <div className="catalog-agent-metrics">
          <span className="catalog-agent-category">
            {categoryLabel(agent.category)}
          </span>
          <span>
            <strong>{priceLabel(agent.pricing)}</strong>
          </span>
          <span>
            {agent.demo
              ? "Example data"
              : `${compact(agent.stats.calls7d)} calls / week`}
          </span>
          {!agent.demo && agent.healthSamples ? (
            <>
              <span>
                {agent.stats.p50Ms > 0
                  ? `p50 ${duration(agent.stats.p50Ms)}`
                  : "Latency unmeasured"}
              </span>
              <span>{agent.stats.uptime.toFixed(1)}% uptime</span>
            </>
          ) : (
            <span>{agent.demo ? "Not callable" : "Health unmeasured"}</span>
          )}
        </div>
      </Link>
    </li>
  );
}
