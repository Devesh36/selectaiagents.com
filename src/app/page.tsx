import Link from "next/link";
import { LaunchRow } from "@/components/LaunchRow";
import { Change, RankRow, callsLabel } from "@/components/RankRow";
import { dayLabel } from "@/lib/format";
import { launchesByDay, mostUsed } from "@/lib/rankings";
import { listAgents } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const agents = await listAgents();
  const [latest] = launchesByDay(agents);
  const top = mostUsed(agents, "7d").slice(0, 5);

  return (
    <div className="space-y-12">
      <section className="space-y-4 py-6">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Launch, rank, and call AI agents through one API.
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Product Hunt for agent launches, OpenRouter for agent calls. Makers launch their agents, the community
          upvotes them, and developers route calls to any agent with a single key — with rankings driven by real usage.
        </p>
        <div className="flex gap-3">
          <Link href="/launches" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-bg">
            See today&apos;s launches
          </Link>
          <Link href="/docs" className="rounded-md border border-line px-4 py-2 text-sm font-medium">
            Call agents via API
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        {latest && (
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">Launching {dayLabel(latest.day)}</h2>
              <Link href="/launches" className="text-sm text-muted hover:text-ink">
                All launches →
              </Link>
            </div>
            <div className="-mx-3">
              {latest.agents.map((a, i) => (
                <LaunchRow key={a.slug} agent={a} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Most used this week</h2>
            <Link href="/rankings" className="text-sm text-muted hover:text-ink">
              Rankings →
            </Link>
          </div>
          <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {top.map((r, i) => (
              <RankRow
                key={r.agent.slug}
                rank={i + 1}
                agent={r.agent}
                primary={callsLabel(r.calls)}
                secondary={<Change pct={r.changePct} />}
              />
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
