"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { CHAT_INPUT, CHAT_OUTPUT } from "@/lib/endpoint-config";
const template = {
  id: "run",
  description: "Answer a task using chat messages",
  url: "https://api.example.com/run",
  contract: "chat.v1",
  adapter: "json",
  inputSchema: CHAT_INPUT,
  outputSchema: CHAT_OUTPUT,
  priceMicros: 10000,
  timeoutMs: 15000,
  sideEffects: true,
};
export function EndpointEditor({ slug }: { slug: string }) {
  const [text, setText] = useState(JSON.stringify(template, null, 2));
  const [entries, setEntries] = useState<
    { id: string; approved: boolean; config: unknown }[]
  >([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const path = `/api/agents/${slug}/endpoints`;
  async function load() {
    setEntries((await api<{ endpoints: typeof entries }>(path)).endpoints);
  }
  useEffect(() => {
    load().catch((e) => setMessage(e.message));
  }, [slug]); // eslint-disable-line
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {entries.map((e) => (
          <button
            key={e.id}
            className="rounded-md border border-line px-3 py-2 text-sm"
            onClick={() => setText(JSON.stringify(e.config, null, 2))}
          >
            {e.id} · {e.approved ? "Approved" : "Pending review"}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">
        Prices are integer microdollars: 10,000 = $0.01 per successful call. Set
        sideEffects to false only for read-only agents. Changes require a new
        approval. Never paste credentials into this form.
      </p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage("");
          try {
            const config = JSON.parse(text);
            const result = await api<{ message: string }>(path, "PUT", config);
            setMessage(result.message);
            await load();
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Could not save",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block text-sm font-medium">
          Endpoint configuration
          <textarea
            aria-label="Endpoint configuration"
            rows={25}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-surface p-4 font-mono text-xs"
            spellCheck={false}
          />
        </label>
        <button
          disabled={busy}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save for review"}
        </button>
      </form>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
