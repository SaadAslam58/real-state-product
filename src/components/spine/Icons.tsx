import type { NavItem } from "./nav";

/**
 * Nav icons. Hand-drawn rather than an icon package: six glyphs is not worth a
 * dependency, and drawing them means they share one stroke weight and one corner
 * radius, which is most of what makes an icon set look deliberate.
 *
 * 1.7 stroke on a 24 grid, round caps and joins.
 */
export function NavIcon({
  name,
  size = 18,
}: {
  name: NavItem["icon"];
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      // Not four equal squares — an asymmetric split, which is what the
      // overview actually is: one big urgent block and smaller counts.
      return (
        <svg {...common}>
          <path d="M4 4h7v6H4zM4 14h7v6H4zM14 4h6v10h-6zM14 18h6v2h-6z" />
        </svg>
      );
    case "leads":
      // A conversation, not a generic person.
      return (
        <svg {...common}>
          <path d="M20 14a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
          <path d="M8.5 9.5h7M8.5 12.5h4" />
        </svg>
      );
    case "listings":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );
    case "knowledge":
      // A book with a correction tick — the AI learning, not a lightbulb.
      return (
        <svg {...common}>
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v14H5.5A1.5 1.5 0 0 0 4 19.5Z" />
          <path d="M4 19.5A1.5 1.5 0 0 1 5.5 18H19v2.5H5.5A1.5 1.5 0 0 1 4 19.5Z" />
          <path d="M8.8 10.2l1.9 1.9 3.9-4" />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <circle cx="9" cy="8.5" r="3.2" />
          <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
          <path d="M16 6.2a3.2 3.2 0 0 1 0 5.6M17.5 15a5.5 5.5 0 0 1 3 4.5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" />
        </svg>
      );
  }
}
