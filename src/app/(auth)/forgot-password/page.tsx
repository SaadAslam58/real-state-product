import Link from "next/link";
import type { Metadata } from "next";
import { GehoxWordmark } from "@/components/brand/GehoxMark";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[380px]">
        <GehoxWordmark size={32} className="mb-10" />
        <h1 className="t-display text-3xl text-ink mb-2">Reset your password</h1>
        <p className="text-base text-muted mb-8 leading-relaxed">
          Enter the email you sign in with and we&rsquo;ll send you a link.
        </p>

        <ForgotForm />

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink mt-8"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
