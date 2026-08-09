import type { Metadata } from "next";
import { GehoxWordmark } from "@/components/brand/GehoxMark";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Login.
 *
 * Two panes on desktop: the form on warm paper, and a graphite panel carrying the
 * spine's colour so the brand lands before you are even inside the product. On a
 * phone the graphite panel drops away entirely — nobody signing in on a phone
 * between showings needs a value proposition.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_460px]">
      <div className="flex flex-col justify-center px-6 sm:px-10 py-12">
        <div className="w-full max-w-[380px] mx-auto">
          <GehoxWordmark size={34} className="mb-10" />

          <h1 className="t-display text-3xl text-ink mb-2">Sign in</h1>
          <p className="text-base text-muted mb-8 leading-relaxed">
            Every WhatsApp inquiry your AI agent handled, in one place.
          </p>

          <LoginForm />

          <p className="text-xs text-muted mt-8 leading-relaxed">
            Trouble signing in? Email{" "}
            <a
              href="mailto:hello@gehox.com"
              className="text-accent-bright font-semibold hover:text-accent-hover"
            >
              hello@gehox.com
            </a>
            .
          </p>
        </div>
      </div>

      <aside
        className="hidden lg:flex flex-col justify-between p-10 on-graphite"
        style={{ background: "var(--color-graphite)" }}
      >
        <div />
        <div>
          <p
            className="t-display leading-[1.15]"
            style={{ color: "#F6F3EE", fontSize: "1.6rem", letterSpacing: "-0.035em" }}
          >
            Your AI answered
            <br />
            <span style={{ color: "var(--color-accent-light)" }}>while you were</span>
            <br />
            at a viewing.
          </p>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: "#8d847b" }}>
            Gehox replies to every WhatsApp property inquiry within seconds,
            qualifies the lead, and hands it to the right agent before it goes cold.
          </p>
        </div>
        <p className="t-eyebrow" style={{ color: "var(--color-graphite-dim)" }}>
          Gehox · gehox.com
        </p>
      </aside>
    </div>
  );
}

