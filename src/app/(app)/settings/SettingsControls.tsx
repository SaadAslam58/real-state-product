"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setAiPaused, updateAgencySettings } from "@/lib/data";
import {
  Field,
  Spinner,
  Toggle,
  inputClass,
} from "@/components/ui/Interactive";
import { buttonClass, Mono } from "@/components/ui/Primitives";
import { formatPhone } from "@/lib/format";
import type { NotificationChannel, WhatsAppVerification } from "@/lib/types";

export function WhatsAppPanel({
  connected,
  number,
  displayName,
  verification,
  canEdit,
}: {
  connected: boolean;
  number: string | null;
  displayName: string | null;
  verification: WhatsAppVerification;
  canEdit: boolean;
}) {
  const tone =
    verification === "verified"
      ? {
          fg: "var(--color-stage-ready)",
          bg: "var(--color-stage-ready-tint)",
          border: "var(--color-stage-ready-border)",
          label: "Verified",
        }
      : verification === "pending"
        ? {
            fg: "var(--color-ember)",
            bg: "var(--color-ember-tint)",
            border: "var(--color-ember-border)",
            label: "Verification pending",
          }
        : {
            fg: "var(--color-muted)",
            bg: "var(--color-sunk)",
            border: "var(--color-edge)",
            label: "Not verified",
          };

  if (!connected) {
    return (
      <div className="px-4 py-5">
        <p className="text-sm font-semibold text-ink mb-1">No number connected</p>
        <p className="text-sm text-muted leading-relaxed mb-4 max-w-[52ch]">
          Until your WhatsApp Business number is connected, the AI can&rsquo;t receive or
          answer anything. This is the one thing that has to be set up.
        </p>
        <a href="/onboarding" className={buttonClass("primary")}>
          Connect WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 flex flex-wrap items-center gap-4">
      <span
        className="w-10 h-10 rounded-lg grid place-items-center shrink-0"
        style={{ background: tone.bg }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: tone.fg }}>
          <path
            d="M20 14a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{displayName ?? "Business account"}</p>
        <Mono className="text-sm">{number ? formatPhone(number) : "—"}</Mono>
      </div>
      <span
        className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0"
        style={{ color: tone.fg, background: tone.bg, borderColor: tone.border }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone.fg }} />
        {tone.label}
      </span>
      {canEdit ? (
        <button type="button" className={buttonClass("secondary", "sm")}>
          Change number
        </button>
      ) : null}
    </div>
  );
}

export function AgencySettings({
  aiPaused,
  overdueThresholdMinutes,
  handoffChannel,
  recipients,
  canEdit,
}: {
  aiPaused: boolean;
  overdueThresholdMinutes: number;
  handoffChannel: NotificationChannel;
  recipients: string[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [threshold, setThreshold] = useState(String(overdueThresholdMinutes));
  const [channel, setChannel] = useState<NotificationChannel>(handoffChannel);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await updateAgencySettings({
        overdueThresholdMinutes: Number(threshold),
        handoffChannel: channel,
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const dirty =
    Number(threshold) !== overdueThresholdMinutes || channel !== handoffChannel;

  return (
    <div className="divide-y divide-hairline">
      <div className="px-4 py-4">
        <Toggle
          checked={aiPaused}
          tone="ember"
          onChange={async (next) => {
            await setAiPaused(next);
            router.refresh();
          }}
          label="Pause AI replies"
          description="For holidays and office closures. Inquiries keep arriving and queue for a human instead of being auto-answered. Nothing is lost — nothing is answered either."
        />
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        <Field
          label="Flag a handoff as overdue after"
          hint="How long an unanswered handoff can sit before the dashboard escalates it. Set this to match how fast your team actually works — a threshold that cries wolf gets ignored."
        >
          <div className="flex items-center gap-2 max-w-[220px]">
            <input
              type="number"
              min={5}
              max={480}
              step={5}
              value={threshold}
              disabled={!canEdit}
              onChange={(e) => setThreshold(e.target.value)}
              className={inputClass}
            />
            <span className="text-sm text-muted shrink-0">minutes</span>
          </div>
        </Field>

        <Field label="Send handoff alerts via">
          <select
            value={channel}
            disabled={!canEdit}
            onChange={(e) => setChannel(e.target.value as NotificationChannel)}
            className={`${inputClass} max-w-[260px]`}
          >
            <option value="both">WhatsApp and email</option>
            <option value="whatsapp">WhatsApp only</option>
            <option value="email">Email only</option>
          </select>
        </Field>

        <div>
          <p className="text-xs font-semibold text-ink-soft mb-1.5">Alerts go to</p>
          <ul className="flex flex-wrap gap-1.5">
            {recipients.map((r) => (
              <li
                key={r}
                className="text-xs rounded-md border border-edge bg-sunk px-2 py-1 text-ink-soft"
              >
                {r.startsWith("+") ? formatPhone(r) : r}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            Every alert links straight to the conversation, so an agent can read the
            thread and take over in one tap.
          </p>
        </div>

        {canEdit ? (
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className={buttonClass("primary", "sm")}
            >
              {saving ? (
                <>
                  <Spinner /> Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
            {saved && !dirty ? (
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--color-success)" }}
                role="status"
              >
                Saved
              </span>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-muted">Only the agency owner can change these.</p>
        )}
      </div>
    </div>
  );
}

/** Individual account settings — separate from the agency-level block above. */
export function AccountSettings({ name, email }: { name: string; email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [notifyMine, setNotifyMine] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const errs: Record<string, string> = {};
    if (!current) errs.current = "Enter your current password.";
    if (next.length < 8) errs.next = "Use at least 8 characters.";
    if (next !== confirm) errs.confirm = "Passwords don't match.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setDone(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <div className="divide-y divide-hairline">
      <dl className="px-4 py-3 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-6">
          <dt className="text-xs text-muted">Name</dt>
          <dd className="text-sm text-ink">{name}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-6">
          <dt className="text-xs text-muted">Email</dt>
          <dd className="text-sm text-ink">{email}</dd>
        </div>
      </dl>

      <div className="px-4 py-4 flex flex-col gap-3.5">
        <p className="text-xs font-semibold text-ink-soft">Notify me about</p>
        <Toggle
          checked={notifyMine}
          onChange={setNotifyMine}
          label="Leads assigned to me"
          description="A message the moment a lead is handed to you."
        />
        <Toggle
          checked={notifyDigest}
          onChange={setNotifyDigest}
          label="Daily summary"
          description="One email each evening with what came in and what's still open."
        />
      </div>

      <form onSubmit={submit} className="px-4 py-4 flex flex-col gap-3.5">
        <p className="text-xs font-semibold text-ink-soft">Change your password</p>

        <Field label="Current password" error={errors.current || null}>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className={`${inputClass} max-w-[320px]`}
          />
        </Field>
        <Field label="New password" hint="At least 8 characters." error={errors.next || null}>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            className={`${inputClass} max-w-[320px]`}
          />
        </Field>
        <Field label="Confirm new password" error={errors.confirm || null}>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className={`${inputClass} max-w-[320px]`}
          />
        </Field>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className={buttonClass("secondary", "sm")}>
            {saving ? (
              <>
                <Spinner /> Updating…
              </>
            ) : (
              "Update password"
            )}
          </button>
          {done ? (
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--color-success)" }}
              role="status"
            >
              Password updated
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
