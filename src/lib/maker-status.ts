import type { Agent } from "./types";
export type MakerStatus =
  "Draft" | "Awaiting approval" | "Live" | "Needs attention";
export function makerStatus(agent: Agent): {
  label: MakerStatus;
  hint: string;
  tone: string;
} {
  const configured = agent.endpoints.filter((e) => e.contract);
  const approved = configured.filter((e) => e.available);
  if (!configured.length)
    return {
      label: "Needs attention",
      hint: "Your listing is public. Add an endpoint to enable calls.",
      tone: "attention",
    };
  if (!approved.length)
    return {
      label: "Awaiting approval",
      hint: "Endpoint saved. An operator must approve it before calls are enabled.",
      tone: "pending",
    };
  if ((agent.healthSamples ?? 0) > 0 && agent.stats.uptime < 98)
    return {
      label: "Needs attention",
      hint: "Measured uptime is below 98%, so routing is paused. Contact the operator to review failures.",
      tone: "attention",
    };
  const pending = configured.length - approved.length;
  return {
    label: "Live",
    hint: pending
      ? `${approved.length} approved endpoint(s); ${pending} additional endpoint(s) awaiting approval.`
      : (agent.healthSamples ?? 0) > 0
        ? "Approved for routing. Health is based on measured calls."
        : "Approved for routing. No calls have been measured yet.",
    tone: "live",
  };
}
