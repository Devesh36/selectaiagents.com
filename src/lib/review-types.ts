export const reviewLabels = {
  pending: "Awaiting approval",
  approved: "Approved",
  changes_requested: "Changes requested",
  disabled: "Disabled",
} as const;
export type ReviewStatus = keyof typeof reviewLabels;
export type ReviewEvent = {
  id: string;
  action: "approve" | "request_changes" | "disable";
  actor_name: string;
  actor_type: "operator" | "cli";
  note: string;
  reviewed_version: number;
  created_at: string;
};
export const actionLabels = {
  approve: "Approved",
  request_changes: "Changes requested",
  disable: "Disabled",
} as const;
