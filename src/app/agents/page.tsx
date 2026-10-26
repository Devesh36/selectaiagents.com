import { Suspense } from "react";
import { AgentFilters } from "@/components/AgentFilters";
import Link from "next/link";
import { AgentListRow } from "@/components/AgentListRow";
import { filterAgents, type CatalogSort } from "@/lib/rankings";
import { listAgents } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agents" };

type Params = {
  q?: string;
  category?: string;
  pricing?: string;
  max_price?: string;
  sort?: string;
};

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
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
          <span className="eyebrow catalog-label">
            Agent directory · {agents.length}{" "}
            {agents.length === 1 ? "result" : "results"}
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="mt-1 text-muted">
            Compare capabilities, prices and measured performance.
          </p>
        </div>
        <form className="catalog-search w-full sm:w-80">
          {Object.entries(sp)
            .filter(([k, v]) => k !== "q" && v)
            .map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Search agents…"
            aria-label="Search agents"
            className="flex-1"
          />
          <button aria-label="Search" type="submit">
            ↗
          </button>
        </form>
      </header>
      <div className="catalog-layout">
        <Suspense>
          <AgentFilters />
        </Suspense>
        {agents.length === 0 ? (
          <div className="catalog-empty">
            <p>No agents match these filters.</p>
            <Link href="/agents" className="subtle-link">
              Clear filters and browse all agents →
            </Link>
          </div>
        ) : (
          <ul className="catalog-results">
            {agents.map((a) => (
              <AgentListRow key={a.slug} agent={a} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
