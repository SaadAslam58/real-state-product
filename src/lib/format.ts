/**
 * Formatting helpers. Every screen that shows money, a phone number, or a time
 * goes through here — the listings table and the extraction panel must not
 * disagree about how AED 1,250,000 is written.
 *
 * All of these are pure and take an explicit `now` where time is involved, so
 * tests do not go red at midnight.
 */

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

const AED_COMPACT = new Intl.NumberFormat("en-AE", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** "AED 1,250,000" — full precision, for detail views and forms. */
export function formatAED(amount: number): string {
  return AED.format(amount);
}

/**
 * "AED 1.3M" — for table cells and KPI tiles, where the exact dirham never
 * matters and the column width does.
 */
export function formatAEDCompact(amount: number): string {
  return `AED ${AED_COMPACT.format(amount)}`;
}

/** "AED 95K/yr", "AED 8K/mo", "AED 1.3M" — price with its period, compactly. */
export function formatPrice(
  amount: number,
  period: "sale" | "yearly" | "monthly",
): string {
  const base = formatAEDCompact(amount);
  if (period === "yearly") return `${base}/yr`;
  if (period === "monthly") return `${base}/mo`;
  return base;
}

/**
 * "+971 50 123 4567". Input is E.164. Anything that does not look like a UAE
 * number is returned with light spacing rather than mangled into a wrong shape —
 * Dubai buyers call from everywhere.
 */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/[^\d+]/g, "");
  const uae = /^\+971(\d{2})(\d{3})(\d{4})$/.exec(digits);
  if (uae) return `+971 ${uae[1]} ${uae[2]} ${uae[3]}`;
  return digits.replace(/^(\+\d{1,3})(\d{3})(\d+)$/, "$1 $2 $3");
}

/**
 * Last four digits only, for anywhere a number might be logged or shown at a
 * glance without exposing the full contact. Phone numbers are personal data.
 */
export function maskPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  return `••• ${digits.slice(-4)}`;
}

/**
 * "just now" · "4m" · "2h" · "3d" · "12 Mar".
 * Deliberately terse — this goes in table cells where the column is narrow and
 * the reader is scanning for the outlier, not reading each row.
 */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const mins = Math.floor((now.getTime() - then) / 60_000);

  // Clock skew between server and client can produce a small negative. Showing
  // "in 2 minutes" for a message that already arrived reads as a bug, so clamp.
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/**
 * "1h 12m" — the aging clock on an overdue handoff. Unlike `formatRelative` this
 * one stays precise, because the whole point is watching a number get worse.
 */
export function formatElapsed(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const totalMins = Math.max(0, Math.floor((now.getTime() - then) / 60_000));
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  if (hours === 0) return `${mins}m`;
  if (hours < 24) return `${hours}h ${mins}m`;

  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

/** Whole minutes between an ISO timestamp and now. Never negative. */
export function minutesSince(iso: string, now: Date = new Date()): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((now.getTime() - then) / 60_000));
}

/** "14:32" — wall-clock time for message bubbles, 24h as used in the UAE. */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** "Today" · "Yesterday" · "Mon 12 Mar" — the date separator inside a thread. */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOf(now) - startOf(d)) / 86_400_000);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** "SA" from "Sara Al Mansouri" — avatar fallback. Max two letters. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + second).toUpperCase();
}

/** "3 beds · 2 baths · 1,240 sqft" */
export function formatSpec(beds: number, baths: number, sqft: number): string {
  const bedLabel = beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
  const bathLabel = `${baths} bath${baths === 1 ? "" : "s"}`;
  return `${bedLabel} · ${bathLabel} · ${sqft.toLocaleString("en-GB")} sqft`;
}

/**
 * "AED 900K – 1.2M" · "up to AED 1.2M" · "from AED 900K" · null when the AI has
 * not established a budget yet. Callers render null as "not yet established".
 */
export function formatBudgetRange(
  min: number | null,
  max: number | null,
): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) {
    return `${formatAEDCompact(min)} – ${AED_COMPACT.format(max)}`;
  }
  if (max !== null) return `up to ${formatAEDCompact(max)}`;
  return `from ${formatAEDCompact(min as number)}`;
}
