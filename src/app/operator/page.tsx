import Link from "next/link";
import { db } from "@/lib/db";
import { operatorPage } from "@/lib/operator-page";
import { reviewLabels, type ReviewStatus } from "@/lib/review-types";
export const dynamic = "force-dynamic";
export const metadata = { title: "Operator review · Select AI Agents" };
export default async function OperatorPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await operatorPage();
  const search = await searchParams;
  const status: ReviewStatus | "all" =
    search.status === "all"
      ? "all"
      : Object.hasOwn(reviewLabels, search.status ?? "")
        ? (search.status as ReviewStatus)
        : "pending";
  const page = Math.max(
    1,
    Math.min(10000, Number.parseInt(search.page ?? "1", 10) || 1),
  );
  const [result, counts] = await Promise.all([
    db.query(
      `SELECT e.agent_slug,e.id,e.review_status,e.review_version,e.updated_at,
      e.config->>'url' AS url,e.config->>'priceMicros' AS price,e.config->>'sideEffects' AS side_effects,
      a.data->>'name' AS name,a.data->>'maker' AS maker
      FROM endpoints e JOIN agents a ON a.slug=e.agent_slug WHERE NOT a.demo AND ($1='all' OR e.review_status=$1)
      ORDER BY e.updated_at ASC,e.agent_slug,e.id LIMIT 51 OFFSET $2`,
      [status, (page - 1) * 50],
    ),
    db.query(
      "SELECT e.review_status,count(*)::int AS count FROM endpoints e JOIN agents a ON a.slug=e.agent_slug WHERE NOT a.demo GROUP BY e.review_status",
    ),
  ]);
  const totals = Object.fromEntries(
    counts.rows.map((r) => [r.review_status, r.count]),
  );
  return (
    <div>
      <header>
        <p className="eyebrow">Operations / Endpoint reviews</p>
        <h1>A clear path to live.</h1>
        <p className="mt-3 text-muted">
          Review each connection before it receives work. Oldest submissions
          appear first.
        </p>
      </header>
      <nav className="operator-filters" aria-label="Review status">
        {(
          [
            "pending",
            "changes_requested",
            "approved",
            "disabled",
            "all",
          ] as const
        ).map((s) => (
          <Link
            key={s}
            href={`/operator?status=${s}`}
            aria-current={status === s ? "page" : undefined}
          >
            {s === "all" ? "All endpoints" : reviewLabels[s]}{" "}
            <span>
              {s === "all"
                ? counts.rows.reduce((n, r) => n + r.count, 0)
                : (totals[s] ?? 0)}
            </span>
          </Link>
        ))}
      </nav>
      <div className="maker-notice">
        <strong>Approval enables routing; it does not run an agent.</strong>
        <p>
          Check ownership, behavior, pricing, schemas, and data handling. Host
          allowlists and credential values are configured on the server.
          Existing calls may finish after an endpoint is disabled.
        </p>
      </div>
      {result.rows.length ? (
        <div className="operator-queue">
          {result.rows.slice(0, 50).map((row) => (
            <article key={`${row.agent_slug}/${row.id}`}>
              <div>
                <span
                  className="maker-status"
                  data-tone={
                    row.review_status === "approved"
                      ? "live"
                      : row.review_status === "pending"
                        ? "pending"
                        : "attention"
                  }
                >
                  {reviewLabels[row.review_status as ReviewStatus]}
                </span>
                <h2>
                  {row.name}
                  <span> / {row.id}</span>
                </h2>
                <p>
                  {row.maker} · Version {row.review_version}
                </p>
                <p className="operator-url">{row.url}</p>
              </div>
              <div className="operator-queue-meta">
                <strong>
                  ${(Number(row.price) / 1e6).toFixed(6)} / successful call
                </strong>
                <p>
                  {row.side_effects === "false"
                    ? "Declared read-only"
                    : "External changes possible"}
                </p>
                <p>
                  Updated{" "}
                  {new Date(row.updated_at).toLocaleString("en", {
                    timeZone: "UTC",
                  })}{" "}
                  UTC
                </p>
                <Link
                  className="text-link"
                  href={`/operator/${encodeURIComponent(row.agent_slug)}/${encodeURIComponent(row.id)}`}
                >
                  Review endpoint ↗
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="maker-empty">
          <p className="eyebrow">Review queue</p>
          <h3>No endpoints in this view.</h3>
          <p>
            Maker submissions will appear here when they’re ready for review.
          </p>
        </div>
      )}
      <div className="operator-pagination">
        {page > 1 && (
          <Link href={`/operator?status=${status}&page=${page - 1}`}>
            ← Previous
          </Link>
        )}
        <span>Page {page}</span>
        {result.rows.length > 50 && (
          <Link href={`/operator?status=${status}&page=${page + 1}`}>
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
