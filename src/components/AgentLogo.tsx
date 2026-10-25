export function AgentLogo({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-lg font-semibold text-white"
      style={{ background: color, width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.charAt(0)}
    </div>
  );
}
