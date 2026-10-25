import type { Agent } from "./types";

/** Recomputed on each render so long-running servers advance at UTC midnight. */
export function usageAsOf(now = Date.now()): string {
  return new Date(now - 86_400_000).toISOString().slice(0, 10);
}
export const USAGE_DAYS = 30;

/** ISO dates for the trailing usage window, oldest first. */
export function usageDays(days = USAGE_DAYS): string[] {
  const end = new Date(`${usageAsOf()}T00:00:00Z`).getTime();
  return Array.from({ length: days }, (_, i) =>
    new Date(end - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10),
  );
}

/** Measured successful calls, aligned to complete UTC days. */
export function dailyUsage(agent: Agent): number[] {
  return usageDays().map((day) => agent.dailyCalls?.[day] ?? 0);
}

export interface StackedSeries {
  key: string;
  label: string;
  values: number[];
}

/** Top `n` agents by 30-day calls as their own series, the rest folded into "Other". */
export function stackedUsage(agents: Agent[], n = 7): StackedSeries[] {
  const sorted = [...agents].sort(
    (a, b) => b.stats.calls30d - a.stats.calls30d,
  );
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
