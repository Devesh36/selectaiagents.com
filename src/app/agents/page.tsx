import { Suspense } from "react";
import { AgentFilters } from "@/components/AgentFilters";
import { AgentListRow } from "@/components/AgentListRow";
import { filterAgents, type CatalogSort } from "@/lib/rankings";
import { listAgents } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agents" };

type Params = { q?: string; category?: string; pricing?: string; max_price?: string; sort?: string };

export default async function AgentsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const agents = filterAgents(await listAgents(), {
    q: sp.q,
    category: sp.category,
    pricing: sp.pricing,
    maxPrice: sp.max_price ? Number(sp.max_price) : undefined,
    sort: sp.sort as CatalogSort | undefined,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="mt-1 text-muted">Every agent you can call with one API key. {agents.length} shown.</p>
        </div>
        <form className="flex w-full gap-2 sm:w-80">
          {Object.entries(sp)
            .filter(([k, v]) => k !== "q" && v)
            .map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Filter agents"
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </form>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_minmax(0,1fr)]">
        <Suspense>
          <AgentFilters />
        </Suspense>
        {agents.length === 0 ? (
          <p className="text-muted">No agents match these filters.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {agents.map((a) => (
              <AgentListRow key={a.slug} agent={a} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
