export function AgentLogo({
  name,
  color,
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
        background: `color-mix(in srgb, ${color} 11%, var(--color-surface))`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 15%, transparent)`,
        width: size,
        height: size,
        fontSize: size * 0.42,
      }}
    >
      {name.charAt(0)}
    </div>
  );
}
