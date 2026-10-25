"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client-api";
export function ReviewActions({
  slug,
  endpoint,
  version,
  credentials,
  currentCredential,
  selfOwned,
}: {
  slug: string;
  endpoint: string;
  version: number;
  credentials: string[];
  currentCredential?: string;
  selfOwned: boolean;
}) {
  const router = useRouter();
  const [action, setAction] = useState("");
  const [credential, setCredential] = useState(
    currentCredential ?? "__choose__",
  );
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <section className="maker-panel">
      <div className="maker-panel-heading">
        <p className="eyebrow">Decision / Version {version}</p>
        <h2>Choose the next step.</h2>
        <p>
          The decision and note appear in the maker’s dashboard. Keep secrets
          and internal credentials out of the note.
        </p>
      </div>
      {selfOwned && (
        <p className="maker-notice">
          You own this agent. Another operator must approve it.
        </p>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setMessage("");
          try {
            await api(
              `/api/operator/endpoints/${encodeURIComponent(slug)}/${encodeURIComponent(endpoint)}`,
              "POST",
              {
                action,
                version,
                note,
                ...(action === "approve" && credential
                  ? { credentialEnv: credential }
                  : {}),
              },
            );
            setMessage("Decision saved. The maker can now see your feedback.");
            router.refresh();
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Could not save the review.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy} className="maker-fields">
          <label className="maker-field">
            <span>Decision</span>
            <select
              required
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setConfirmed(false);
              }}
            >
              <option value="" disabled>
                Choose a decision…
              </option>
              <option value="approve" disabled={selfOwned}>
                Approve — enable calls
              </option>
              <option value="request_changes">
                Request changes — keep calls disabled
              </option>
              <option value="disable">Disable — stop new routing</option>
            </select>
          </label>
          {action === "approve" && (
            <>
              <label className="maker-field">
                <span>Upstream authentication</span>
                <select
                  required
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                >
                  <option value="__choose__" disabled>
                    Choose explicitly…
                  </option>
                  <option value="">No authentication required</option>
                  {credentials.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <small>
                  Only server-side variable names are shown. Install a dedicated
                  MAKER_* credential on the server if it is missing here.
                </small>
              </label>
              <label className="operator-check">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  required
                />
                <span>
                  I reviewed ownership, behavior, price, schemas, and data
                  handling, and the selected authentication is correct.
                </span>
              </label>
            </>
          )}
          <label className="maker-field">
            <span>
              Feedback for the maker{" "}
              {action === "approve" ? "(optional)" : "(required)"}
            </span>
            <textarea
              rows={4}
              maxLength={2000}
              minLength={action === "approve" ? 0 : 5}
              required={action !== "approve"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain what needs to change, or why this endpoint is ready."
            />
          </label>
          <div className="maker-actions">
            <button
              className="button button-dark"
              disabled={
                !action ||
                busy ||
                (action === "approve" &&
                  (!confirmed || credential === "__choose__" || selfOwned))
              }
            >
              {busy ? "Saving…" : "Save decision"} <span>↗</span>
            </button>
            <button
              type="button"
              className="text-link"
              onClick={() => router.refresh()}
            >
              Reload latest version
            </button>
          </div>
        </fieldset>
      </form>
      {error && (
        <p role="alert" className="maker-notice text-down">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="maker-notice">
          {message}
        </p>
      )}
    </section>
  );
}
