"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { archiveListing, createListing, syncListings } from "@/lib/data";
import {
  Dialog,
  Field,
  PendingButton,
  Spinner,
  inputClass,
  textareaClass,
} from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";
import { formatRelative } from "@/lib/format";
import type { SyncStatus } from "@/lib/types";

/**
 * Sync now, plus the timestamps that make it trustworthy.
 *
 * Last *attempt* and last *success* are shown separately whenever they differ.
 * "Last synced 09:00" on a screen where the 14:20 run failed is the single most
 * misleading thing this page could say.
 */
export function SyncBar({
  status,
  attemptedAt,
  succeededAt,
  compact = false,
}: {
  status: SyncStatus;
  attemptedAt: string | null;
  succeededAt: string | null;
  imported?: number;
  failed?: number;
  message?: string | null;
  compact?: boolean;
}) {
  const [running, setRunning] = useState(false);
  const router = useRouter();
  const now = new Date();

  async function run() {
    if (running) return; // a second click while running is a no-op, not a second job
    setRunning(true);
    try {
      await syncListings();
      router.refresh();
    } finally {
      setRunning(false);
    }
  }

  const attemptDiffers =
    attemptedAt && succeededAt && attemptedAt !== succeededAt;

  return (
    <span className="inline-flex items-center gap-3">
      {!compact ? (
        <span className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-xs text-muted">
            {succeededAt
              ? `Synced ${formatRelative(succeededAt, now)} ago`
              : "Never synced"}
          </span>
          {attemptDiffers ? (
            <span className="text-2xs" style={{ color: "var(--color-ember)" }}>
              last attempt {formatRelative(attemptedAt, now)} ago
            </span>
          ) : null}
        </span>
      ) : null}

      <button
        type="button"
        onClick={run}
        disabled={running}
        aria-busy={running}
        className={buttonClass(status === "never" ? "primary" : "secondary")}
      >
        {running ? (
          <>
            <Spinner /> Syncing…
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sync now
          </>
        )}
      </button>
    </span>
  );
}

export function AddListingButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("primary")}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        Add listing
      </button>
      <AddListingDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function AddListingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoName(null);
      return;
    }
    // Client-side checks are a convenience, not a control — the same rules are
    // required server-side before this ever touches real storage. See SECURITY.md.
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, photo: "Use a JPG, PNG, or WebP image." }));
      setPhotoName(null);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((p) => ({ ...p, photo: "Photo must be under 5 MB." }));
      setPhotoName(null);
      e.target.value = "";
      return;
    }
    setErrors((p) => ({ ...p, photo: "" }));
    setPhotoName(file.name);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    const form = new FormData(e.currentTarget);
    const next: Record<string, string> = {};

    if (!String(form.get("title") ?? "").trim()) next.title = "Give the listing a title.";
    if (!String(form.get("area") ?? "").trim()) next.area = "Which community is it in?";
    if (!Number(form.get("price"))) next.price = "Enter a price in AED.";
    // Every listing needs at least one photo — the AI sends these directly in
    // WhatsApp, so a listing without one is a listing it can only describe.
    if (!photoName) next.photo = "Add at least one photo.";

    setErrors(next);
    if (Object.keys(next).filter((k) => next[k]).length > 0) return;

    setPending(true);
    try {
      await createListing(Object.fromEntries(form));
      onClose();
      setPhotoName(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add a listing"
      description="For properties that aren't on the portals yet. Manual listings are never overwritten by a sync."
      width={580}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Title" error={errors.title || null} required>
          <input name="title" className={inputClass} placeholder="2-bed with marina view, Sparkle Tower 2" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Community / area" error={errors.area || null} required>
            <input name="area" className={inputClass} placeholder="Dubai Marina" />
          </Field>
          <Field label="Full address">
            <input name="address" className={inputClass} placeholder="Sparkle Tower 2, Marina Walk" />
          </Field>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-4">
          <Field label="Price (AED)" error={errors.price || null} required>
            <input name="price" type="number" min="0" step="1000" className={inputClass} placeholder="2450000" />
          </Field>
          <Field label="Period">
            <select name="period" className={inputClass} defaultValue="sale">
              <option value="sale">Sale</option>
              <option value="yearly">Per year</option>
              <option value="monthly">Per month</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Bedrooms">
            <input name="beds" type="number" min="0" defaultValue={1} className={inputClass} />
          </Field>
          <Field label="Bathrooms">
            <input name="baths" type="number" min="0" defaultValue={1} className={inputClass} />
          </Field>
          <Field label="Size (sqft)">
            <input name="sizeSqft" type="number" min="0" className={inputClass} placeholder="1310" />
          </Field>
        </div>

        <Field label="Description" hint="The AI uses this when a customer asks about the property.">
          <textarea name="description" rows={3} className={textareaClass} placeholder="High floor, upgraded kitchen, two parking bays, vacant on transfer." />
        </Field>

        <Field
          label="Photos"
          hint="JPG, PNG, or WebP, up to 5 MB. The AI sends these directly in WhatsApp."
          error={errors.photo || null}
          required
        >
          <div className="flex items-center gap-3">
            <label className={`${buttonClass("secondary", "sm")} cursor-pointer`}>
              Choose file
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPhoto}
                className="sr-only"
              />
            </label>
            <span className="text-xs text-muted truncate-1">
              {photoName ?? "No file chosen"}
            </span>
          </div>
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
              "Add listing"
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export function ListingRowActions({
  id,
  title,
  source,
}: {
  id: string;
  title: string;
  source: "synced" | "manual";
}) {
  return (
    <span className="inline-flex items-center gap-1 justify-end">
      <button
        type="button"
        className={buttonClass("ghost", "sm")}
        title={
          source === "synced"
            ? "Editing a synced listing is overwritten on the next sync"
            : "Edit this listing"
        }
      >
        Edit
      </button>
      <PendingButton
        tone="ghost"
        size="sm"
        onRun={() => archiveListing(id)}
        toast={`"${title}" archived. The AI won't offer it any more.`}
        confirm={`Archive "${title}"? The AI will stop offering it to customers.`}
        pendingLabel="…"
      >
        Archive
      </PendingButton>
    </span>
  );
}
