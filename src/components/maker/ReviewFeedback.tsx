import {
  actionLabels,
  reviewLabels,
  type ReviewEvent,
  type ReviewStatus,
} from "@/lib/review-types";
export function ReviewFeedback({
  status,
  version,
  reviews,
}: {
  status: ReviewStatus;
  version: number;
  reviews: ReviewEvent[];
}) {
  return (
    <section className="maker-review-feedback" aria-label="Operator feedback">
      <div className="review-event-heading">
        <h3>Operator feedback · latest 20 decisions</h3>
        <span
          className="maker-status"
          data-tone={
            status === "approved"
              ? "live"
              : status === "pending"
                ? "pending"
                : "attention"
          }
        >
          {reviewLabels[status]}
        </span>
      </div>
      <p className="text-sm text-muted mt-3">
        {status === "pending"
          ? "This version is awaiting review. Earlier decisions below are kept for context."
          : status === "approved"
            ? "This endpoint is approved for routing. Editing it requires a new review."
            : status === "changes_requested"
              ? "Update the endpoint using the feedback below, then save it to resubmit for review."
              : "This endpoint has been disabled. Address the operator’s feedback before resubmitting."}{" "}
        Current version: {version}.
      </p>
      {!reviews.length ? (
        <p className="text-xs text-muted mt-3">
          No review feedback recorded yet.
        </p>
      ) : (
        <ol className="review-history">
          {reviews.map((event) => (
            <li key={event.id}>
              <div className="review-event-heading">
                <strong>{actionLabels[event.action]}</strong>
                <time>
                  {new Date(event.created_at).toLocaleString("en", {
                    timeZone: "UTC",
                  })}{" "}
                  UTC
                </time>
              </div>
              <p className="text-xs text-muted">
                {event.actor_name} · reviewed version {event.reviewed_version}
              </p>
              <p className="review-note">{event.note || "No note added."}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
