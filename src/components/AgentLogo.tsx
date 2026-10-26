export function AgentLogo({
  name,
  size = 40,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-md font-medium"
      style={{
        color: "var(--color-accent)",
        background:
          "color-mix(in srgb, var(--color-accent) 9%, var(--color-surface))",
        border:
          "1px solid color-mix(in srgb, var(--color-accent) 16%, transparent)",
        width: size,
        height: size,
        fontSize: size * 0.42,
      }}
    >
      {name.charAt(0)}
    </div>
  );
}
