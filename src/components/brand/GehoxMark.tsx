/**
 * The Gehox mark. Same geometry as the marketing site's favicon — a stroked "G"
 * rather than type, so it renders identically regardless of what fonts are
 * available.
 *
 * `tone="gradient"` for light surfaces (login, onboarding), `tone="mono"` for the
 * graphite spine where the violet gradient would disappear into the dark.
 */
export function GehoxMark({
  size = 28,
  tone = "gradient",
  className,
}: {
  size?: number;
  tone?: "gradient" | "mono";
  className?: string;
}) {
  const gid = `gehox-grad-${tone}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Gehox"
      className={className}
    >
      {tone === "gradient" && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2B0F54" />
            <stop offset="0.55" stopColor="#471A79" />
            <stop offset="1" stopColor="#6411AD" />
          </linearGradient>
        </defs>
      )}
      <rect
        width="64"
        height="64"
        rx="14"
        fill={tone === "gradient" ? `url(#${gid})` : "#332E2A"}
      />
      <path
        d="M44 22 A 15 15 0 1 0 47 32 L 36 32"
        fill="none"
        stroke={tone === "gradient" ? "#FFFFFF" : "#C9A9F2"}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Mark plus wordmark. The wordmark is the display face, tight and lowercase. */
export function GehoxWordmark({
  size = 28,
  tone = "gradient",
  className = "",
}: {
  size?: number;
  tone?: "gradient" | "mono";
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <GehoxMark size={size} tone={tone} />
      <span
        className="t-display"
        style={{
          fontSize: size * 0.62,
          color: tone === "mono" ? "#F6F3EE" : "var(--color-ink)",
          letterSpacing: "-0.04em",
        }}
      >
        gehox
      </span>
    </span>
  );
}
