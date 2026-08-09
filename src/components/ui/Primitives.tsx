import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Server-safe primitives. Nothing here holds state, so these render on the server
 * and ship no JavaScript. Interactive pieces live in `components/ui/Interactive.tsx`
 * behind `'use client'`.
 */

// ─────────────────────────────────────────────────────────────
// Surfaces
// ─────────────────────────────────────────────────────────────

export function Card({
  children,
  className = "",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <As
      className={`bg-surface border border-hairline rounded-lg ${className}`}
    >
      {children}
    </As>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <div>
        {eyebrow ? <p className="t-eyebrow mb-1.5">{eyebrow}</p> : null}
        <h2 className="t-display text-lg text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Text
// ─────────────────────────────────────────────────────────────

/**
 * Every piece of customer-authored text goes through here.
 *
 * Two reasons, both load-bearing:
 *   - `dir="auto"` so an Arabic message renders right-to-left. Dubai buyers write
 *     in Arabic constantly, and LTR-rendered Arabic looks broken.
 *   - it is the single place that would ever be tempted to render HTML, so
 *     keeping it as a text node here means the XSS question is answered once.
 */
export function UserText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <span dir="auto" className={className}>
      {children}
    </span>
  );
}

export function Mono({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`t-mono text-muted ${className}`}>{children}</span>;
}

// ─────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────

const AVATAR_TINTS = [
  "#EDE4F8",
  "#E4F1EF",
  "#F8EEDD",
  "#E5F2E8",
  "#F0ECE5",
] as const;

export function Avatar({
  name,
  size = 28,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const letters =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  // Stable per name, so the same person is the same colour on every screen.
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const tint = AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 font-semibold text-ink-soft ${className}`}
      style={{
        width: size,
        height: size,
        background: tint,
        fontSize: size * 0.36,
        letterSpacing: "0.01em",
      }}
      aria-hidden="true"
    >
      {letters}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Buttons (link + static). The pending/mutating variant is in Interactive.tsx.
// ─────────────────────────────────────────────────────────────

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export function buttonClass(
  tone: ButtonTone = "secondary",
  size: ButtonSize = "md",
): string {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-[box-shadow,background-color,border-color,transform] duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  const sizing =
    size === "sm" ? "text-xs px-2.5 h-8" : "text-base px-4 h-10";

  const tones: Record<ButtonTone, string> = {
    primary: "btn-primary",
    secondary:
      "bg-surface text-ink border border-edge hover:bg-sunk hover:border-[#c9bfb0]",
    ghost: "text-ink-soft hover:bg-sunk",
    danger:
      "bg-surface text-danger border border-danger-border hover:bg-danger-tint",
  };

  return `${base} ${sizing} ${tones[tone]}`;
}

export function ButtonLink({
  href,
  tone = "secondary",
  size = "md",
  children,
  className = "",
}: {
  href: string;
  tone?: ButtonTone;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonClass(tone, size)} ${className}`}>
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty states
//
// Four variants, because conflating "you have no leads yet" with "no leads match
// this filter" is the classic dashboard mistake — the first needs an onboarding
// CTA, the second needs a clear-filters link, and showing the wrong one makes the
// product look broken.
// ─────────────────────────────────────────────────────────────

export function EmptyState({
  variant = "no-data",
  title,
  body,
  action,
  icon,
}: {
  variant?: "no-data" | "no-match" | "not-authorized" | "error";
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  const accent =
    variant === "error"
      ? "text-danger"
      : variant === "no-data"
        ? "text-accent-bright"
        : "text-muted";

  return (
    <div className="flex flex-col items-center text-center px-6 py-14">
      {icon ? <div className={`mb-4 ${accent}`}>{icon}</div> : null}
      <p className="t-display text-md text-ink mb-1.5">{title}</p>
      {body ? (
        <p className="text-sm text-muted max-w-[42ch] leading-relaxed">{body}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="p-4 flex flex-col gap-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-24 hidden sm:block" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-10" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Error surface — inline retry, never a full-page takeover. A failed panel
// should not cost you the rest of the screen.
// ─────────────────────────────────────────────────────────────

export function ErrorSurface({
  title = "Couldn't load this",
  body,
  retryHref,
}: {
  title?: string;
  body?: string;
  retryHref?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      <span
        className="w-9 h-9 rounded-full grid place-items-center mb-3.5"
        style={{ background: "var(--color-danger-tint)" }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 8v5m0 3.5v.01M10.3 3.9 2.4 17.5A1.9 1.9 0 0 0 4 20.4h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z"
            stroke="var(--color-danger)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="t-display text-md text-ink mb-1">{title}</p>
      {body ? <p className="text-sm text-muted max-w-[44ch]">{body}</p> : null}
      {retryHref ? (
        <ButtonLink href={retryHref} size="sm" className="mt-4">
          Try again
        </ButtonLink>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Table chrome
//
// Deliberately NOT a generic <DataTable columns={...}> — a column config carrying
// cell render functions cannot cross the server/client boundary, and the row
// markup genuinely differs per screen (a listing row has a photo and a source
// spine; a lead row has a stage badge and an attention rule). So the shared piece
// is the chrome, and each screen owns its own <tr>. The chrome is where the
// duplication actually was.
// ─────────────────────────────────────────────────────────────

export function TableShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-hairline rounded-lg overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

/** Desktop table. Hidden below `md`, where the card list takes over. */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className = "",
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      scope="col"
      className={`t-eyebrow text-left px-4 py-2.5 bg-sunk border-b border-hairline ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : ""
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <td
      className={`px-4 py-3 align-middle text-ink-soft ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

/** Card list for `< md`. Tables that scroll sideways on a phone are the single
 *  most common responsive-dashboard failure, and the owner reads this between
 *  showings — so below md the table becomes stacked cards instead. */
export function CardList({ children }: { children: ReactNode }) {
  return <ul className="md:hidden divide-y divide-hairline">{children}</ul>;
}

export function Pagination({
  page,
  pageSize,
  total,
  hrefFor,
}: {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      className="flex items-center justify-between gap-3 px-4 py-3 border-t border-hairline"
      aria-label="Pagination"
    >
      <p className="text-xs text-muted">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <ButtonLink href={hrefFor(page - 1)} size="sm">
            Previous
          </ButtonLink>
        ) : null}
        {page < pages ? (
          <ButtonLink href={hrefFor(page + 1)} size="sm">
            Next
          </ButtonLink>
        ) : null}
      </div>
    </nav>
  );
}
