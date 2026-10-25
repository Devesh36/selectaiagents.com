"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/types";

interface Option {
  id: string;
  name: string;
}

interface Turn {
  role: "user" | "assistant" | "error";
  content: string;
  meta?: { model: string; attempts: { model: string; status: string }[]; cost?: number };
}

const input = "w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm";

export function Playground({ options, initialModel }: { options: Option[]; initialModel?: string }) {
  const [model, setModel] = useState(initialModel && options.some((o) => o.id === initialModel) ? initialModel : "auto");
  const [fallbacks, setFallbacks] = useState<string[]>([]);
  const [sort, setSort] = useState("usage");
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || pending) return;
    const history = [...turns, { role: "user" as const, content: text.trim() }];
    setTurns(history);
    setText("");
    setPending(true);
    const res = await fetch("/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer playground" },
      body: JSON.stringify({
        model,
        models: model === "auto" ? undefined : fallbacks,
        route: model === "auto" ? { sort, category: category || undefined } : undefined,
        messages: history.filter((t) => t.role !== "error").map(({ role, content }) => ({ role, content })),
      }),
    });
    const json = await res.json();
    setPending(false);
    setTurns((t) => [
      ...t,
      res.ok
        ? {
            role: "assistant",
            content: json.choices[0].message.content,
            meta: { model: json.model, attempts: json.routing.attempts, cost: json.usage.would_cost_usd },
          }
        : { role: "error", content: json.error?.message ?? "Request failed", meta: json.routing && { model: "", attempts: json.routing.attempts } },
    ]);
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Agent</span>
          <select value={model} onChange={(e) => setModel(e.target.value)} className={input}>
            <option value="auto">Auto router</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} — {o.id}
              </option>
            ))}
          </select>
        </label>
        {model === "auto" ? (
          <>
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
                <option value="">Infer from message</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Prefer</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={input}>
                <option value="usage">Most used</option>
                <option value="price">Lowest price</option>
                <option value="latency">Lowest latency</option>
                <option value="uptime">Highest uptime</option>
              </select>
            </label>
          </>
        ) : (
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Fallbacks</span>
            <select
              multiple
              value={fallbacks}
              onChange={(e) => setFallbacks([...e.target.selectedOptions].map((o) => o.value))}
              className={`${input} h-36`}
            >
              {options
                .filter((o) => o.id !== model)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
            </select>
            <span className="block text-xs text-muted">Tried in order if the agent is unavailable.</span>
          </label>
        )}
        <p className="text-xs text-muted">
          Sandbox mode: routing is real, agents are not called and nothing is billed.
        </p>
      </aside>

      <section className="flex min-h-[420px] flex-col rounded-xl border border-line bg-surface">
        <div className="flex-1 space-y-4 p-4">
          {turns.length === 0 && (
            <p className="text-sm text-muted">
              Describe a task, e.g. “find B2B leads for dental clinics in Osaka” or “fix the failing CI on my repo”.
            </p>
          )}
          {turns.map((t, i) => (
            <div key={i} className={t.role === "user" ? "ml-auto max-w-[80%]" : "max-w-[90%]"}>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  t.role === "user" ? "bg-ink text-bg" : t.role === "error" ? "border border-down text-down" : "bg-bg"
                }`}
              >
                {t.content}
              </div>
              {t.meta && (
                <div className="mt-1 space-x-2 text-xs text-muted">
                  {t.meta.model && <code>{t.meta.model}</code>}
                  {t.meta.cost !== undefined && <span>would cost ${t.meta.cost}</span>}
                  {(t.meta.attempts.length > 1 || t.role === "error") && t.meta.attempts.length > 0 && (
                    <span>
                      route: {t.meta.attempts.map((a) => `${a.model.split("/").pop()} (${a.status})`).join(" → ")}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          {pending && <p className="text-sm text-muted">Routing…</p>}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a task to the agent"
            className="flex-1 rounded-md border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button disabled={pending} className="rounded-md bg-accent px-4 text-sm font-medium text-white disabled:opacity-50">
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
