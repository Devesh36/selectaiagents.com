import Link from "next/link";
import { LaunchRow } from "@/components/LaunchRow";
import { RankRow, callsLabel } from "@/components/RankRow";
import { CopyButton } from "@/components/CopyButton";
import { mostUsed } from "@/lib/rankings";
import { listAgents } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: requestedView } = await searchParams;
  const view =
    requestedView === "popular" || requestedView === "available"
      ? requestedView
      : "latest";
  const agents = await listAgents();
  const listings = agents
    .filter(
      (a) =>
        view !== "available" ||
        (!a.demo && a.endpoints.some((e) => e.available)),
    )
    .sort(
      (a, b) =>
        Number(Boolean(a.demo)) - Number(Boolean(b.demo)) ||
        (view === "popular"
          ? b.upvotes - a.upvotes
          : b.launchedAt.localeCompare(a.launchedAt)) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 8);
  const top = mostUsed(
    agents.filter((a) => !a.demo),
    "7d",
  )
    .filter((r) => r.calls > 0)
    .slice(0, 3);
  const code = `const client = new OpenAI({\n  baseURL: "${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/v1",\n  apiKey: process.env.SELECT_API_KEY,\n});`;
  return (
    <div className="home-page">
      <section className="discovery-intro" aria-labelledby="discovery-title">
        <div className="intro-label">
          <span className="intro-symbol" aria-hidden="true">
            ↗
          </span>{" "}
          The directory for AI agents
        </div>
        <h1 id="discovery-title">
          Find an agent. <span>Get to work.</span>
        </h1>
        <p>
          Discover what makers are building. Compare agents and call them
          through one API.
        </p>
        <form action="/agents" className="discovery-search" role="search">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            name="q"
            aria-label="Search agents"
            placeholder="What do you need an agent for?"
          />
          <button type="submit">
            Search <span aria-hidden="true">→</span>
          </button>
        </form>
        <div className="discovery-categories" aria-label="Browse by category">
          {CATEGORIES.slice(0, 6).map((c) => (
            <Link key={c.id} href={`/agents?category=${c.id}`}>
              {c.label}
            </Link>
          ))}
          <Link href="/agents">
            All categories <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <div className="discovery-layout">
        <section className="discovery-feed" aria-labelledby="feed-title">
          <div className="feed-heading">
            <div>
              <h2 id="feed-title">Explore agents</h2>
              <p>Find your next addition to the toolkit.</p>
            </div>
            <Link href="/agents" className="subtle-link">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <nav className="feed-tabs" aria-label="Agent feed">
            {[
              { id: "latest", label: "Latest launches" },
              { id: "popular", label: "Most upvoted" },
              { id: "available", label: "Approved endpoints" },
            ].map((tab) => (
              <Link
                key={tab.id}
                href={tab.id === "latest" ? "/" : `/?view=${tab.id}`}
                aria-current={view === tab.id ? "page" : undefined}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          {listings.length ? (
            listings.map((agent) => (
              <LaunchRow key={agent.slug} agent={agent} />
            ))
          ) : (
            <div className="discovery-empty">
              <h3>
                {view === "available"
                  ? "No approved endpoints yet"
                  : "Your agent could be the first"}
              </h3>
              <p>
                {view === "available"
                  ? "Agents appear here once an operator approves an endpoint. Browse the directory to see what's being built."
                  : "Publish your agent and help people discover what it can do."}
              </p>
              <Link
                className="button button-outline"
                href={view === "available" ? "/agents" : "/submit"}
              >
                {view === "available" ? "Browse all agents" : "Submit an agent"}
              </Link>
            </div>
          )}
          {listings.some((a) => a.demo) && (
            <p className="feed-note">
              Demo listings are examples. Calls and voting are disabled.
            </p>
          )}
          <Link className="feed-more" href="/launches">
            Explore all launches <span aria-hidden="true">→</span>
          </Link>
        </section>

        <aside
          className="discovery-sidebar"
          aria-label="Get started and activity"
        >
          <section className="developer-card">
            <span className="eyebrow">For developers</span>
            <h2>
              One key.
              <br />
              More agents.
            </h2>
            <p>
              Use an OpenAI-compatible API to call approved agent endpoints.
            </p>
            <div className="mini-code">
              <div>
                <span>TypeScript</span>
                <CopyButton text={code} />
              </div>
              <pre>
                <code>{code}</code>
              </pre>
            </div>
            <Link href="/docs" className="button button-dark">
              Read the quickstart <span aria-hidden="true">→</span>
            </Link>
            <Link href="/playground" className="subtle-link">
              Or try the playground ↗
            </Link>
          </section>
          <section className="sidebar-section">
            <div className="sidebar-heading">
              <h2>Most used this week</h2>
              <span className="eyebrow">7 days</span>
            </div>
            {top.length ? (
              <ol>
                {top.map((r, i) => (
                  <RankRow
                    key={r.agent.slug}
                    rank={i + 1}
                    agent={r.agent}
                    primary={callsLabel(r.calls)}
                    secondary={null}
                  />
                ))}
              </ol>
            ) : (
              <p>
                Usage rankings start with successful API calls. No ranked agents
                yet.
              </p>
            )}
            <Link href="/rankings" className="subtle-link">
              View usage rankings <span aria-hidden="true">→</span>
            </Link>
          </section>
          <section className="maker-invitation">
            <span className="maker-invitation-icon" aria-hidden="true">
              ＋
            </span>
            <h2>Built something useful?</h2>
            <p>
              Give your agent a home. Share it with people looking for their
              next tool.
            </p>
            <Link href="/submit" className="subtle-link">
              Submit your agent <span aria-hidden="true">→</span>
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
