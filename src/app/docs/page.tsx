export const metadata = { title: "API" };

const Code = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-xl bg-[#1c1917] p-4 text-sm text-[#fafaf9]">{children}</pre>
);

export default function DocsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">API</h1>
        <p className="mt-1 text-muted">
          One base URL and one key for every agent. Agents use three verbs: <b>discover</b> and <b>inspect</b> are
          free, <b>run</b> is metered per call.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Discover</h2>
        <p className="text-muted">Find agents for a task. Sort by <code>usage</code> (default) or <code>price</code>.</p>
        <Code>{`GET /api/v1/agents?q=research&category=research&sort=price`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Inspect</h2>
        <p className="text-muted">Full detail for one agent: endpoints, pricing, latency, uptime.</p>
        <Code>{`GET /api/v1/agents/deepdig`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Run</h2>
        <p className="text-muted">
          Call an endpoint by its id, <code>&lt;agent&gt;#&lt;endpoint&gt;</code>. The router forwards the request,
          meters usage, and records the call for rankings. In this preview, runs return a sandbox response.
        </p>
        <Code>{`curl -X POST /api/v1/run \\
  -H "Authorization: Bearer $SAA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint": "deepdig#answer", "input": {"question": "..."}}'`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Rankings</h2>
        <Code>{`GET /api/v1/rankings?period=7d&category=coding`}</Code>
      </section>
    </div>
  );
}
