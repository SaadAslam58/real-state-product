"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addAgent, syncListings } from "@/lib/data";
import { Field, Spinner, inputClass } from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";

const STEPS = [
  { n: 1, title: "Connect WhatsApp", blurb: "Where your inquiries arrive." },
  { n: 2, title: "Bring in your listings", blurb: "What the AI can talk about." },
  { n: 3, title: "Add your team", blurb: "Who leads get handed to." },
] as const;

export function OnboardingFlow({ step }: { step: number }) {
  const router = useRouter();
  const go = (n: number) => router.push(`/onboarding?step=${n}`);

  return (
    <div>
      {/* Progress. Three dashes and "Step 2 of 3" — a percentage bar on a
          three-step form is theatre, and this needs to feel finite, not long. */}
      <div className="mb-7">
        <p className="t-eyebrow mb-2.5">Step {step} of 3</p>
        <div className="flex gap-1.5" role="presentation">
          {STEPS.map((s) => (
            <span
              key={s.n}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{
                background:
                  s.n < step
                    ? "var(--color-accent-bright)"
                    : s.n === step
                      ? "var(--color-accent-hover)"
                      : "var(--color-edge)",
              }}
            />
          ))}
        </div>
      </div>

      <h1 className="t-display text-3xl text-ink mb-1.5">{STEPS[step - 1]?.title}</h1>
      <p className="text-base text-muted mb-7 leading-relaxed">
        {STEPS[step - 1]?.blurb}
      </p>

      {step === 1 ? <StepWhatsApp onNext={() => go(2)} /> : null}
      {step === 2 ? <StepListings onNext={() => go(3)} onBack={() => go(1)} /> : null}
      {step === 3 ? <StepTeam onBack={() => go(2)} /> : null}
    </div>
  );
}

// ── Step 1 ──────────────────────────────────────────────────

function StepWhatsApp({ onNext }: { onNext: () => void }) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "verified">("idle");
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    if (!/^\+?\d[\d\s]{7,}$/.test(number)) {
      setError("Enter the number in international format, e.g. +971 4 388 9100.");
      return;
    }
    setError(null);
    setState("checking");
    await new Promise((r) => setTimeout(r, 1300));
    setState("verified");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-hairline bg-surface p-5">
        <Field
          label="WhatsApp Business number"
          hint="The number your customers already message."
          error={error}
          required
        >
          <input
            value={number}
            onChange={(e) => {
              setNumber(e.target.value);
              setState("idle");
            }}
            type="tel"
            placeholder="+971 4 388 9100"
            className={inputClass}
            autoFocus
          />
        </Field>

        <Field label="Business display name" hint="What customers see when the AI replies.">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Meridian Properties"
            className={inputClass}
          />
        </Field>

        {state === "verified" ? (
          <p
            className="flex items-center gap-2 text-sm font-semibold rounded-md px-3 py-2.5 border"
            style={{
              background: "var(--color-stage-ready-tint)",
              borderColor: "var(--color-stage-ready-border)",
              color: "var(--color-stage-ready)",
            }}
            role="status"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Connected and verified. The AI can now receive messages.
          </p>
        ) : (
          <button
            type="button"
            onClick={connect}
            disabled={state === "checking"}
            className={buttonClass("secondary")}
          >
            {state === "checking" ? (
              <>
                <Spinner /> Checking verification…
              </>
            ) : (
              "Connect and verify"
            )}
          </button>
        )}
      </div>

      <Nav
        next={
          <button
            type="button"
            onClick={onNext}
            disabled={state !== "verified"}
            className={buttonClass("primary")}
            title={state !== "verified" ? "Connect your number first" : undefined}
          >
            Continue
          </button>
        }
      />
    </div>
  );
}

// ── Step 2 ──────────────────────────────────────────────────

function StepListings({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [imported, setImported] = useState<number | null>(null);

  async function sync() {
    setSyncing(true);
    try {
      await syncListings();
      setImported(9);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-hairline bg-surface p-5">
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          Pull your live portfolio straight from Bayut and Property Finder. This runs
          again automatically, so it stays current on its own.
        </p>

        {imported === null ? (
          <button
            type="button"
            onClick={sync}
            disabled={syncing}
            className={buttonClass("primary")}
          >
            {syncing ? (
              <>
                <Spinner /> Importing your listings…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Import from the portals
              </>
            )}
          </button>
        ) : (
          <p
            className="flex items-center gap-2 text-sm font-semibold rounded-md px-3 py-2.5 border"
            style={{
              background: "var(--color-stage-ready-tint)",
              borderColor: "var(--color-stage-ready-border)",
              color: "var(--color-stage-ready)",
            }}
            role="status"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {imported} listings imported with their photos.
          </p>
        )}
      </div>

      <p className="text-sm text-muted text-center">
        Not on the portals yet?{" "}
        <Link href="/listings" className="text-accent-bright font-semibold hover:text-accent-hover">
          Add a property by hand
        </Link>{" "}
        — you can do this any time.
      </p>

      <Nav
        back={
          <button type="button" onClick={onBack} className={buttonClass("ghost")}>
            Back
          </button>
        }
        skip={
          <button
            type="button"
            onClick={onNext}
            className="text-xs font-semibold text-muted hover:text-ink underline underline-offset-2"
          >
            Skip for now
          </button>
        }
        next={
          <button type="button" onClick={onNext} className={buttonClass("primary")}>
            Continue
          </button>
        }
      />
    </div>
  );
}

// ── Step 3 ──────────────────────────────────────────────────

function StepTeam({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [rows, setRows] = useState([{ name: "", phone: "" }]);
  const [finishing, setFinishing] = useState(false);

  const filled = rows.filter((r) => r.name.trim() && r.phone.trim());

  async function finish() {
    setFinishing(true);
    try {
      for (const r of filled) await addAgent(r);
      router.push("/");
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-hairline bg-surface p-5 flex flex-col gap-3">
        <p className="text-sm text-ink-soft leading-relaxed">
          New leads are shared out round-robin across your agents, and handoff alerts
          go to their mobile. You can add more later.
        </p>

        {rows.map((row, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-3">
            <input
              value={row.name}
              onChange={(e) =>
                setRows((p) => p.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))
              }
              placeholder="Agent name"
              aria-label={`Agent ${i + 1} name`}
              className={inputClass}
            />
            <input
              value={row.phone}
              onChange={(e) =>
                setRows((p) => p.map((r, j) => (j === i ? { ...r, phone: e.target.value } : r)))
              }
              type="tel"
              placeholder="+971 55 220 8871"
              aria-label={`Agent ${i + 1} mobile`}
              className={inputClass}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => setRows((p) => [...p, { name: "", phone: "" }])}
          className="self-start text-xs font-semibold text-accent-bright hover:text-accent-hover"
        >
          + Add another
        </button>
      </div>

      <Nav
        back={
          <button type="button" onClick={onBack} className={buttonClass("ghost")}>
            Back
          </button>
        }
        skip={
          <Link
            href="/"
            className="text-xs font-semibold text-muted hover:text-ink underline underline-offset-2"
          >
            I&rsquo;ll do this later
          </Link>
        }
        next={
          <button
            type="button"
            onClick={finish}
            disabled={finishing}
            className={buttonClass("primary")}
          >
            {finishing ? (
              <>
                <Spinner /> Finishing…
              </>
            ) : (
              `Finish setup${filled.length ? ` · ${filled.length} added` : ""}`
            )}
          </button>
        }
      />
    </div>
  );
}

function Nav({
  back,
  skip,
  next,
}: {
  back?: React.ReactNode;
  skip?: React.ReactNode;
  next: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {back}
      <span className="ml-auto flex items-center gap-4">
        {skip}
        {next}
      </span>
    </div>
  );
}
