import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentLogo } from "@/components/AgentLogo";
import { Change } from "@/components/RankRow";
import { UpvoteButton } from "@/components/UpvoteButton";
import { categoryLabel, compact, dayLabel, duration, priceLabel, usd } from "@/lib/format";
import { getAgent } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const agent = await getAgent((await params).slug);
  return { title: agent?.name ?? "Agent not found", description: agent?.tagline };
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const agent = await getAgent((await params).slug);
  if (!agent) notFound();

  const { stats } = agent;
  const change = stats.callsPrev7d > 0 ? ((stats.calls7d - stats.callsPrev7d) / stats.callsPrev7d) * 100 : null;
  const first = agent.endpoints[0];

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start gap-5">
        <AgentLogo name={agent.name} color={agent.color} size={72} />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
          <p className="mt-1 text-lg text-muted">{agent.tagline}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <Link href={`/agents?category=${agent.category}`} className="hover:text-ink">
              {categoryLabel(agent.category)}
            </Link>
            <span>by {agent.maker}</span>
            <span>Launched {dayLabel(agent.launchedAt)}</span>
            <a href={agent.website} target="_blank" rel="noreferrer" className="hover:text-ink">
              Website ↗
            </a>
          </div>
        </div>
        <UpvoteButton slug={agent.slug} initial={agent.upvotes} />
      </header>

      <p className="max-w-3xl leading-relaxed">{agent.description}</p>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Calls (7d)", value: compact(stats.calls7d), extra: <Change pct={change} /> },
          { label: "Pricing", value: priceLabel(agent.pricing) },
          { label: "Latency p50 / p95", value: `${duration(stats.p50Ms)} / ${duration(stats.p95Ms)}` },
          { label: "Uptime (30d)", value: `${stats.uptime}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="mt-1 font-semibold">{s.value}</div>
            {s.extra}
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Endpoints</h2>
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {agent.endpoints.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center gap-3 p-4">
              <code className="rounded bg-line/60 px-1.5 py-0.5 text-xs">{e.method}</code>
              <code className="text-sm">
                {agent.slug}#{e.id}
              </code>
              <span className="flex-1 text-sm text-muted">{e.description}</span>
              <span className="text-sm font-medium">{usd(e.priceUsd)}</span>
            </div>
          ))}
        </div>
      </section>

      {first && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Call it through the router</h2>
          <pre className="overflow-x-auto rounded-xl bg-[#1c1917] p-4 text-sm text-[#fafaf9]">
            {`curl -X POST https://selectaiagents.com/api/v1/run \\
  -H "Authorization: Bearer $SAA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint": "${agent.slug}#${first.id}", "input": {}}'`}
          </pre>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {agent.tags.map((t) => (
          <Link
            key={t}
            href={`/agents?q=${encodeURIComponent(t)}`}
            className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:text-ink"
          >
            #{t}
          </Link>
        ))}
      </div>
    </div>
  );
}
