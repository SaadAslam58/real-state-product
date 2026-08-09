"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { flagConversation, resolveLead, resumeAI } from "@/lib/data";
import {
  Dialog,
  Field,
  PendingButton,
  Spinner,
  textareaClass,
} from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";
import type { Stage } from "@/lib/types";

/**
 * The controls under a conversation.
 *
 * Take over freezes the AI on this thread so it cannot reply over a human
 * mid-conversation. Resume hands it back. Resolve closes the lead and needs an
 * outcome, because "closed" without won-or-lost is the one thing a
 * commission-driven agency cannot use.
 */
export function ConversationActions({
  leadId,
  aiPaused,
  stage,
  canApprove,
  lastAiMessage,
}: {
  leadId: string;
  aiPaused: boolean;
  stage: Stage;
  canApprove: boolean;
  lastAiMessage: string;
}) {
  const router = useRouter();
  const [flagOpen, setFlagOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {/* Take over lives in the composer — it's only meaningful next to
            somewhere to type. Handing the thread back belongs here. */}
        {aiPaused ? (
          <PendingButton
            tone="secondary"
            onRun={() => resumeAI(leadId)}
            pendingLabel="Resuming…"
            toast="AI is handling this thread again."
          >
            <IconPlay />
            Resume AI handling
          </PendingButton>
        ) : null}

        {stage !== "closed" ? (
          <button
            type="button"
            onClick={() => setResolveOpen(true)}
            className={buttonClass("secondary")}
          >
            <IconCheck />
            Resolve
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setFlagOpen(true)}
          className={`${buttonClass("ghost")} ml-auto`}
        >
          <IconFlag />
          Flag for review
        </button>
      </div>

      <FlagDialog
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        leadId={leadId}
        lastAiMessage={lastAiMessage}
        canApprove={canApprove}
      />

      <ResolveDialog
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        leadId={leadId}
        onDone={() => router.refresh()}
      />
    </>
  );
}

/**
 * Flag for review.
 *
 * The AI's own words are pre-filled and read-only so the reviewer is correcting
 * something specific rather than writing a vague complaint. The correction itself
 * is what eventually reaches every future conversation, so the form says so out
 * loud — see the note at the bottom.
 */
function FlagDialog({
  open,
  onClose,
  leadId,
  lastAiMessage,
  canApprove,
}: {
  open: boolean;
  onClose: () => void;
  leadId: string;
  lastAiMessage: string;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [wrong, setWrong] = useState("");
  const [correct, setCorrect] = useState("");
  const [errors, setErrors] = useState<{ wrong?: string; correct?: string }>({});
  const [pending, setPending] = useState(false);

  const MAX = 1000;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    const next: typeof errors = {};
    if (wrong.trim().length < 5) next.wrong = "Tell us what the AI got wrong.";
    if (correct.trim().length < 5) next.correct = "Give the answer the AI should have used.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      await flagConversation({
        leadId,
        aiSaid: lastAiMessage,
        whatWasWrong: wrong.trim(),
        correctAnswer: correct.trim(),
      });
      setWrong("");
      setCorrect("");
      onClose();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Flag this reply for review"
      description="Corrections are reviewed before the AI uses them, so a mistake here can't quietly change how it answers everyone."
      width={560}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <span className="block text-xs font-semibold text-ink-soft mb-1.5">
            What the AI said
          </span>
          <p
            className="text-sm leading-relaxed rounded-md px-3 py-2.5 border"
            style={{
              background: "var(--color-accent-wash)",
              borderColor: "#ddd0f4",
              color: "var(--color-ink)",
            }}
          >
            {lastAiMessage || "No AI reply found in this conversation."}
          </p>
        </div>

        <Field label="What was wrong with it?" error={errors.wrong ?? null} required>
          <textarea
            value={wrong}
            maxLength={MAX}
            onChange={(e) => setWrong(e.target.value)}
            rows={3}
            className={textareaClass}
            placeholder="It offered a residential unit to someone asking about commercial office space."
          />
        </Field>

        <Field
          label="What should it have said?"
          hint="This becomes a rule the AI follows in every future conversation, once approved."
          error={errors.correct ?? null}
          required
        >
          <textarea
            value={correct}
            maxLength={MAX}
            onChange={(e) => setCorrect(e.target.value)}
            rows={3}
            className={textareaClass}
            placeholder="We are residential only — we don't handle commercial or office space."
          />
        </Field>

        <p className="text-xs text-muted leading-relaxed">
          {canApprove
            ? "You can approve this yourself from the Knowledge screen."
            : "The agency owner reviews and approves corrections before the AI uses them."}
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={buttonClass("ghost")}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className={buttonClass("primary")}
          >
            {pending ? (
              <>
                <Spinner /> Sending…
              </>
            ) : (
              "Send for review"
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

/**
 * Resolve. Won or lost, never just "closed" — the distinction is the only number
 * an owner actually wants at the end of a month.
 */
function ResolveDialog({
  open,
  onClose,
  leadId,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  leadId: string;
  onDone: () => void;
}) {
  const [pending, setPending] = useState<"won" | "lost" | null>(null);

  async function resolve(outcome: "won" | "lost") {
    if (pending) return;
    setPending(outcome);
    try {
      await resolveLead(leadId, outcome);
      onClose();
      onDone();
    } finally {
      setPending(null);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Resolve this lead"
      description="This closes the conversation and unpauses the AI. How did it end?"
      width={440}
    >
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => resolve("won")}
          disabled={pending !== null}
          className="flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:brightness-[0.98] disabled:opacity-60"
          style={{
            background: "var(--color-stage-ready-tint)",
            borderColor: "var(--color-stage-ready-border)",
          }}
        >
          <span
            className="text-sm font-bold flex items-center gap-1.5"
            style={{ color: "var(--color-stage-ready)" }}
          >
            {pending === "won" ? <Spinner /> : <IconCheck />} Won
          </span>
          <span className="text-xs text-muted">Deal closed or tenancy signed.</span>
        </button>

        <button
          type="button"
          onClick={() => resolve("lost")}
          disabled={pending !== null}
          className="flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:brightness-[0.98] disabled:opacity-60"
          style={{
            background: "var(--color-stage-closed-tint)",
            borderColor: "var(--color-stage-closed-border)",
          }}
        >
          <span
            className="text-sm font-bold flex items-center gap-1.5"
            style={{ color: "var(--color-stage-closed)" }}
          >
            {pending === "lost" ? <Spinner /> : <IconX />} Lost
          </span>
          <span className="text-xs text-muted">Went quiet, or bought elsewhere.</span>
        </button>
      </div>
    </Dialog>
  );
}

// ── Icons ──

function IconPlay() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4.5 19 12 7 19.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function IconFlag() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 21V4m0 0h10.5l-1.6 3.6L15.5 11H5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
