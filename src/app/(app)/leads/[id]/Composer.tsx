"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addNote, sendMessage, takeOver } from "@/lib/data";
import { Spinner } from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { formatRelative } from "@/lib/format";
import type { Agent, LeadNote } from "@/lib/types";

/**
 * The composer.
 *
 * "Take over" without somewhere to type is a dead end — it stops the AI and
 * leaves the agent with nothing to do but go and find the customer in WhatsApp
 * themselves, which defeats the point of the dashboard existing.
 *
 * Two modes, because they are genuinely different actions:
 *
 *   Reply     goes to the customer over WhatsApp. Only available while the
 *             agent holds the thread — if the AI is still handling it, the
 *             composer offers to take over first rather than letting a human
 *             and a machine talk over each other.
 *   Note      never leaves the dashboard. "Third time asking, time-waster" is
 *             exactly what agents need to record and exactly what must never
 *             reach the customer. Visually distinct so the two can't be
 *             confused at a glance.
 */
export function Composer({
  leadId,
  aiPaused,
  notes,
  agents,
  customerPhone,
}: {
  leadId: string;
  aiPaused: boolean;
  notes: LeadNote[];
  agents: Record<string, Agent>;
  customerPhone: string;
}) {
  const router = useRouter();
  const notify = useToast();
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const now = new Date();

  const holdsThread = aiPaused;

  async function claimThread() {
    setPending(true);
    try {
      await takeOver(leadId);
      notify("You've taken over. The AI won't reply on this thread.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || pending) return;

    setPending(true);
    try {
      if (mode === "note") {
        await addNote(leadId, text);
        notify("Note saved. Only your team can see it.");
      } else {
        await sendMessage(leadId, text);
        notify("Sent on WhatsApp.");
      }
      setBody("");
      router.refresh();
    } catch {
      notify("That didn't send. Try again.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 bg-surface border border-hairline rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 px-3 pt-3">
        <Tab active={mode === "reply"} onClick={() => setMode("reply")}>
          Reply to customer
        </Tab>
        <Tab active={mode === "note"} onClick={() => setMode("note")}>
          Internal note
        </Tab>

        <a
          href={`https://wa.me/${customerPhone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink px-2 py-1.5 rounded"
          title="Open this conversation in WhatsApp"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 14a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          Open in WhatsApp
        </a>
      </div>

      {/* Reply mode while the AI still holds the thread: don't let a human and a
          machine answer the same customer at once. Offer the takeover instead. */}
      {mode === "reply" && !holdsThread ? (
        <div className="px-3 py-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted flex-1 min-w-[16ch] leading-relaxed">
            The AI is handling this conversation. Take over to reply yourself — it
            will stop answering until you hand it back.
          </p>
          <button
            type="button"
            onClick={claimThread}
            disabled={pending}
            className={buttonClass("primary", "sm")}
          >
            {pending ? (
              <>
                <Spinner /> Taking over…
              </>
            ) : (
              "Take over and reply"
            )}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="px-3 pb-3 pt-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter is a newline — the WhatsApp muscle memory
              // every agent already has.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
              }
            }}
            rows={3}
            maxLength={2000}
            aria-label={mode === "note" ? "Internal note" : "Reply to customer"}
            placeholder={
              mode === "note"
                ? "Something your team should know. The customer never sees this."
                : "Type your reply. Enter to send, Shift+Enter for a new line."
            }
            className="w-full px-3 py-2.5 text-base rounded-md border resize-y leading-relaxed focus:border-accent-bright"
            style={
              mode === "note"
                ? {
                    background: "var(--color-stage-qualifying-tint)",
                    borderColor: "var(--color-stage-qualifying-border)",
                  }
                : {
                    background: "var(--color-surface)",
                    borderColor: "var(--color-edge)",
                  }
            }
          />
          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-muted">
              {mode === "note"
                ? "Visible to your team only."
                : "Sends to the customer on WhatsApp."}
            </p>
            <button
              type="submit"
              disabled={pending || !body.trim()}
              className={`${buttonClass(mode === "note" ? "secondary" : "primary", "sm")} ml-auto`}
            >
              {pending ? (
                <>
                  <Spinner /> {mode === "note" ? "Saving…" : "Sending…"}
                </>
              ) : mode === "note" ? (
                "Save note"
              ) : (
                "Send"
              )}
            </button>
          </div>
        </form>
      )}

      {notes.length > 0 ? (
        <div
          className="border-t px-3 py-3"
          style={{ borderColor: "var(--color-hairline)", background: "var(--color-sunk)" }}
        >
          <p className="t-eyebrow mb-2">Internal notes · not visible to the customer</p>
          <ul className="flex flex-col gap-2">
            {notes.map((n) => (
              <li key={n.id} className="flex gap-2.5">
                <span
                  className="w-1 rounded-full shrink-0"
                  style={{ background: "var(--color-stage-qualifying)" }}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block text-sm text-ink leading-snug">{n.body}</span>
                  <span className="block text-xs text-muted mt-0.5">
                    {agents[n.agentId]?.name ?? "Someone"} ·{" "}
                    {formatRelative(n.at, now)} ago
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs font-semibold px-2.5 h-8 rounded-md transition-colors ${
        active ? "bg-accent-wash text-accent-bright" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
