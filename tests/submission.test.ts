import test from "node:test";
import assert from "node:assert/strict";
import { buildAgent, type SubmissionInput } from "../src/lib/submission";

const details: Partial<SubmissionInput> = {
  name: "Price Example",
  tagline: "An example agent",
  description: "An agent with a sufficiently long description",
  category: "research",
  maker: "Maker",
  website: "https://example.com",
};

for (const pricingModel of ["per_call", "per_task", "per_unit"]) {
  for (const priceUsd of ["", "   ", "\t\n"]) {
    test(`${pricingModel} rejects blank price ${JSON.stringify(priceUsd)}`, () => {
      const result = buildAgent({ ...details, pricingModel, priceUsd }, new Set());
      assert.ok("errors" in result);
      assert.deepEqual(result.errors, { priceUsd: "Enter a price between $0 and $10." });
    });
  }

  test(`${pricingModel} preserves explicit zero and valid numeric prices`, () => {
    for (const [priceUsd, expected] of [
      [0, 0],
      ["0", 0],
      [" 0 ", 0],
      [0.01, 0.01],
      ["0.01", 0.01],
      [" 0.01 ", 0.01],
      [0.000001, 0.000001],
      ["0.000001", 0.000001],
      [10, 10],
      ["10", 10],
    ] as const) {
      const result = buildAgent({ ...details, pricingModel, priceUsd }, new Set());
      assert.ok("agent" in result, String(priceUsd));
      assert.equal(result.agent.pricing.model, pricingModel);
      assert.equal(result.agent.pricing.priceUsd, expected);
      assert.equal(result.agent.endpoints[0].priceUsd, expected);
    }
  });

  test(`${pricingModel} still rejects missing, nonnumeric and out-of-range prices`, () => {
    for (const priceUsd of [undefined, "invalid", -0.01, "-0.01", NaN, Infinity, "Infinity", 10.01, "10.01"]) {
      const result = buildAgent({ ...details, pricingModel, priceUsd }, new Set());
      assert.ok("errors" in result, String(priceUsd));
      assert.deepEqual(result.errors, { priceUsd: "Enter a price between $0 and $10." });
    }
  });
}

test("free submissions keep zero prices regardless of the supplied price", () => {
  for (const priceUsd of [undefined, "", "   ", "\t\n", 0, "0", 0.01, "invalid", -1, Infinity, 11]) {
    const result = buildAgent({ ...details, pricingModel: "free", priceUsd }, new Set());
    assert.ok("agent" in result, String(priceUsd));
    assert.equal(result.agent.pricing.model, "free");
    assert.equal(result.agent.pricing.priceUsd, 0);
    assert.equal(result.agent.endpoints[0].priceUsd, 0);
  }
});
