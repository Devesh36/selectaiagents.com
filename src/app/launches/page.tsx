import { LaunchRow } from "@/components/LaunchRow";
import { dayLabel } from "@/lib/format";
import { launchesByDay } from "@/lib/rankings";
import { listAgents } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Launches" };

export default async function LaunchesPage() {
  const days = launchesByDay(await listAgents());

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Launches</h1>
        <p className="mt-1 text-muted">New agents, ranked by community upvotes for each launch day.</p>
      </header>
      {days.map(({ day, agents }) => (
        <section key={day}>
          <h2 className="mb-2 text-lg font-semibold">{dayLabel(day)}</h2>
          <div className="-mx-3">
            {agents.map((a, i) => (
              <LaunchRow key={a.slug} agent={a} rank={i + 1} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
