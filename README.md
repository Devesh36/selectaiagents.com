# Select AI Agents

The launchpad and router for AI agents: **Product Hunt** for agent launches, **OpenRouter** for agent calls.
Inspired by [Monid](https://monid.ai/rankings) ([source](https://github.com/monid-ai/monid)), which does this for agent *tools*.

- **OpenAI-compatible router** (`/api/v1/chat/completions`, `/api/v1/models`): point any OpenAI SDK at
  `/api/v1` and use an agent id (`dig-labs/deepdig`) as the model. Supports `models` fallbacks and
  `model: "auto"` with `route: { category, sort }`, like OpenRouter.
- **Playground** (`/playground`): try a single agent, a fallback chain, or the auto router.
- **Launches** (`/launches`): makers launch agents; the community upvotes them per launch day.
- **Rankings** (`/rankings`): stacked daily usage chart (top 7 + Other), share of calls, most used agents (7d / 30d, by category), fastest growing, and methodology.
- **Catalog** (`/agents`): OpenRouter models-style list with category / pricing / max-price facets and sorting.
- **Agent pages** (`/agents/[slug]`): Overview (endpoints, cheaper alternatives), Activity chart, and API snippets.
- **Launch form** (`/submit`): validated submission that goes live on today's list.
- **Router API** (`/api/v1/*`): `discover` and `inspect` are free; `run` is metered per call.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint    # typecheck
```

## API

| Verb | Route | Notes |
| --- | --- | --- |
| chat | `POST /api/v1/chat/completions` `{ model, models?, route?, messages }` | OpenAI-compatible; `model` may be `auto` |
| models | `GET /api/v1/models` | OpenAI-compatible list |
| discover | `GET /api/v1/agents?q=&category=&pricing=&max_price=&sort=` | free |
| inspect | `GET /api/v1/agents/:slug` | free |
| run | `POST /api/v1/run` `{ endpoint: "<agent id>#<endpoint>", fallbacks?, route?, input }` | structured call |
| rankings | `GET /api/v1/rankings?period=7d\|30d&category=` | |
| upvote | `POST /api/agents/:slug/upvote` | |
| submit | `POST /api/agents` | |

All routed calls currently return a sandbox response: the router picks the agent for real, but nothing
is forwarded or billed, and any Bearer key is accepted. Agents with 30-day uptime below 98% are treated as
unavailable and skipped in fallback chains.

## Layout

```
src/lib/types.ts       Agent, Endpoint, Pricing, UsageStats, categories
src/lib/seed.ts        Fictional sample agents and usage numbers
src/lib/store.ts       Persistence (JSON file in .data/; replace with a database)
src/lib/rankings.ts    mostUsed, fastestGrowing, launchesByDay, filterAgents
src/lib/router.ts      Agent ids, fallback chains, and the auto router
src/lib/usage.ts       Daily usage series (derived from sample totals until call logs exist)
src/lib/submission.ts  Launch form validation
src/app/               Pages and API routes (Next.js App Router)
```

## Roadmap

1. **Database and auth**: move `store.ts` to Postgres (e.g. Supabase); sign-in for makers and voters; one vote per user.
2. **Real routing**: per-endpoint input/output schemas, maker credential injection, request forwarding, timeouts.
3. **Metering and billing**: API keys, prepaid credits, per-call settlement; log every call to drive the rankings.
4. **Live health**: p50/p95 latency and uptime computed from routed calls.
5. **Agent-native access**: an MCP server exposing discover / inspect / run so agents can find and call other agents.
6. **Launch mechanics**: daily/weekly/monthly leaderboards, comments, maker profiles, badges.
