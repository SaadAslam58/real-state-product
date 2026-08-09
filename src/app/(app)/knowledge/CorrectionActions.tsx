"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { approveCorrection, dismissCorrection } from "@/lib/data";
import { Dialog, PendingButton, Spinner } from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";

/**
 * Approve / dismiss.
 *
 * Approving is a confirmation step rather than a single click, and the dialog
 * shows the verbatim text that will enter the AI's reference. This is the one
 * place in the product where a person changes how the machine talks to every
 * future customer, and a one-click approve makes that feel smaller than it is.
 */
export function CorrectionActions({
  id,
  correctAnswer,
  canApprove,
  variant = "pending",
}: {
  id: string;
  correctAnswer: string;
  canApprove: boolean;
  variant?: "pending" | "approved";
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (variant === "approved") {
    if (!canApprove) return null;
    return (
      <PendingButton
        tone="ghost"
        size="sm"
        onRun={() => dismissCorrection(id)}
        confirm="Remove this from the AI's reference? It will stop following this rule."
        pendingLabel="…"
      >
        Remove
      </PendingButton>
    );
  }

  if (!canApprove) {
    return (
      <div className="px-4 py-3 border-t border-hairline bg-sunk">
        <p className="text-xs text-muted">
          Waiting on the agency owner to review this.
        </p>
      </div>
    );
  }

  async function approve() {
    setPending(true);
    try {
      await approveCorrection(id);
      setConfirmOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-hairline bg-sunk">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className={buttonClass("primary", "sm")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Approve
        </button>
        <PendingButton
          tone="ghost"
          size="sm"
          onRun={() => dismissCorrection(id)}
          pendingLabel="Dismissing…"
        >
          Dismiss
        </PendingButton>
        <p className="text-xs text-muted ml-auto hidden sm:block">
          Approving applies this to every future conversation.
        </p>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Add this to the AI's knowledge?"
        description="From now on the AI will follow this in every conversation, with every customer."
        width={520}
      >
        <p
          className="text-sm leading-relaxed rounded-md border px-3.5 py-3"
          style={{
            background: "var(--color-stage-ready-tint)",
            borderColor: "var(--color-stage-ready-border)",
            color: "#14612f",
          }}
        >
          {correctAnswer}
        </p>

        <p className="text-xs text-muted mt-3 leading-relaxed">
          You can edit or remove this later from the approved list. Your name and the
          time are recorded against it.
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className={buttonClass("ghost")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={approve}
            disabled={pending}
            aria-busy={pending}
            className={buttonClass("primary")}
          >
            {pending ? (
              <>
                <Spinner /> Approving…
              </>
            ) : (
              "Approve correction"
            )}
          </button>
        </div>
      </Dialog>
    </>
  );
}
