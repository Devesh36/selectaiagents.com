import test from "node:test";
import assert from "node:assert/strict";
import { isOperator } from "../src/lib/operator-access";
import { reviewDecisionSchema } from "../src/lib/review-decision";
import { makerStatus } from "../src/lib/maker-status";
import { SEED_AGENTS } from "../src/lib/seed";

test("operator access defaults closed and requires an exact configured user ID", () => {
  const previous = process.env.OPERATOR_USER_IDS;
  try {
    delete process.env.OPERATOR_USER_IDS;
    assert.equal(isOperator("user-123"), false);
    assert.equal(isOperator(""), false);
    process.env.OPERATOR_USER_IDS = " user-123 , user-456 ";
    assert.equal(isOperator("user-123"), true);
    assert.equal(isOperator("user-12"), false);
    assert.equal(isOperator("admin@example.com"), false);
    process.env.OPERATOR_USER_IDS = "user-456";
    assert.equal(isOperator("user-123"), false);
  } finally {
    if (previous === undefined) delete process.env.OPERATOR_USER_IDS;
    else process.env.OPERATOR_USER_IDS = previous;
  }
});
test("review decisions require a version and maker feedback for negative decisions", () => {
  assert.equal(
    reviewDecisionSchema.safeParse({ action: "approve", version: 1 }).success,
    true,
  );
  for (const value of [
    { action: "approve" },
    { action: "approve", version: 0 },
    { action: "disable", version: 1, note: " " },
    { action: "request_changes", version: 1, note: "fix" },
    { action: "approve", version: 1, credentialEnv: "DATABASE_URL" },
    { action: "approve", version: 1, credentialValue: "secret" },
    {
      action: "disable",
      version: 1,
      note: "Please fix the schema",
      credentialEnv: "MAKER_TOKEN",
    },
  ])
    assert.equal(reviewDecisionSchema.safeParse(value).success, false);
  assert.equal(
    reviewDecisionSchema.safeParse({
      action: "request_changes",
      version: 2,
      note: "Please version your output schema.",
    }).success,
    true,
  );
});
test("maker status distinguishes operator feedback from a pending review", () => {
  const agent = {
    ...SEED_AGENTS[0],
    healthSamples: 0,
    endpoints: [
      {
        ...SEED_AGENTS[0].endpoints[0],
        contract: "chat.v1",
        available: false,
        reviewStatus: "disabled" as const,
      },
    ],
  };
  assert.equal(makerStatus(agent).label, "Needs attention");
  assert.equal(
    makerStatus({
      ...agent,
      endpoints: [{ ...agent.endpoints[0], reviewStatus: "changes_requested" }],
    }).label,
    "Needs attention",
  );
  assert.equal(
    makerStatus({
      ...agent,
      endpoints: [{ ...agent.endpoints[0], reviewStatus: "pending" }],
    }).label,
    "Awaiting approval",
  );
  const mixed = {
    ...agent,
    endpoints: [
      ...agent.endpoints,
      {
        ...agent.endpoints[0],
        id: "other",
        available: true,
        reviewStatus: "approved" as const,
      },
    ],
  };
  assert.equal(makerStatus(mixed).label, "Live");
  assert.match(makerStatus(mixed).hint, /need changes or are disabled/);
});
