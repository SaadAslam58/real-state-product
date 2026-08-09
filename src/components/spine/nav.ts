/**
 * One nav config, consumed by the desktop spine AND the mobile tab bar. Two
 * separate lists is how a screen ends up reachable on desktop and invisible on a
 * phone.
 *
 * `primary` drives the mobile bar: primary items get a tab, the rest live behind
 * "More". A bottom bar holds about five items before the targets get too small
 * to hit, and there are six destinations here.
 */
export interface NavItem {
  href: string;
  label: string;
  /** Shown on the mobile tab bar; the rest go into the More sheet. */
  primary: boolean;
  /** Owner-only destinations are hidden from agents entirely. */
  ownerOnly?: boolean;
  icon: "dashboard" | "leads" | "listings" | "knowledge" | "team" | "settings";
}

export const NAV: NavItem[] = [
  { href: "/", label: "Overview", primary: true, icon: "dashboard" },
  { href: "/leads", label: "Leads", primary: true, icon: "leads" },
  { href: "/listings", label: "Listings", primary: true, icon: "listings" },
  { href: "/knowledge", label: "Knowledge", primary: true, icon: "knowledge" },
  { href: "/team", label: "Team", primary: false, ownerOnly: true, icon: "team" },
  { href: "/settings", label: "Settings", primary: false, icon: "settings" },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
