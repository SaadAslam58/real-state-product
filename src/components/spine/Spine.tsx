"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GehoxMark } from "@/components/brand/GehoxMark";
import { NavIcon } from "./Icons";
import { isActive, type NavItem } from "./nav";
import type { Role } from "@/lib/types";

/**
 * THE SPINE.
 *
 * A warm graphite rail rather than the default white sidebar, and the active item
 * is marked by a violet notch cut into the spine's inner edge — not a floating
 * pill. It is the same visual idea as the conversation rail on a lead thread,
 * which is what makes the two read as one system instead of two flourishes.
 *
 * Responsive ladder:
 *   ≥ xl   full rail with labels
 *   md–xl  icon-only rail, labels on hover via title
 *   < md   hidden; the bottom tab bar takes over
 */
export function Spine({
  items,
  overdueCount,
  pendingCorrections,
}: {
  /**
   * Already filtered by permission in the layout, server-side. An agent's
   * browser never receives the Team route at all — filtering here would ship
   * it to the client and merely hide it.
   */
  items: NavItem[];
  overdueCount: number;
  pendingCorrections: number;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="on-graphite hidden md:flex flex-col shrink-0 w-[68px] xl:w-[228px] transition-[width] duration-200"
      style={{ background: "var(--color-graphite)" }}
    >
      <div className="h-14 flex items-center px-4 xl:px-5 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-md"
          aria-label="Gehox — overview"
        >
          <GehoxMark size={26} tone="mono" />
          <span
            className="t-display hidden xl:inline text-[1.05rem]"
            style={{ color: "#F6F3EE", letterSpacing: "-0.04em" }}
          >
            gehox
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-2 flex flex-col gap-0.5 px-2" aria-label="Main">
        {items.map((item) => (
          <SpineLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            badge={
              item.href === "/leads"
                ? overdueCount
                : item.href === "/knowledge"
                  ? pendingCorrections
                  : 0
            }
            badgeTone={item.href === "/leads" ? "ember" : "accent"}
          />
        ))}
      </nav>

      <div
        className="px-3 py-3 shrink-0"
        style={{ borderTop: "1px solid var(--color-graphite-line)" }}
      >
        <p
          className="t-eyebrow hidden xl:block"
          style={{ color: "var(--color-graphite-dim)", fontSize: "0.625rem" }}
        >
          Meridian Properties
        </p>
      </div>
    </aside>
  );
}

function SpineLink({
  item,
  active,
  badge,
  badgeTone,
}: {
  item: NavItem;
  active: boolean;
  badge: number;
  badgeTone: "ember" | "accent";
}) {
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 h-10 px-3 rounded-md transition-colors ${
        active ? "spine-active" : "hover:bg-[var(--color-graphite-soft)]"
      }`}
      style={{ color: active ? "#F6F3EE" : "var(--color-graphite-text)" }}
    >
      <span className="shrink-0 grid place-items-center w-[18px]">
        <NavIcon name={item.icon} />
      </span>
      <span className="hidden xl:inline text-sm font-medium truncate">
        {item.label}
      </span>

      {badge > 0 ? (
        <span
          className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center text-2xs font-bold"
          style={{
            background:
              badgeTone === "ember" ? "var(--color-ember)" : "var(--color-accent-hover)",
            color: "#fff",
          }}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Mobile bottom bar. Primary destinations get a tab; the rest live behind More.
 * Targets are 56px tall so they clear the 44px minimum with room for a thumb.
 */
export function MobileTabBar({
  items,
  overdueCount,
  pendingCorrections,
}: {
  items: NavItem[];
  overdueCount: number;
  pendingCorrections: number;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = items.filter((i) => i.primary);
  const rest = items.filter((i) => !i.primary);

  return (
    <>
      {moreOpen ? (
        <div
          className="md:hidden fixed inset-0 z-40 bg-[rgba(28,25,23,0.4)]"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {moreOpen ? (
        <div
          className="md:hidden fixed left-0 right-0 bottom-[58px] z-50 bg-surface border-t border-hairline"
          style={{ boxShadow: "var(--shadow-overlay)" }}
        >
          {rest.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 px-5 h-14 text-ink border-b border-hairline last:border-0"
            >
              <NavIcon name={item.icon} size={19} />
              <span className="text-base font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      ) : null}

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: "var(--color-graphite)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        aria-label="Main"
      >
        {primary.map((item) => {
          const active = isActive(pathname, item.href);
          const badge =
            item.href === "/leads"
              ? overdueCount
              : item.href === "/knowledge"
                ? pendingCorrections
                : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex-1 h-[58px] flex flex-col items-center justify-center gap-1"
              style={{ color: active ? "#F6F3EE" : "var(--color-graphite-text)" }}
            >
              {/* The notch again — here it runs along the top edge. */}
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-4 right-4 h-[3px] rounded-b-[3px]"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--color-accent-hover), var(--color-accent-bright))",
                  }}
                />
              ) : null}
              <span className="relative">
                <NavIcon name={item.icon} size={19} />
                {badge > 0 ? (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full grid place-items-center text-[0.5625rem] font-bold"
                    style={{
                      background:
                        item.href === "/leads"
                          ? "var(--color-ember)"
                          : "var(--color-accent-hover)",
                      color: "#fff",
                    }}
                  >
                    {badge}
                  </span>
                ) : null}
              </span>
              <span className="text-[0.625rem] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {rest.length > 0 ? (
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className="flex-1 h-[58px] flex flex-col items-center justify-center gap-1"
            style={{ color: "var(--color-graphite-text)" }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="5" cy="12" r="1.6" fill="currentColor" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              <circle cx="19" cy="12" r="1.6" fill="currentColor" />
            </svg>
            <span className="text-[0.625rem] font-medium">More</span>
          </button>
        ) : null}
      </nav>
    </>
  );
}

/**
 * Role switcher. There is no auth in this build, so this is how the owner/agent
 * visibility split can actually be seen — the brief's requirement that agents
 * only see their own leads is otherwise invisible.
 *
 * It writes a cookie rather than a query param, for two reasons: the app layout
 * needs the role and layouts do not receive searchParams in the App Router, and a
 * cookie is what a real session would be anyway — so when auth lands, this
 * component is deleted and nothing else moves.
 */
export function RoleSwitcher({ role }: { role: Role }) {
  const router = useRouter();

  function set(next: Role) {
    document.cookie = `gehox_role=${next}; path=/; max-age=604800; samesite=lax`;
    router.refresh();
  }

  return (
    <div
      className="inline-flex items-center rounded-md border border-edge bg-surface p-0.5"
      role="group"
      aria-label="View as"
    >
      <span className="t-eyebrow px-2 hidden sm:inline" style={{ fontSize: "0.5625rem" }}>
        View as
      </span>
      {(["owner", "agent"] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => set(r)}
          aria-pressed={role === r}
          className={`text-xs font-semibold capitalize px-2.5 h-7 rounded-[4px] transition-colors ${
            role === r
              ? "bg-accent-wash text-accent-bright"
              : "text-muted hover:text-ink"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
