import test from "node:test";
import assert from "node:assert/strict";
import { CATALOG_SORTS, filterAgents, type CatalogSort } from "../src/lib/rankings";
import { SEED_AGENTS } from "../src/lib/seed";
import type { Agent } from "../src/lib/types";

function agent(
  slug: string,
  category: Agent["category"],
  calls7d: number,
  callsPrev7d: number,
  priceUsd: number,
  p50Ms: number,
  launchedAt: string,
): Agent {
  return {
    ...SEED_AGENTS[0],
    slug,
    name: `${slug} agent`,
    tagline: "Catalog test fixture",
    description: "Catalog test fixture",
    maker: "Test maker",
    tags: [],
    category,
    pricing: { model: priceUsd ? "per_call" : "free", priceUsd, unit: "call" },
    stats: { ...SEED_AGENTS[0].stats, calls7d, callsPrev7d, p50Ms },
    launchedAt,
  };
}

const agents = [
  agent("alpha", "coding", 100, 10, 0.03, 30, "2026-01-01"),
  agent("beta", "research", 300, 100, 0, 20, "2026-01-03"),
  agent("gamma", "coding", 200, 0, 0.02, 10, "2026-01-02"),
];
const slugs = (list: Agent[]) => list.map((a) => a.slug);
const popular = ["beta", "gamma", "alpha"];

for (const sort of [
  undefined,
  "",
  "unsupported",
  "__proto__",
  "constructor",
  "toString",
  "hasOwnProperty",
  "valueOf",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
  "toLocaleString",
]) {
  test(`unsupported catalog sort ${String(sort)} falls back to popularity`, () => {
    // Page and API query parameters reach this function through a type assertion.
    assert.deepEqual(slugs(filterAgents(agents, { sort: sort as CatalogSort })), popular);
  });
}

const expected: Record<CatalogSort, string[]> = {
  popular,
  trending: ["alpha", "beta", "gamma"],
  newest: ["beta", "gamma", "alpha"],
  "price-asc": ["beta", "gamma", "alpha"],
  "price-desc": ["alpha", "gamma", "beta"],
  latency: ["gamma", "beta", "alpha"],
};

for (const { id: sort } of CATALOG_SORTS) {
  test(`catalog supports ${sort} sorting without mutating its input`, () => {
    const before = structuredClone(agents);
    assert.deepEqual(slugs(filterAgents(agents, { sort })), expected[sort]);
    assert.deepEqual(agents, before);
  });
}

test("catalog filters still apply when an inherited sort name falls back to popularity", () => {
  const sort = "__proto__" as CatalogSort;
  assert.deepEqual(slugs(filterAgents(agents, { sort, q: "ALPHA" })), ["alpha"]);
  assert.deepEqual(slugs(filterAgents(agents, { sort, category: "coding" })), ["gamma", "alpha"]);
  assert.deepEqual(slugs(filterAgents(agents, { sort, pricing: "free" })), ["beta"]);
  assert.deepEqual(slugs(filterAgents(agents, { sort, pricing: "paid" })), ["gamma", "alpha"]);
  assert.deepEqual(slugs(filterAgents(agents, { sort, maxPrice: 0.02 })), ["beta", "gamma"]);
  assert.deepEqual(slugs(filterAgents(agents, {
    sort, q: "agent", category: "coding", pricing: "paid", maxPrice: 0.02,
  })), ["gamma"]);
  assert.deepEqual(filterAgents(agents, { sort, category: "support" }), []);
});
