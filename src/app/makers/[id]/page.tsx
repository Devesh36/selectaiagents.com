import { notFound } from "next/navigation";
import { AgentListRow } from "@/components/AgentListRow";
import { db } from "@/lib/db";
import { listAgents } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function MakerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const maker = (
    await db.query('SELECT id,name,"createdAt" FROM "user" WHERE id=$1', [id])
  ).rows[0];
  if (!maker) notFound();
  const agents = (await listAgents(false)).filter((a) => a.ownerId === id);
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted">Maker profile</p>
        <h1 className="mt-1 text-3xl font-bold">{maker.name}</h1>
        <p className="mt-2 text-muted">
          Joined{" "}
          {new Date(maker.createdAt).toLocaleDateString("en", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}{" "}
          · {agents.length} launched agents
        </p>
      </header>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Agents</h2>
        {agents.length ? (
          <ul className="divide-y divide-line">
            {agents.map((a) => (
              <AgentListRow agent={a} key={a.slug} />
            ))}
          </ul>
        ) : (
          <p className="text-muted">No agents launched yet.</p>
        )}
      </section>
    </div>
  );
}
