"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, type ReactNode } from "react";
import { buttonClass } from "./Primitives";

/**
 * Client islands. Everything that needs state, a handler, or the URL.
 *
 * Kept in one place so it is obvious how much of the app actually ships
 * JavaScript — right now it is the toolbar, a handful of buttons, and two
 * dialogs. Every table, badge, and thread renders on the server.
 */

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

/**
 * The double-submit fix, once, instead of a `useState` in every form.
 *
 * Disables itself while the action is in flight and shows a spinner, so a
 * double-click cannot fire two mutations and a slow action never looks dead.
 */
export function PendingButton({
  onRun,
  children,
  pendingLabel,
  tone = "secondary",
  size = "md",
  className = "",
  confirm,
  disabled,
}: {
  onRun: () => Promise<void>;
  children: ReactNode;
  pendingLabel?: string;
  tone?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  /** When set, the user must confirm before the action runs. */
  confirm?: string;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function run() {
    if (pending || disabled) return;
    if (confirm && !window.confirm(confirm)) return;
    setPending(true);
    try {
      await onRun();
      startTransition(() => router.refresh());
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending || disabled}
      aria-busy={pending}
      className={`${buttonClass(tone, size)} ${className}`}
    >
      {pending ? (
        <>
          <Spinner />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Spinner({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// URL-driven filtering
//
// Filters live in the URL, not in component state. Three reasons: the server
// component re-runs the query so filtering applies to the whole dataset rather
// than the current page; a filtered view is shareable and survives a refresh;
// and the back button behaves the way people expect.
// ─────────────────────────────────────────────────────────────

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return useCallback(
    (patch: Record<string, string | null>) => {
      const q = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "" || v === "all") q.delete(k);
        else q.set(k, v);
      }
      // Any filter change resets to page 1 — otherwise you land on page 3 of a
      // two-page result and see an empty table.
      if (!("page" in patch)) q.delete("page");
      router.push(`${pathname}${q.toString() ? `?${q}` : ""}`);
    },
    [router, pathname, params],
  );
}

export function SearchBox({
  placeholder,
  paramKey = "q",
}: {
  placeholder: string;
  paramKey?: string;
}) {
  const params = useSearchParams();
  const update = useQueryUpdater();
  const [value, setValue] = useState(params.get(paramKey) ?? "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        update({ [paramKey]: value });
      }}
      className="relative flex-1 min-w-[180px] max-w-sm"
    >
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
          <path d="m20 20-3.6-3.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => update({ [paramKey]: value })}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-9 pl-9 pr-3 text-sm bg-surface border border-edge rounded-md placeholder:text-muted focus:border-accent-bright"
      />
    </form>
  );
}

export function FilterSelect({
  paramKey,
  label,
  options,
}: {
  paramKey: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  const params = useSearchParams();
  const update = useQueryUpdater();
  const current = params.get(paramKey) ?? "all";
  const active = current !== "all";

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={current}
        onChange={(e) => update({ [paramKey]: e.target.value })}
        className={`appearance-none h-9 pl-3 pr-8 text-sm font-medium rounded-md border cursor-pointer transition-colors ${
          active
            ? "bg-accent-wash border-[#d8c8f0] text-accent-bright"
            : "bg-surface border-edge text-ink-soft hover:bg-sunk"
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="absolute right-2.5 pointer-events-none"
        style={{ color: active ? "var(--color-accent-bright)" : "var(--color-muted)" }}
      >
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

export function ClearFilters({ keys }: { keys: string[] }) {
  const params = useSearchParams();
  const update = useQueryUpdater();
  const anyActive = keys.some((k) => {
    const v = params.get(k);
    return v !== null && v !== "" && v !== "all";
  });
  if (!anyActive) return null;

  return (
    <button
      type="button"
      onClick={() => update(Object.fromEntries(keys.map((k) => [k, null])))}
      className="text-xs font-semibold text-accent-bright hover:text-accent-hover underline underline-offset-2"
    >
      Clear filters
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Toggle
// ─────────────────────────────────────────────────────────────

export function Toggle({
  checked,
  onChange,
  label,
  description,
  tone = "accent",
}: {
  checked: boolean;
  onChange: (next: boolean) => Promise<void> | void;
  label: string;
  description?: string;
  tone?: "accent" | "ember";
}) {
  const [on, setOn] = useState(checked);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !on;
    setOn(next);
    setPending(true);
    try {
      await onChange(next);
    } finally {
      setPending(false);
    }
  }

  const activeColor =
    tone === "ember" ? "var(--color-ember)" : "var(--color-accent-bright)";

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="text-base font-semibold text-ink">{label}</p>
        {description ? (
          <p className="text-sm text-muted mt-0.5 leading-relaxed">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={toggle}
        disabled={pending}
        className="relative shrink-0 w-[42px] h-[24px] rounded-full transition-colors duration-200 disabled:opacity-60"
        style={{ background: on ? activeColor : "var(--color-edge)" }}
      >
        <span
          className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-[left] duration-200"
          style={{ left: on ? 21 : 3, boxShadow: "0 1px 3px rgba(28,25,23,.28)" }}
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dialog
// ─────────────────────────────────────────────────────────────

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: number;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(28,25,23,0.42)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full bg-surface border border-hairline rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: width, boxShadow: "var(--shadow-overlay)" }}
      >
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-hairline">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="t-display text-md text-ink">{title}</h2>
              {description ? (
                <p className="text-sm text-muted mt-1 leading-relaxed">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 w-8 h-8 grid place-items-center rounded-md text-muted hover:bg-sunk hover:text-ink"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Form fields
// ─────────────────────────────────────────────────────────────

export function Field({
  label,
  hint,
  error,
  children,
  required,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink-soft mb-1.5">
        {label}
        {required ? <span className="text-ember ml-0.5">*</span> : null}
      </span>
      {children}
      {error ? (
        <span className="block text-xs text-danger mt-1.5">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-muted mt-1.5">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full h-10 px-3 text-base bg-surface border border-edge rounded-md placeholder:text-muted focus:border-accent-bright disabled:bg-sunk disabled:text-muted";

export const textareaClass =
  "w-full px-3 py-2.5 text-base bg-surface border border-edge rounded-md placeholder:text-muted focus:border-accent-bright resize-y leading-relaxed";

// ─────────────────────────────────────────────────────────────
// Pause banner
// ─────────────────────────────────────────────────────────────

/**
 * Shown app-wide when the AI is paused. Deliberately loud — an agency that
 * forgets it left this on stops answering leads entirely, which is the worst
 * possible failure for this product.
 */
export function PauseBanner() {
  return (
    <div
      className="flex items-center gap-2.5 px-4 sm:px-6 py-2.5 text-xs font-semibold"
      style={{
        background: "var(--color-ember-tint)",
        borderBottom: "1px solid var(--color-ember-border)",
        color: "#8a3a10",
      }}
      role="status"
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: "var(--color-ember)" }}
      />
      AI replies are paused. New inquiries are queuing for a human.
      <a href="/settings" className="underline underline-offset-2 ml-auto shrink-0">
        Settings
      </a>
    </div>
  );
}
