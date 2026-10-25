"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATALOG_SORTS } from "@/lib/rankings";
import { CATEGORIES } from "@/lib/types";

const PRICING = [
  { id: "", label: "Any" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
  { id: "per_call", label: "Per call" },
  { id: "per_task", label: "Per task" },
  { id: "per_unit", label: "Per unit" },
];

const MAX_PRICE = [
  { id: "", label: "Any price" },
  { id: "0.01", label: "≤ $0.01" },
  { id: "0.1", label: "≤ $0.10" },
  { id: "0.5", label: "≤ $0.50" },
];

/** Facet sidebar for the catalog; every change rewrites the URL query. */
export function AgentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }

  const group = (title: string, key: string, options: { id: string; label: string }[]) => (
    <fieldset className="space-y-1">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{title}</legend>
      {options.map((o) => (
        <label key={o.id || "any"} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name={key}
            checked={(params.get(key) ?? "") === o.id}
            onChange={() => set(key, o.id)}
            className="accent-[var(--color-accent)]"
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );

  return (
    <aside className="space-y-6">
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Sort</span>
        <select
          value={params.get("sort") ?? "popular"}
          onChange={(e) => set("sort", e.target.value === "popular" ? "" : e.target.value)}
          className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
        >
          {CATALOG_SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      {group("Category", "category", [{ id: "", label: "All" }, ...CATEGORIES])}
      {group("Pricing", "pricing", PRICING)}
      {group("Max price", "max_price", MAX_PRICE)}
    </aside>
  );
}
