import { db } from "./db";
import { listAgents } from "./store";
export type LaunchPeriod = "day" | "week" | "month";
export async function leaderboard(period: LaunchPeriod = "day") {
  // Rank launches in the current UTC calendar period by votes cast in that period.
  const unit = { day: "day", week: "week", month: "month" }[period];
  const { rows } = await db.query(
    `SELECT a.slug,count(v.user_id)::int AS votes
    FROM agents a LEFT JOIN votes v ON v.agent_slug=a.slug AND v.created_at >= date_trunc($1,now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    WHERE NOT a.demo AND (a.data->>'launchedAt')::date >= date_trunc($1,now() AT TIME ZONE 'UTC')::date
    GROUP BY a.slug,a.created_at ORDER BY votes DESC,a.created_at ASC`,
    [unit],
  );
  const agents = await listAgents(false);
  return rows
    .map((row) => ({
      agent: agents.find((a) => a.slug === row.slug)!,
      votes: row.votes as number,
    }))
    .filter((row) => row.agent);
}
export async function badges(slug: string) {
  const labels: string[] = [];
  for (const period of ["day", "week", "month"] as const) {
    const leaders = await leaderboard(period);
    const rank = leaders.findIndex((r) => r.agent.slug === slug);
    if (rank >= 0 && rank < 3 && leaders[rank].votes > 0)
      labels.push(`#${rank + 1} this ${period}`);
  }
  return labels;
}
