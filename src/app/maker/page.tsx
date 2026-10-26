import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listAgents } from "@/lib/store";
import { makerStatus } from "@/lib/maker-status";
import { priceLabel } from "@/lib/format";
import { AgentLogo } from "@/components/AgentLogo";
export const dynamic = "force-dynamic";
export const metadata = { title: "Maker studio · Select AI Agents" };
export default async function MakerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/account");
  const [all, drafts] = await Promise.all([
    listAgents(false),
    db.query(
      "SELECT id,details,updated_at FROM maker_drafts WHERE owner_id=$1 AND published_slug IS NULL ORDER BY updated_at DESC",
      [session.user.id],
    ),
  ]);
  const agents = all.filter((a) => a.ownerId === session.user.id);
  const statuses = agents.map((a) => makerStatus(a));
  return (
    <div className="maker-dashboard">
      <header>
        <p className="eyebrow">Your workspace / Maker studio</p>
        <div className="maker-dashboard-heading">
          <div>
            <h1>Make your next move.</h1>
            <p className="mt-3 text-muted">
              Draft, launch, and manage the agents you’re building.
            </p>
          </div>
          <Link href="/submit" className="button button-dark">
            New agent <span>↗</span>
          </Link>
        </div>
      </header>
      <div className="maker-counts">
        {[
          { label: "Drafts", count: drafts.rowCount ?? 0 },
          {
            label: "Awaiting approval",
            count: statuses.filter((s) => s.label === "Awaiting approval")
              .length,
          },
          {
            label: "Live",
            count: statuses.filter((s) => s.label === "Live").length,
          },
          {
            label: "Needs attention",
            count: statuses.filter((s) => s.label === "Needs attention").length,
          },
        ].map((s) => (
          <div key={s.label}>
            <span className="eyebrow">{s.label}</span>
            <strong>{String(s.count).padStart(2, "0")}</strong>
          </div>
        ))}
      </div>
      {drafts.rows.length > 0 && (
        <section className="maker-dashboard-section">
          <div className="maker-section-title">
            <h2>Your drafts</h2>
            <p>Private to you. Not listed or callable.</p>
          </div>
          <div className="maker-draft-grid">
            {drafts.rows.map((d) => (
              <article key={d.id} className="maker-draft-card">
                <span className="maker-status" data-tone="draft">
                  Draft
                </span>
                <h3>{d.details.name || "Untitled agent"}</h3>
                <p>{d.details.tagline || "Your next idea starts here."}</p>
                <span className="text-xs text-muted">
                  Saved{" "}
                  {new Date(d.updated_at).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}{" "}
                  · UTC
                </span>
                <Link href={`/maker/drafts/${d.id}`} className="text-link">
                  Continue draft <span>↗</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="maker-dashboard-section">
        <div className="maker-section-title">
          <h2>Published agents</h2>
          <p>A public listing and an approved connection are separate steps.</p>
        </div>
        {!agents.length ? (
          <div className="maker-empty">
            <p className="eyebrow">A place for your ideas</p>
            <h3>Your first agent belongs here.</h3>
            <p>
              Start a private draft. We’ll guide you through the details,
              connection, and review.
            </p>
            <Link href="/submit" className="text-link">
              Create your first agent ↗
            </Link>
          </div>
        ) : (
          <div className="maker-agent-list">
            {agents.map((a) => {
              const status = makerStatus(a);
              return (
                <article key={a.slug} className="maker-agent-row">
                  <div className="maker-agent-identity">
                    <AgentLogo name={a.name} color={a.color} size={44} />
                    <div>
                      <h3>{a.name}</h3>
                      <p>{a.tagline}</p>
                    </div>
                  </div>
                  <div>
                    <span className="maker-status" data-tone={status.tone}>
                      {status.label}
                    </span>
                    <p className="maker-status-hint">{status.hint}</p>
                  </div>
                  <div className="maker-agent-price">
                    {priceLabel(a.pricing)}
                  </div>
                  <div className="maker-row-links">
                    <Link href={`/agents/${a.slug}/manage`}>
                      Manage agent ↗
                    </Link>
                    <Link href={`/agents/${a.slug}`}>View listing ↗</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <div className="maker-notice">
        <strong>How approval works</strong>
        <p>
          Submit your endpoint configuration, then an operator reviews the host,
          schemas, price, and credentials. Changing an endpoint or its price
          turns off that endpoint until it is approved again.
        </p>
      </div>
    </div>
  );
}
