/** Deployment-managed user IDs, never client claims or self-editable profile fields. */
export function isOperator(userId: string): boolean {
  return (process.env.OPERATOR_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(userId);
}
