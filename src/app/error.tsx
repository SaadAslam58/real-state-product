"use client";

import { useEffect } from "react";
import { buttonClass } from "@/components/ui/Primitives";

/**
 * Route-level error boundary. Without one, a render error anywhere takes the
 * whole app to a white screen — the worst possible failure for a tool someone
 * checks between showings.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The seam where Sentry (or whatever) goes. A no-op today, but having the
    // call site already written is the difference between adding reporting in
    // five minutes and hunting down every boundary later.
    console.error("[gehox] route error", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] grid place-items-center px-6">
      <div className="text-center max-w-[44ch]">
        <span
          className="inline-grid place-items-center w-11 h-11 rounded-full mb-4"
          style={{ background: "var(--color-danger-tint)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 8v5m0 3.5v.01M10.3 3.9 2.4 17.5A1.9 1.9 0 0 0 4 20.4h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z"
              stroke="var(--color-danger)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="t-display text-lg text-ink mb-2">Something broke on this screen</h1>
        <p className="text-sm text-muted leading-relaxed mb-5">
          The rest of Gehox is still working. Try loading this screen again — if it
          keeps happening, send us the time it occurred and we&rsquo;ll find it in the logs.
        </p>
        <button type="button" onClick={reset} className={buttonClass("primary")}>
          Try again
        </button>
      </div>
    </div>
  );
}
