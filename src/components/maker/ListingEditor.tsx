"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AgentDetails, type Details } from "./AgentDetails";
import { api } from "@/lib/client-api";
export function ListingEditor({
  slug,
  initial,
}: {
  slug: string;
  initial: Details;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  return (
    <form
      className="maker-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
          await api(`/api/maker/agents/${slug}`, "PUT", value);
          setMessage("Listing updated.");
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not save.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="maker-panel-heading">
        <p className="eyebrow">01 / Listing</p>
        <h2>Your public introduction.</h2>
        <p>
          Update your description, category, website, and tags. Pricing is
          managed with each endpoint below.
        </p>
      </div>
      <fieldset disabled={busy}>
        <AgentDetails
          value={value}
          onChange={(v) => {
            setValue(v);
            setMessage("");
          }}
          published
        />
        <div className="maker-actions">
          <button className="button button-dark">
            {busy ? "Saving…" : "Save listing"}
            <span>↗</span>
          </button>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-down">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </form>
  );
}
