import type { AttentionState, Stage } from "@/lib/types";
import { ATTENTION, SOURCE, stageToken } from "@/lib/status";
import { formatElapsed } from "@/lib/format";
import { assertNever } from "@/lib/assert";

/**
 * The status language, rendered.
 *
 * Colour is never the only signal. Each stage carries a distinct mark shape as
 * well as a hue, so the system holds up under colour blindness, greyscale, and
 * the plain fact that teal and green sit close together.
 */

// ─────────────────────────────────────────────────────────────
// Stage
// ─────────────────────────────────────────────────────────────

function StageMark({
  stage,
  size = 9,
}: {
  stage: Stage;
  size?: number;
}) {
  const t = stageToken(stage);
  const s = size;

  switch (t.mark) {
    // New — a filled disc. Something arrived.
    case "solid":
      return (
        <svg width={s} height={s} viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="4.5" fill={t.hex} />
        </svg>
      );

    // Qualifying — half filled. Literally in progress.
    case "half":
      return (
        <svg width={s} height={s} viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="4" fill="none" stroke={t.hex} strokeWidth="1.6" />
          <path d="M5 1a4 4 0 0 1 0 8Z" fill={t.hex} />
        </svg>
      );

    // Ready to view — a tick. Qualified, waiting on a person.
    case "check":
      return (
        <svg width={s} height={s} viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="4.5" fill={t.hex} />
          <path
            d="M3 5.2 4.4 6.6 7.2 3.6"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    // Closed — a hollow ring. The empty one; it's done.
    case "hollow":
      return (
        <svg width={s} height={s} viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="4" fill="none" stroke={t.hex} strokeWidth="1.6" />
        </svg>
      );

    default:
      return assertNever(t.mark);
  }
}

export function StageBadge({
  stage,
  outcome = null,
  size = "md",
}: {
  stage: Stage;
  /** Only rendered for `closed` — "Closed · won" reads far better than "Closed". */
  outcome?: "won" | "lost" | null;
  size?: "sm" | "md";
}) {
  const t = stageToken(stage);
  const label =
    stage === "closed" && outcome ? `${t.label} · ${outcome}` : t.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap ${
        size === "sm" ? "text-2xs px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
      style={{ color: t.hex, background: t.tint, borderColor: t.border }}
      title={t.hint}
    >
      <StageMark stage={stage} size={size === "sm" ? 8 : 9} />
      {label}
    </span>
  );
}

/** The pipeline strip on the dashboard — counts per stage, one row, scannable. */
export function StageCount({
  stage,
  count,
  href,
}: {
  stage: Stage;
  count: number;
  href?: string;
}) {
  const t = stageToken(stage);
  const inner = (
    <>
      <span className="flex items-center gap-1.5">
        <StageMark stage={stage} />
        <span className="text-xs font-medium text-muted">{t.label}</span>
      </span>
      <span className="t-metric text-lg" style={{ color: t.hex }}>
        {count}
      </span>
    </>
  );

  const cls =
    "flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-md border transition-colors";
  const style = { background: t.tint, borderColor: t.border };

  return href ? (
    <a href={href} className={`${cls} hover:brightness-[0.98]`} style={style}>
      {inner}
    </a>
  ) : (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Attention — the second axis
// ─────────────────────────────────────────────────────────────

/**
 * A 3px ember rule down the left edge of a row or card.
 *
 * Pending gets the rule alone. Overdue gets the rule plus a tinted row — the
 * escalation is a change in weight, not a change in colour, so a hot lead going
 * cold reads as urgent without reading as an error.
 */
export function AttentionRule({ state }: { state: AttentionState }) {
  if (state === "none") return null;
  return (
    <span
      aria-hidden="true"
      className="absolute left-0 top-0 bottom-0 w-[3px]"
      style={{ background: ATTENTION[state].hex }}
    />
  );
}

/** Row background for an overdue lead. Nothing for pending or none. */
export function attentionRowStyle(state: AttentionState): React.CSSProperties {
  return state === "handoff_overdue"
    ? { background: ATTENTION.handoff_overdue.tint }
    : {};
}

/**
 * The aging clock. `now` is a prop rather than a `Date.now()` inside the render
 * so tests do not go red at midnight, and so the server and client agree.
 */
export function AgingClock({
  since,
  state,
  now,
  showLabel = true,
}: {
  since: string;
  state: AttentionState;
  now: Date;
  showLabel?: boolean;
}) {
  if (state === "none") return null;

  const overdue = state === "handoff_overdue";
  const tone = ATTENTION[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold text-2xs px-2 py-0.5 whitespace-nowrap`}
      style={{
        color: tone.hex,
        background: overdue ? tone.tint : "transparent",
        borderColor: tone.border,
      }}
      title={
        overdue
          ? "This handoff has been waiting past the agency's threshold."
          : "An agent has been notified and hasn't picked this up yet."
      }
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${overdue ? "pulse-ember" : ""}`}
        style={{ background: tone.hex }}
      />
      {showLabel ? (overdue ? "Overdue" : "Handoff") : null}
      <span className="t-mono" style={{ color: "inherit", fontSize: "0.6875rem" }}>
        {formatElapsed(since, now)}
      </span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Listing source
// ─────────────────────────────────────────────────────────────

/**
 * Source is not decoration. A synced listing is overwritten on the next sync, so
 * editing one loses your edit; a manual listing is never touched. That changes
 * what the user is allowed to do, which is why the row also gets a coloured
 * leading spine (see `sourceSpineStyle`) rather than just this label.
 */
export function SourceTag({ source }: { source: "synced" | "manual" }) {
  const t = SOURCE[source];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border font-semibold text-2xs px-2 py-0.5 whitespace-nowrap"
      style={{ color: t.hex, background: t.tint, borderColor: t.border }}
      title={t.hint}
    >
      {source === "synced" ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {t.label}
    </span>
  );
}

export function sourceSpineStyle(source: "synced" | "manual"): React.CSSProperties {
  return { background: SOURCE[source].hex };
}
