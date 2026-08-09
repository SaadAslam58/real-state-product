"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Spinner, inputClass } from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    const next: typeof errors = {};
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (password !== confirm) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    await new Promise((r) => setTimeout(r, 700));
    setPending(false);
    setDone(true);
    setTimeout(() => router.push("/login"), 1400);
  }

  if (done) {
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
          Password updated
        </p>
        <p className="text-sm" style={{ color: "#14612f" }}>
          Taking you to sign in…{" "}
          <Link href="/login" className="underline underline-offset-2 font-semibold">
            Go now
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="New password" hint="At least 8 characters." error={errors.password ?? null} required>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          autoFocus
          aria-invalid={Boolean(errors.password)}
          className={inputClass}
        />
      </Field>
      <Field label="Confirm password" error={errors.confirm ?? null} required>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirm)}
          className={inputClass}
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
            <Spinner /> Updating…
          </>
        ) : (
          "Update password"
        )}
      </button>
    </form>
  );
}
