import type { AttentionState, Lead, Stage } from "./types";
import { minutesSince } from "./format";

/**
 * THE SINGLE SOURCE OF STATUS TRUTH.
 *
 * Stage colour appears in badges, filter chips, dashboard counts, the pipeline
 * strip, and the leads table. If each of those hardcodes a hex they drift within
 * a month and the "consistent status-color language" requirement quietly dies.
 * Everything reads from here.
 *
 * Two independent axes:
 *   STAGE     — where the lead is in the pipeline. Always present.
 *   ATTENTION — whether a human is needed right now. An overlay on top of a stage,
 *               never a stage itself.
 *
 * Colour alone is never the signal. Every stage carries a distinct mark shape as
 * well as a hue, so the system survives colour blindness, greyscale printing, and
 * the fact that teal and green sit close together on the wheel.
 */

export interface StageToken {
  /** Machine value. */
  id: Stage;
  /** What a human calls it. */
  label: string;
  /** Foreground: badge text, dot fill, pipeline segment. */
  hex: string;
  /** Background tint for badges and selected rows. Always passes text/hex on it. */
  tint: string;
  /** Border for the tinted badge — the tint alone is too soft on warm paper. */
  border: string;
  /**
   * Redundant encoding, so the badge is readable without colour.
   *   solid  — filled disc            (New)
   *   half   — disc, half filled      (Qualifying — literally "in progress")
   *   check  — disc with a tick       (Ready to view)
   *   hollow — ring, no fill          (Closed — the empty one, it's done)
   */
  mark: "solid" | "half" | "check" | "hollow";
  /** One line of plain English, used in tooltips and the filter menu. */
  hint: string;
}

/**
 * Order matters — the pipeline strip and the stage filter both render in this
 * sequence, and it mirrors the `Stage` union in types.ts.
 */
export const STAGE_ORDER: readonly Stage[] = [
  "new",
  "qualifying",
  "ready_to_view",
  "closed",
] as const;

export const STAGE: Record<Stage, StageToken> = {
  new: {
    id: "new",
    label: "New",
    hex: "#0F766E",
    tint: "#E4F1EF",
    border: "#BFDDD8",
    mark: "solid",
    hint: "The AI has replied, nothing qualified yet.",
  },
  qualifying: {
    id: "qualifying",
    label: "Qualifying",
    hex: "#9A5B0B",
    tint: "#F8EEDD",
    border: "#E6CFA6",
    mark: "half",
    hint: "The AI is still working out budget, area, and timeline.",
  },
  ready_to_view: {
    id: "ready_to_view",
    // #15803D measured 4.35:1 on its own tint — just under AA for 12px badge
    // text. Darkened to clear 4.5 with margin (4.87:1).
    label: "Ready to view",
    hex: "#15773A",
    tint: "#E5F2E8",
    border: "#BFDDC7",
    mark: "check",
    hint: "Qualified and asking to see a property. Needs an agent.",
  },
  closed: {
    id: "closed",
    label: "Closed",
    hex: "#6F6862",
    tint: "#EFEBE5",
    border: "#DCD5CB",
    mark: "hollow",
    hint: "Finished — viewed, dropped, or gone quiet.",
  },
};

export function stageToken(stage: Stage): StageToken {
  // Defensive: a stage the client does not know about (backend added a fifth)
  // must render as something neutral rather than crash a whole table.
  return STAGE[stage] ?? STAGE.closed;
}

// ─────────────────────────────────────────────────────────────
// Attention — the second axis
// ─────────────────────────────────────────────────────────────

export interface AttentionToken {
  id: AttentionState;
  label: string;
  /** Ember. Deliberately not the rose used for errors — see below. */
  hex: string;
  tint: string;
  border: string;
}

/**
 * Ember (#B4470F) is orange-red. Rose (#BE123C, in the token file as `danger`) is
 * true red and is reserved for failure and destructive confirmation.
 *
 * Keeping them apart is the whole reason "a hot lead is going cold" can read as
 * urgent without reading as broken. A red banner says *you did something wrong*;
 * an ember rule says *someone is waiting*.
 */
export const ATTENTION: Record<AttentionState, AttentionToken> = {
  none: {
    id: "none",
    label: "",
    hex: "transparent",
    tint: "transparent",
    border: "transparent",
  },
  handoff_pending: {
    id: "handoff_pending",
    label: "Handoff",
    hex: "#B4470F",
    tint: "transparent",
    border: "#B4470F",
  },
  handoff_overdue: {
    id: "handoff_overdue",
    label: "Overdue",
    hex: "#B4470F",
    tint: "#FBEDE3",
    border: "#E8C4A6",
  },
};

/**
 * Derive attention from the lead. Never stored — an "overdue" flag written to a
 * record is stale the moment it is written, and the whole feature depends on the
 * number being true right now.
 *
 * `now` is injected so tests are not time-dependent.
 */
export function attentionFor(
  lead: Pick<Lead, "handoff">,
  thresholdMinutes: number,
  now: Date = new Date(),
): AttentionState {
  if (!lead.handoff) return "none";
  if (lead.handoff.acknowledgedAt !== null) return "none";
  return minutesSince(lead.handoff.requestedAt, now) >= thresholdMinutes
    ? "handoff_overdue"
    : "handoff_pending";
}

// ─────────────────────────────────────────────────────────────
// Listing source — the other place a tag carries meaning
// ─────────────────────────────────────────────────────────────

/**
 * Source is not decoration: a synced listing is overwritten on the next sync, a
 * manual one is not. Editing a synced listing loses your edit. So the two get a
 * different row treatment (a coloured leading spine on the row), not just a label
 * someone will skim past.
 */
export const SOURCE = {
  synced: {
    label: "Synced",
    hex: "#5B3FA8",
    tint: "#F0EBFA",
    border: "#D6C9F0",
    hint: "Pulled from the portal. Updates automatically — edits will be overwritten.",
  },
  manual: {
    label: "Manual",
    hex: "#6F6862",
    tint: "#F0ECE5",
    border: "#DCD5CB",
    hint: "Added by your team. Never touched by a sync.",
  },
} as const;

export const LISTING_STATUS_LABEL = {
  available: "Available",
  reserved: "Reserved",
  let: "Let",
  sold: "Sold",
  archived: "Archived",
} as const;
