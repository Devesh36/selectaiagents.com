import { LaunchRow } from "@/components/LaunchRow";
import { Pills } from "@/components/Pills";
import { searchAgents } from "@/lib/rankings";
import { listAgents } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agents" };

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const agents = searchAgents(await listAgents(), q, category).sort((a, b) => b.upvotes - a.upvotes);
  const href = (c?: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (c) p.set("category", c);
    const s = p.toString();
    return s ? `/agents?${s}` : "/agents";
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
        <p className="mt-1 text-muted">Browse every agent you can call through one API key.</p>
      </header>
      <form className="flex gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search agents, makers, tags…"
          className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button className="rounded-md bg-ink px-4 text-sm font-medium text-bg">Search</button>
      </form>
      <Pills
        active={category ?? "all"}
        items={[
          { key: "all", label: "All", href: href() },
          ...CATEGORIES.map((c) => ({ key: c.id, label: c.label, href: href(c.id) })),
        ]}
      />
      {agents.length === 0 ? (
        <p className="text-muted">No agents match.</p>
      ) : (
        <div className="-mx-3">
          {agents.map((a) => (
            <LaunchRow key={a.slug} agent={a} />
          ))}
        </div>
      )}
    </div>
  );
}
