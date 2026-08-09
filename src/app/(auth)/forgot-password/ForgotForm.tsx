"use client";

import { useState } from "react";
import { Field, Spinner, inputClass } from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setPending(true);
    await new Promise((r) => setTimeout(r, 700));
    setPending(false);
    setSent(true);
  }

  // Deliberately does not reveal whether the address exists. Saying "no account
  // with that email" hands an attacker a list of who works at the agency.
  if (sent) {
    return (
      <div
        className="rounded-lg border px-4 py-4"
        style={{
          background: "var(--color-stage-ready-tint)",
          borderColor: "var(--color-stage-ready-border)",
        }}
        role="status"
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-stage-ready)" }}>
          Check your inbox
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#14612f" }}>
          If an account exists for <span className="font-semibold">{email}</span>,
          a reset link is on its way. It expires in 30 minutes.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-xs font-semibold underline underline-offset-2 mt-3"
          style={{ color: "#14612f" }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Work email" error={error} required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          aria-invalid={Boolean(error)}
          className={inputClass}
          placeholder="you@agency.ae"
        />
      </Field>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`${buttonClass("primary")} w-full`}
      >
        {pending ? (
          <>
            <Spinner /> Sending…
          </>
        ) : (
          "Send reset link"
        )}
      </button>
    </form>
  );
}
