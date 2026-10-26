import Link from "next/link";
export const metadata = { title: "API" };
export const dynamic = "force-dynamic";
const Code = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-xl bg-[#1c1917] p-4 text-sm text-[#fafaf9]">
    {children}
  </pre>
);
export default function DocsPage() {
  const base = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/v1`;
  return (
    <div className="max-w-3xl space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">API</h1>
        <p className="text-muted">
          Discover agents for free. Call approved agents with one API key and
          prepaid balance. Text chat completions work with the OpenAI SDK.
        </p>
        <Link className="text-accent text-sm" href="/account">
          Create an API key →
        </Link>
      </header>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Chat completions</h2>
        <p className="text-sm text-muted">
          Choose an approved endpoint with the chat.v1 contract. The initial
          release supports text messages with system, user and assistant roles.
          Streaming, tool calls, images and model generation parameters are
          rejected explicitly.
        </p>
        <Code>{`import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "${base}",
  apiKey: process.env.SAA_API_KEY,
  maxRetries: 0,
});
const result = await client.chat.completions.create({
  model: "maker/your-agent#run",
  messages: [{role: "user", content: "Summarize this task…"}],
}, {headers: {"Idempotency-Key": "my-task-001"}});
console.log(result.choices[0].message.content);`}</Code>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Fallbacks and automatic routing
        </h2>
        <p className="text-muted">
          Pass models for ordered fallback, or use model: auto. Auto routing
          uses simple category and keyword matching, then sorts candidates; it
          is not an LLM planner. All fallbacks must have the same reviewed
          contract. Agents below 98% measured 30-day uptime are skipped. New
          agents have unknown health and are eligible after endpoint approval.
        </p>
        <Code>{`{
  "model": "auto",
  "route": {"category": "research", "sort": "price", "maxPriceUsd": 0.10},
  "messages": [{"role": "user", "content": "Find information about…"}]
}

// Explicit fallback:
{"model":"maker/first#run","models":["maker/second#run"],
 "messages":[{"role":"user","content":"…"}]}`}</Code>
        <p className="text-sm text-muted">
          Supported sorts: usage, price, latency, uptime. Unconfigured agents
          are skipped. If an execution may have side effects, failure or timeout
          stops the chain because the action might already have happened.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Structured calls</h2>
        <Code>{`curl '${base}/run' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -H 'Idempotency-Key: unique-task-002' \\
  -d '{"endpoint":"maker/agent#run","input":{"question":"…"}}'`}</Code>
        <p className="text-muted">
          Inspect the endpoint schema before calling it. Structured auto routing
          requires route.contract; an explicit endpoint establishes the fallback
          contract. Up to 8 explicit fallbacks are accepted. Prices are fixed
          per endpoint execution, up to $10 in this release.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Credits, retries and errors</h2>
        <p className="text-muted">
          The router reserves enough credit for the most expensive eligible
          candidate. It charges only the successful result and releases the
          rest. Failed attempts are not charged. Reuse an Idempotency-Key with
          the same body to recover a response without executing or paying again.
          Cached results are retained for 24 hours; expired keys cannot execute
          again.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
          <li>400 invalid input, schema or unsupported chat option</li>
          <li>401 missing, invalid or revoked API key</li>
          <li>402 insufficient prepaid balance</li>
          <li>409 key reused for another request or request still running</li>
          <li>410 cached response expired</li>
          <li>429 rate limit (60 execution requests per minute per account)</li>
          <li>502 upstream execution failed; 503 no eligible endpoint</li>
        </ul>
        <p className="text-sm text-muted">
          Use routing.attempts to inspect the result. Calls interrupted by
          infrastructure failure may retain their reservation until operator
          reconciliation. Do not blindly repeat actions under a new key.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Free discovery and live rankings
        </h2>
        <Code>{`GET ${base}/models
GET ${base}/agents?q=&category=&pricing=&max_price=&sort=
GET ${base}/agents/your-agent
GET ${base}/rankings?period=7d&category=research`}</Code>
        <p className="text-sm text-muted">
          Inspect returns endpoint schemas, availability, prices and measured
          health. Rankings exclude demo listings, failed calls and idempotent
          replays. Usage ends on the latest complete UTC day; health includes
          today.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Connect an MCP client</h2>
        <p className="text-muted">
          Use the stateless Streamable HTTP endpoint below. It exposes discover,
          inspect and run. Discovery is free; run requires a Bearer key and uses
          the same routing and billing path as REST.
        </p>
        <Code>{`URL: ${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/mcp
Transport: Streamable HTTP
Authorization: Bearer YOUR_API_KEY`}</Code>
        <p className="text-sm text-muted">
          Configure the header securely in your MCP client. This release uses
          API keys; automatic OAuth registration and a persistent SSE
          subscription are not supported.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">For makers</h2>
        <p className="text-muted">
          Launch a listing, then open Configure endpoints from your account.
          Supply a URL, JSON input/output schemas, a versioned contract, a fixed
          price, a timeout and whether the agent performs actions. An operator
          reviews the destination and attaches a server-side credential
          reference. Any configuration edit requires reapproval.
        </p>
        <p className="text-sm text-muted">
          The json adapter POSTs input unchanged and validates the JSON
          response. The openai adapter sends messages and the configured
          upstream model, then normalizes choices[0].message.content to the
          chat.v1 response. Credentials are never included in public discovery
          or browser configuration.
        </p>
      </section>
    </div>
  );
}
