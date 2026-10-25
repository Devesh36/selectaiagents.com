"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/types";

const input = "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export function SubmitForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [free, setFree] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const json = await res.json();
    setPending(false);
    if (!res.ok) return setErrors(json.errors ?? { form: "Something went wrong." });
    router.push(`/agents/${json.slug}`);
  }

  const field = (name: string, label: string, el: React.ReactNode, hint?: string) => (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {el}
      {hint && !errors[name] && <span className="block text-xs text-muted">{hint}</span>}
      {errors[name] && <span className="block text-xs text-down">{errors[name]}</span>}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      {field("name", "Agent name", <input name="name" required maxLength={40} className={input} />)}
      {field("tagline", "Tagline", <input name="tagline" required maxLength={80} className={input} />, "One line, max 80 characters.")}
      {field("description", "Description", <textarea name="description" required rows={4} className={input} />)}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "category",
          "Category",
          <select name="category" required className={input} defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>,
        )}
        {field("maker", "Maker", <input name="maker" required className={input} />)}
      </div>
      {field("website", "Website", <input name="website" type="url" required placeholder="https://" className={input} />)}
      {field("tags", "Tags", <input name="tags" placeholder="search, browser, crm" className={input} />, "Comma-separated, up to 5.")}
      <div className="grid gap-5 sm:grid-cols-3">
        {field(
          "pricingModel",
          "Pricing",
          <select name="pricingModel" className={input} onChange={(e) => setFree(e.target.value === "free")}>
            <option value="per_call">Per call</option>
            <option value="per_task">Per task</option>
            <option value="per_unit">Per unit</option>
            <option value="free">Free</option>
          </select>,
        )}
        {field("priceUsd", "Price (USD)", <input name="priceUsd" type="number" step="any" min="0" defaultValue="0.01" disabled={free} className={input} />)}
        {field("unit", "Unit", <input name="unit" placeholder="call" disabled={free} className={input} />)}
      </div>
      {errors.form && <p className="text-sm text-down">{errors.form}</p>}
      <button disabled={pending} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {pending ? "Launching…" : "Launch today"}
      </button>
    </form>
  );
}
