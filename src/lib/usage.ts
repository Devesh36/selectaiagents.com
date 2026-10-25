import type { Agent } from "./types";

/** Last complete UTC day covered by the (sample) usage data. */
export const USAGE_AS_OF = "2026-10-24";
export const USAGE_DAYS = 30;

/** ISO dates for the trailing usage window, oldest first. */
export function usageDays(days = USAGE_DAYS): string[] {
  const end = new Date(`${USAGE_AS_OF}T00:00:00Z`).getTime();
  return Array.from({ length: days }, (_, i) =>
    new Date(end - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10),
  );
}

function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Spread `total` over `n` days following `weights`, keeping the exact sum. */
function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const out = weights.map((w) => Math.floor((total * w) / sum));
  out[out.length - 1] += total - out.reduce((a, b) => a + b, 0);
  return out;
}

/**
 * Daily call counts for the last 30 days. Sample data only stores window
 * totals, so this derives a deterministic daily shape whose last-7 and
 * last-30 sums match the stored stats. Real usage will come from call logs.
 */
export function dailyUsage(agent: Agent): number[] {
  const { calls7d, callsPrev7d, calls30d } = agent.stats;
  const days = usageDays();
  const seed = hash(agent.slug);
  const growth = callsPrev7d > 0 ? Math.min(calls7d / callsPrev7d, 4) : 2;
  const weight = (i: number, n: number) => {
    const trend = 1 + (growth - 1) * (i / Math.max(n - 1, 1)) * 0.5;
    const weekday = new Date(`${days[i]}T00:00:00Z`).getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? 0.85 : 1;
    const noise = 0.92 + ((seed >> (i % 24)) & 15) / 100;
    return Math.max(trend, 0.05) * weekend * noise;
  };
  const early = Array.from({ length: USAGE_DAYS - 7 }, (_, i) => weight(i, USAGE_DAYS));
  const late = Array.from({ length: 7 }, (_, i) => weight(USAGE_DAYS - 7 + i, USAGE_DAYS));
  return [...distribute(Math.max(calls30d - calls7d, 0), early), ...distribute(calls7d, late)];
}

export interface StackedSeries {
  key: string;
  label: string;
  values: number[];
}

/** Top `n` agents by 30-day calls as their own series, the rest folded into "Other". */
export function stackedUsage(agents: Agent[], n = 7): StackedSeries[] {
  const sorted = [...agents].sort((a, b) => b.stats.calls30d - a.stats.calls30d);
  const series: StackedSeries[] = sorted
    .slice(0, n)
    .map((a) => ({ key: a.slug, label: a.name, values: dailyUsage(a) }));
  const rest = sorted.slice(n);
  if (rest.length) {
    const other = new Array(USAGE_DAYS).fill(0);
    for (const a of rest) dailyUsage(a).forEach((v, i) => (other[i] += v));
    series.push({ key: "other", label: "Other", values: other });
  }
  return series;
}
