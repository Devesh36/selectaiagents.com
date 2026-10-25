import { db, transaction } from "./db";
import type { Agent, Endpoint } from "./types";

/** UTC calendar windows match the published rankings methodology. */
export async function listAgents(
  includeDemo = process.env.SHOW_DEMO_AGENTS === "true",
): Promise<Agent[]> {
  const { rows } = await db.query(
    `WITH boundaries AS (
    SELECT date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS day
  ), logs AS (
    SELECT agent_slug,
      count(*) FILTER(WHERE status='success' AND created_at >= day-interval '168 hours' AND created_at < day)::int AS c7,
      count(*) FILTER(WHERE status='success' AND created_at >= day-interval '336 hours' AND created_at < day-interval '168 hours')::int AS p7,
      count(*) FILTER(WHERE status='success' AND created_at >= day-interval '720 hours' AND created_at < day)::int AS c30,
      count(*) FILTER(WHERE status='success' AND created_at < day-interval '720 hours')::int AS p30,
      percentile_cont(0.5) WITHIN GROUP(ORDER BY latency_ms) FILTER(WHERE status='success' AND created_at>now()-interval '720 hours') AS p50,
      percentile_cont(0.95) WITHIN GROUP(ORDER BY latency_ms) FILTER(WHERE status='success' AND created_at>now()-interval '720 hours') AS p95,
      count(*) FILTER(WHERE created_at>now()-interval '720 hours')::int AS samples,
      100.0*count(*) FILTER(WHERE status='success' AND created_at>now()-interval '720 hours') / NULLIF(count(*) FILTER(WHERE created_at>now()-interval '720 hours'),0) AS uptime
    FROM call_logs CROSS JOIN boundaries WHERE created_at >= day-interval '1440 hours' GROUP BY agent_slug
  ), daily AS (
    SELECT agent_slug,jsonb_object_agg(day,calls) AS calls FROM (
      SELECT agent_slug,to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS day,count(*)::int AS calls
      FROM call_logs WHERE status='success' AND created_at>now()-interval '744 hours' GROUP BY agent_slug,day
    ) d GROUP BY agent_slug
  ) SELECT a.*,l.*,d.calls AS daily_calls,
    (SELECT count(*)::int FROM votes v WHERE v.agent_slug=a.slug) AS votes,
    (SELECT jsonb_agg(jsonb_build_object('id',e.id,'contract',e.config->'contract','available',e.approved,'reviewStatus',e.review_status,
      'method','POST','path','/v1/run','description',e.config->'description','priceUsd',(e.config->>'priceMicros')::numeric/1000000,
      'inputSchema',e.config->'inputSchema','outputSchema',e.config->'outputSchema') ORDER BY e.id) FROM endpoints e WHERE e.agent_slug=a.slug) AS configured_endpoints
    FROM agents a LEFT JOIN logs l ON l.agent_slug=a.slug LEFT JOIN daily d ON d.agent_slug=a.slug
    WHERE ($1 OR NOT a.demo) ORDER BY a.created_at DESC`,
    [includeDemo],
  );
  return rows.map((row) => {
    const agent = row.data as Agent;
    const endpoints: Endpoint[] =
      row.configured_endpoints ??
      agent.endpoints.map((e) => ({ ...e, available: false }));
    const active = endpoints.filter((e) => e.available);
    const price = active.length
      ? Math.min(...active.map((e) => e.priceUsd))
      : agent.pricing.priceUsd;
    return {
      ...agent,
      demo: row.demo,
      ownerId: row.owner_id ?? undefined,
      endpoints,
      pricing: active.length
        ? {
            model: price === 0 ? ("free" as const) : ("per_call" as const),
            priceUsd: price,
            unit: "call",
          }
        : agent.pricing,
      stats: {
        calls7d: row.c7 ?? 0,
        callsPrev7d: row.p7 ?? 0,
        calls30d: row.c30 ?? 0,
        callsPrev30d: row.p30 ?? 0,
        p50Ms: Math.round(row.p50 ?? 0),
        p95Ms: Math.round(row.p95 ?? 0),
        uptime: Number(row.uptime ?? 100),
      },
      upvotes: row.votes,
      dailyCalls: row.daily_calls ?? {},
      healthSamples: row.samples ?? 0,
    };
  });
}
export async function getAgent(slug: string) {
  return (await listAgents()).find((a) => a.slug === slug);
}
export async function addAgent(agent: Agent, ownerId: string) {
  await db.query("INSERT INTO agents(slug,owner_id,data) VALUES($1,$2,$3)", [
    agent.slug,
    ownerId,
    agent,
  ]);
}
export async function upvote(
  slug: string,
  userId: string,
): Promise<number | undefined> {
  return transaction(async (c) => {
    const agent = await c.query(
      "SELECT slug FROM agents WHERE slug=$1 AND NOT demo",
      [slug],
    );
    if (!agent.rowCount) return undefined;
    await c.query(
      "INSERT INTO votes(agent_slug,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [slug, userId],
    );
    return (
      await c.query(
        "SELECT count(*)::int AS count FROM votes WHERE agent_slug=$1",
        [slug],
      )
    ).rows[0].count as number;
  });
}
