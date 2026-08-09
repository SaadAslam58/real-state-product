import type { Metadata } from "next";
import { GehoxWordmark } from "@/components/brand/GehoxMark";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[380px]">
        <GehoxWordmark size={32} className="mb-10" />
        <h1 className="t-display text-3xl text-ink mb-2">Choose a new password</h1>
        <p className="text-base text-muted mb-8 leading-relaxed">
          Pick something you don&rsquo;t use anywhere else.
        </p>
        <ResetForm />
      </div>
    </div>
  );
}
