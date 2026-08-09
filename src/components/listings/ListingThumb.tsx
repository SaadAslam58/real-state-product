import Image from "next/image";

/**
 * A listing photo, or a calm placeholder when there isn't one.
 *
 * `photos[0] ?? ""` used to be passed straight to next/image, which throws on
 * an empty src rather than degrading — so a listing with zero photos broke the
 * whole row instead of just looking incomplete. That case is not hypothetical:
 * a sync can return a listing before its photo finishes downloading, an Apify
 * actor can occasionally miss one, a manual entry could slip through without
 * one. Whatever the cause, the dashboard should never crash over a missing
 * image — it should say so.
 *
 * This also doubles as the visible warning: the brief requires every listing
 * to carry at least one photo because the AI sends it directly in WhatsApp.
 * A listing with none can't do that, so the placeholder is a signal to fix
 * the data, not just a fallback graphic.
 */
export function ListingThumb({
  photos,
  alt,
  sizes,
  className = "",
  rounded = "rounded-md",
}: {
  photos: string[];
  alt: string;
  sizes: string;
  className?: string;
  rounded?: string;
}) {
  const src = photos[0];

  if (!src) {
    return (
      <span
        className={`relative flex flex-col items-center justify-center gap-0.5 bg-sunk border border-dashed border-edge ${rounded} ${className}`}
        title="No photo — the AI can't show this property in WhatsApp until one is added"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"
            stroke="var(--color-muted)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="m4 21 5.5-6L14 19l3-3.5 3 2.5"
            stroke="var(--color-ember)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="t-eyebrow leading-none text-center px-1"
          style={{ fontSize: "0.5rem", color: "var(--color-ember)" }}
        >
          No photo
        </span>
      </span>
    );
  }

  return (
    <span className={`relative block overflow-hidden bg-sunk ${rounded} ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </span>
  );
}

/** True when a listing has nothing the AI could send in WhatsApp. */
export function hasNoPhoto(photos: string[]): boolean {
  return photos.length === 0;
}
