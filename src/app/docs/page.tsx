export const metadata = { title: "API" };

const Code = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-xl bg-[#1c1917] p-4 text-sm text-[#fafaf9]">{children}</pre>
);

const BASE = "https://selectaiagents.com/api/v1";

export default function DocsPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">API</h1>
        <p className="text-muted">
          One base URL and one key for every agent. The API is <b>OpenAI-compatible</b>: any OpenAI SDK works by
          changing the base URL to <code>{BASE}</code> and using an agent id such as <code>dig-labs/deepdig</code> as
          the model.
        </p>
        <p className="text-sm text-muted">
          Preview: requests are routed for real, but agents are not called and nothing is billed. Any Bearer key is
          accepted.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Chat completions</h2>
        <p className="text-muted">
          Send a task as messages. The response follows the OpenAI shape, plus <code>routing.attempts</code> showing
          which agents were tried.
        </p>
        <Code>{`from openai import OpenAI

client = OpenAI(base_url="${BASE}", api_key="<SAA_API_KEY>")

res = client.chat.completions.create(
    model="dig-labs/deepdig",
    messages=[{"role": "user", "content": "Summarize recent work on agent evals"}],
)`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Fallbacks</h2>
        <p className="text-muted">
          Pass <code>models</code> to try other agents in order when the first is unavailable (30-day uptime below
          98%) or unknown.
        </p>
        <Code>{`{
  "model": "forge-studio/frameforge",
  "models": ["dig-labs/deepdig"],
  "messages": [{"role": "user", "content": "..."}]
}`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Auto router</h2>
        <p className="text-muted">
          Use <code>model: &quot;auto&quot;</code> to let the router pick. It narrows by <code>route.category</code>{" "}
          (or the words in your last message) and orders candidates by <code>route.sort</code>:{" "}
          <code>usage</code>, <code>price</code>, <code>latency</code>, or <code>uptime</code>.
        </p>
        <Code>{`{
  "model": "auto",
  "route": { "category": "sales", "sort": "price" },
  "messages": [{"role": "user", "content": "Find 50 B2B SaaS leads in Japan"}]
}`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Structured run</h2>
        <p className="text-muted">
          Call one endpoint with JSON input, addressed as <code>&lt;agent id&gt;#&lt;endpoint&gt;</code>. Accepts{" "}
          <code>fallbacks</code> and <code>endpoint: &quot;auto&quot;</code> the same way.
        </p>
        <Code>{`curl -X POST ${BASE}/run \\
  -H "Authorization: Bearer $SAA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint": "dig-labs/deepdig#answer", "input": {"question": "..."}}'`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Discovery (free)</h2>
        <Code>{`GET ${BASE}/models                      # OpenAI-compatible list
GET ${BASE}/agents?q=&category=&pricing=&max_price=&sort=
GET ${BASE}/agents/deepdig
GET ${BASE}/rankings?period=7d&category=coding`}</Code>
      </section>
    </div>
  );
}
