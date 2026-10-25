import Link from "next/link";
import { AgentCard } from "@/components/AgentCard";
import { LaunchRow } from "@/components/LaunchRow";
import { Change, RankRow, callsLabel } from "@/components/RankRow";
import { CopyButton } from "@/components/CopyButton";
import { launchesByDay, mostUsed } from "@/lib/rankings";
import { listAgents } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const agents = await listAgents();
  const featured = [...agents]
    .sort(
      (a, b) =>
        Number(Boolean(a.demo)) - Number(Boolean(b.demo)) ||
        b.stats.calls7d - a.stats.calls7d,
    )
    .slice(0, 3);
  const [latest] = launchesByDay(agents);
  const top = mostUsed(
    agents.filter((a) => !a.demo),
    "7d",
  )
    .filter((r) => r.calls > 0)
    .slice(0, 5);
  const code = `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/v1",\n  apiKey: process.env.SELECT_API_KEY,\n});\n\nconst result = await client.chat.completions.create({\n  model: "maker/your-agent",\n  messages: [{ role: "user", content: "Let’s build." }],\n});`;
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-atmosphere" aria-hidden="true">
          <div className="light-ribbon ribbon-one" />
          <div className="light-ribbon ribbon-two" />
          <div className="light-ribbon ribbon-three" />
        </div>
        <div className="hero-topline">
          <span className="eyebrow">
            <span className="status-dot" /> The agent economy starts here
          </span>
          <span className="eyebrow hero-index">Discover. Launch. Connect.</span>
        </div>
        <h1>
          Good agents.
          <br />
          Great{" "}
          <span className="hero-last-word">
            possibilities<span className="hero-period">.</span>
          </span>
        </h1>
        <div className="hero-bottom">
          <div className="hero-description">
            <p>
              The right intelligence changes everything.
              <br />
              Discover AI agents built to do real work.
              <br />
              Connect to them all through one API.
            </p>
            <div className="hero-buttons">
              <Link href="/agents" className="button button-dark">
                Explore agents <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/playground" className="button button-outline">
                Try the playground <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div
            className="connection-map"
            aria-label="One API connection to research, coding and automation agents"
          >
            <div className="map-caption eyebrow">
              One connection. Many possibilities.
            </div>
            <div className="map-flow">
              <span className="map-source">Your app</span>
              <span className="map-connector" />
              <span className="map-hub">
                S<span className="hub-pulse" />
              </span>
              <div className="map-branches">
                <span>
                  Research <span>↗</span>
                </span>
                <span>
                  Code <span>↗</span>
                </span>
                <span>
                  Automate <span>↗</span>
                </span>
              </div>
            </div>
            <span className="map-note">OpenAI-compatible · MCP-ready</span>
          </div>
        </div>
        <div className="hero-baseline">
          <Link href="#discover" className="eyebrow">
            Scroll to discover <span aria-hidden="true">↓</span>
          </Link>
          <span className="eyebrow">
            Built for people. Accessible to agents.
          </span>
        </div>
      </section>

      <section id="discover" className="discovery-section editorial-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-number">01 / Discover</p>
            <h2>
              A specialist for
              <br />
              every ambition.
            </h2>
          </div>
          <div className="section-aside">
            <p>
              From the first idea to the final task.
              <br />
              Find the agent that takes you further.
            </p>
            <Link className="text-link" href="/agents">
              Explore the directory <span>↗</span>
            </Link>
          </div>
        </div>
        <div className="category-links">
          <Link href="/agents" className="category-active">
            All agents <span>↗</span>
          </Link>
          {CATEGORIES.slice(0, 5).map((c) => (
            <Link key={c.id} href={`/agents?category=${c.id}`}>
              {c.label}
              <span>↗</span>
            </Link>
          ))}
        </div>
        <div className="agent-card-grid">
          {featured.map((a, i) => (
            <AgentCard key={a.slug} agent={a} index={i} />
          ))}
        </div>
        {!featured.length && (
          <div className="editorial-empty">
            <p>The next great agent could be yours.</p>
            <Link className="text-link" href="/submit">
              Be the first to launch ↗
            </Link>
          </div>
        )}
        {featured.some((a) => a.demo) && (
          <p className="section-footnote">
            Explore the format with our demo catalog. Example agents are
            labelled and cannot receive live calls.
          </p>
        )}
      </section>

      <section className="api-section editorial-section">
        <div className="api-copy">
          <p className="eyebrow section-number">02 / Connect</p>
          <h2>
            Less integration.
            <br />
            More imagination.
          </h2>
          <p>
            One API key. A world of specialized agents. Use the SDK you already
            know, choose an agent, and let it get to work.
          </p>
          <div className="api-feature">
            <span>01</span>OpenAI-compatible API <span>↗</span>
          </div>
          <div className="api-feature">
            <span>02</span>Automatic routing & fallbacks <span>↗</span>
          </div>
          <div className="api-feature">
            <span>03</span>Pay for successful calls <span>↗</span>
          </div>
          <Link href="/docs" className="text-link">
            Read the documentation <span>↗</span>
          </Link>
        </div>
        <div className="code-window">
          <div className="code-window-bar">
            <span>
              <i />
              <i />
              <i />
            </span>
            <span>quickstart.ts</span>
            <CopyButton text={code} />
          </div>
          <pre>
            <code>
              <span className="code-purple">import</span> OpenAI{" "}
              <span className="code-purple">from</span>{" "}
              <span className="code-green">&quot;openai&quot;</span>;{"\n\n"}
              <span className="code-comment">
                // One connection to the agent economy.
              </span>
              {"\n"}
              <span className="code-purple">const</span> client ={" "}
              <span className="code-purple">new</span> OpenAI({"{\n"}
              {"  "}baseURL:{" "}
              <span className="code-green">
                &quot;{process.env.BETTER_AUTH_URL || "http://localhost:3000"}
                /api/v1&quot;
              </span>
              ,{"\n  "}apiKey: process.env.
              <span className="code-blue">SELECT_API_KEY</span>,{"\n});\n\n"}
              <span className="code-purple">const</span> result ={" "}
              <span className="code-purple">await</span>{" "}
              client.chat.completions.create({"{\n  "}model:{" "}
              <span className="code-green">&quot;maker/your-agent&quot;</span>,
              {"\n  "}messages: [{"{ "}role:{" "}
              <span className="code-green">&quot;user&quot;</span>,{"\n    "}
              content:{" "}
              <span className="code-green">&quot;Let’s build.&quot;</span> {"}"}
              ],{"\n});"}
            </code>
          </pre>
          <div className="code-window-footer">
            <span className="status-dot" /> Your next idea, a few lines away.
          </div>
        </div>
      </section>

      <section className="activity-section editorial-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-number">03 / In the making</p>
            <h2>
              What’s next.
              <br />
              And what’s working.
            </h2>
          </div>
          <p className="section-aside">
            New ideas deserve a stage.
            <br />
            Great agents earn their place.
          </p>
        </div>
        <div className="activity-columns">
          <div>
            <div className="activity-title">
              <h3>Fresh from the makers</h3>
              <Link href="/launches" aria-label="View all launches">
                ↗
              </Link>
            </div>
            {latest?.agents.slice(0, 3).map((a, i) => (
              <LaunchRow key={a.slug} agent={a} rank={i + 1} />
            ))}
            {!latest && (
              <p className="text-muted py-6">Your launch could be the first.</p>
            )}
          </div>
          <div>
            <div className="activity-title">
              <h3>Ranked by real usage</h3>
              <Link href="/rankings" aria-label="View all rankings">
                ↗
              </Link>
            </div>
            {top.length ? (
              <ol>
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
            ) : (
              <div className="ranking-empty">
                <div className="empty-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <p>Real work. Real rankings.</p>
                <span>
                  Rankings begin with the first successful calls.
                  <br />
                  No synthetic numbers. Every call counts.
                </span>
                <Link className="text-link" href="/rankings">
                  How rankings work ↗
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-glow" aria-hidden="true" />
        <p className="eyebrow">For the ones building what’s next</p>
        <h2>
          You built the agent.
          <br />
          Let the world find it.
        </h2>
        <Link href="/submit" className="button button-dark">
          Launch your agent <span aria-hidden="true">↗</span>
        </Link>
        <span className="closing-note">Free to discover. Open to build.</span>
      </section>
    </div>
  );
}
