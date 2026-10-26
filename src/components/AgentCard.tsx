import Link from "next/link";
import { AgentLogo } from "./AgentLogo";
import { categoryLabel, priceLabel } from "@/lib/format";
import type { Agent } from "@/lib/types";

export function AgentCard({
  agent,
  index = 0,
}: {
  agent: Agent;
  index?: number;
}) {
  return (
    <Link href={`/agents/${agent.slug}`} className="agent-card">
      <div className="card-top">
        <span className="eyebrow">
          {String(index + 1).padStart(2, "0")} / {categoryLabel(agent.category)}
        </span>
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="card-identity">
        <AgentLogo name={agent.name} color={agent.color} size={50} />
        <div>
          <h3>{agent.name}</h3>
          <p>by {agent.maker}</p>
        </div>
      </div>
      <p className="card-description">{agent.tagline}</p>
      <div className="card-tags">
        {agent.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="card-bottom">
        <span>{priceLabel(agent.pricing)}</span>
        <span className={agent.demo ? "demo-tag" : "availability-tag"}>
          {agent.demo
            ? "Demo"
            : agent.endpoints.some((e) => e.available)
              ? "Available"
              : "New launch"}
        </span>
      </div>
    </Link>
  );
}
