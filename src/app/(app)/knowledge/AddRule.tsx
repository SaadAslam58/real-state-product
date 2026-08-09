"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCorrection, updateCorrection } from "@/lib/data";
import {
  Dialog,
  Field,
  Spinner,
  textareaClass,
} from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";

/**
 * Write a rule directly.
 *
 * The flag-then-approve loop only teaches the AI things it has already got
 * wrong in front of a customer. An owner knows on day one that they don't
 * handle commercial, that Marina studios start at 55k, that nobody may offer to
 * hold a unit. Making them wait for the AI to embarrass them first is a
 * genuinely bad product.
 */
export function AddRuleButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("primary")}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        Add a rule
      </button>
      <RuleDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function RuleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const notify = useToast();
  const [rule, setRule] = useState("");
  const [why, setWhy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    if (rule.trim().length < 8) {
      setError("Write the rule as you'd want the AI to follow it.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await createCorrection({ correctAnswer: rule.trim(), note: why.trim() });
      notify("Rule added. The AI will follow it from the next message.");
      setRule("");
      setWhy("");
      onClose();
      router.refresh();
    } catch {
      notify("Couldn't save that rule. Try again.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Tell the AI something"
      description="Goes straight into its reference — no flagged conversation needed."
      width={540}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field
          label="The rule"
          hint="Write it the way you'd tell a new agent on their first day."
          error={error}
          required
        >
          <textarea
            value={rule}
            onChange={(e) => setRule(e.target.value)}
            rows={3}
            maxLength={1000}
            autoFocus
            className={textareaClass}
            placeholder="We are residential only — we don't handle commercial or office space."
          />
        </Field>

        <Field label="Why (optional)" hint="Context for whoever reads this list in six months.">
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            rows={2}
            maxLength={500}
            className={textareaClass}
            placeholder="We keep getting office enquiries from the Business Bay listings."
          />
        </Field>

        <p
          className="text-xs leading-relaxed rounded-md px-3 py-2.5 border"
          style={{
            background: "var(--color-accent-wash)",
            borderColor: "#ddd0f4",
            color: "var(--color-ink-soft)",
          }}
        >
          The AI treats this as reference, not as an instruction it can be talked out
          of. It applies to every conversation from the next message onward.
        </p>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={buttonClass("ghost")}>
            Cancel
          </button>
          <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass("primary")}>
            {pending ? (
              <>
                <Spinner /> Adding…
              </>
            ) : (
              "Add rule"
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

/**
 * Edit an approved rule in place. The brief asked for editable-or-removable and
 * only remove was built — but "Marina studios start at 55k" becomes 60k and
 * delete-and-retype loses who approved it and when.
 */
export function EditRuleButton({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const router = useRouter();
  const notify = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(current);
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pending || value.trim().length < 8) return;
    setPending(true);
    try {
      await updateCorrection(id, value.trim());
      notify("Rule updated.");
      setOpen(false);
      router.refresh();
    } catch {
      notify("Couldn't update that rule.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setValue(current);
          setOpen(true);
        }}
        className={buttonClass("ghost", "sm")}
      >
        Edit
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Edit this rule"
        description="The change applies to every conversation from the next message onward."
        width={520}
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <Field label="The rule" required>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              maxLength={1000}
              autoFocus
              className={textareaClass}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className={buttonClass("ghost")}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || value.trim() === current.trim()}
              className={buttonClass("primary")}
            >
              {pending ? (
                <>
                  <Spinner /> Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
