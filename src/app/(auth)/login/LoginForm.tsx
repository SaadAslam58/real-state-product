"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Spinner, inputClass } from "@/components/ui/Interactive";
import { buttonClass } from "@/components/ui/Primitives";

/**
 * There is no authentication in this build — any well-formed email and a password
 * of any length signs you in. The validation here is real, though, because the
 * shape of the form is what gets reviewed, and an empty-submit that silently does
 * nothing is the most common broken login in the world.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("omar@meridianproperties.ae");
  const [password, setPassword] = useState("demo1234");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Offline is the one failure a login form must handle out loud — otherwise
    // the button just does nothing and the user retries forever.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setErrors({ form: "You appear to be offline. Check your connection and try again." });
      return;
    }

    setPending(true);
    await new Promise((r) => setTimeout(r, 650));
    router.push("/");
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {errors.form ? (
        <p
          role="alert"
          className="text-sm rounded-md px-3 py-2.5 border"
          style={{
            background: "var(--color-danger-tint)",
            borderColor: "var(--color-danger-border)",
            color: "var(--color-danger)",
          }}
        >
          {errors.form}
        </p>
      ) : null}

      <Field label="Work email" error={errors.email ?? null} required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          aria-invalid={Boolean(errors.email)}
          className={inputClass}
          placeholder="you@agency.ae"
        />
      </Field>

      <div>
        <Field label="Password" error={errors.password ?? null} required>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>
        <div className="flex justify-end mt-2">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-accent-bright hover:text-accent-hover"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`${buttonClass("primary")} w-full mt-1`}
      >
        {pending ? (
          <>
            <Spinner /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <p className="text-xs text-muted text-center mt-1">
        No account is created in this build — any email signs you in.
      </p>
    </form>
  );
}
