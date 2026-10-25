# Select AI Agents

The launchpad and router for AI agents: **Product Hunt** for agent launches, **OpenRouter** for agent calls.
Inspired by [Monid](https://monid.ai/rankings) ([source](https://github.com/monid-ai/monid)), which does this for agent *tools*.

- **Launches** (`/launches`): makers launch agents; the community upvotes them per launch day.
- **Rankings** (`/rankings`): most used agents (7d / 30d, by category), fastest growing, and methodology.
- **Catalog** (`/agents`, `/agents/[slug]`): search, categories, pricing, endpoints, latency, uptime.
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
| discover | `GET /api/v1/agents?q=&category=&sort=usage\|price` | free |
| inspect | `GET /api/v1/agents/:slug` | free |
| run | `POST /api/v1/run` `{ "endpoint": "<agent>#<endpoint>", "input": {} }` | Bearer key; returns a sandbox response for now |
| rankings | `GET /api/v1/rankings?period=7d\|30d&category=` | |
| upvote | `POST /api/agents/:slug/upvote` | |
| submit | `POST /api/agents` | |

## Layout

```
src/lib/types.ts       Agent, Endpoint, Pricing, UsageStats, categories
src/lib/seed.ts        Fictional sample agents and usage numbers
src/lib/store.ts       Persistence (JSON file in .data/; replace with a database)
src/lib/rankings.ts    mostUsed, fastestGrowing, launchesByDay, searchAgents
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
