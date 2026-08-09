"use client";

import { createContext, useCallback, useContext, useState } from "react";

/**
 * Toasts.
 *
 * Every mutation in this product used to resolve silently and re-render. From
 * the owner's chair that reads as "did that work?" — especially for the ones
 * that matter, like approving a correction that changes how the AI answers
 * every future customer.
 *
 * Deliberately plain: bottom-left on desktop so it never covers the primary
 * action, above the tab bar on mobile, auto-dismiss at 4s, one line of text.
 * A toast is a receipt, not an announcement.
 */

type Tone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: Tone;
  message: string;
}

const ToastCtx = createContext<(message: string, tone?: Tone) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

let seq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Tone = "success") => {
    const id = ++seq;
    setToasts((t) => [...t, { id, tone, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        className="fixed z-[70] left-4 right-4 sm:right-auto bottom-[70px] md:bottom-5 flex flex-col gap-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium max-w-[380px]"
            style={{
              background: "var(--color-graphite)",
              borderColor: "var(--color-graphite-line)",
              color: "#F1EDE6",
              boxShadow: "var(--shadow-overlay)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                background:
                  t.tone === "error"
                    ? "var(--color-danger)"
                    : t.tone === "info"
                      ? "var(--color-accent-light)"
                      : "var(--color-stage-ready)",
              }}
            />
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
