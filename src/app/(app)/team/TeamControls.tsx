"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addAgent, removeAgent } from "@/lib/data";
import {
  Dialog,
  Field,
  PendingButton,
  Spinner,
  inputClass,
} from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";

export function AddAgentButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("primary")}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        Add agent
      </button>
      <AddAgentDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function AddAgentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    const next: Record<string, string> = {};
    if (!name) next.name = "Enter the agent's name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    // Phone is the channel handoff alerts go to, so it is not optional.
    if (!/^\+?\d[\d\s]{7,}$/.test(phone))
      next.phone = "Enter a mobile number — this is where handoff alerts go.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      await addAgent({ name, email, phone });
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
      title="Add an agent"
      description="They'll join the round-robin for new leads straight away."
      width={480}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Full name" error={errors.name || null} required>
          <input name="name" className={inputClass} placeholder="Sara Haddad" autoFocus />
        </Field>
        <Field label="Email" error={errors.email || null} required>
          <input name="email" type="email" className={inputClass} placeholder="sara@agency.ae" />
        </Field>
        <Field
          label="Mobile"
          hint="Handoff alerts are sent here."
          error={errors.phone || null}
          required
        >
          <input name="phone" type="tel" className={inputClass} placeholder="+971 55 220 8871" />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={buttonClass("ghost")}>
            Cancel
          </button>
          <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass("primary")}>
            {pending ? (
              <>
                <Spinner /> Adding…
              </>
            ) : (
              "Add agent"
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export function RemoveAgentButton({
  id,
  name,
  assigned,
  lastActive,
}: {
  id: string;
  name: string;
  assigned: number;
  lastActive: boolean;
}) {
  // Removing the last active agent would leave round-robin with nowhere to send a
  // lead — every new inquiry would land unassigned and quietly go cold.
  if (lastActive) {
    return (
      <span
        className="text-xs text-muted"
        title="You need at least one active agent for leads to be assigned to."
      >
        Last active agent
      </span>
    );
  }

  return (
    <PendingButton
      tone="ghost"
      size="sm"
      onRun={() => removeAgent(id)}
      pendingLabel="Removing…"
      confirm={
        assigned > 0
          ? `Remove ${name}? Their ${assigned} assigned ${assigned === 1 ? "lead" : "leads"} will need reassigning.`
          : `Remove ${name} from the team?`
      }
    >
      Remove
    </PendingButton>
  );
}
