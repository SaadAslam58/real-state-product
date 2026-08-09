import type { Metadata } from "next";
import { GehoxWordmark } from "@/components/brand/GehoxMark";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata: Metadata = { title: "Set up your agency" };

/**
 * First-run setup. Three steps, shown once.
 *
 * The step index lives in the URL (`?step=2`) rather than in component state, so
 * a refresh keeps your place and the browser back button steps backwards instead
 * of dumping you out of the flow. Both are things people actually do halfway
 * through a form.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.step) ? sp.step[0] : sp.step;
  const step = Math.min(3, Math.max(1, Number(raw ?? 1) || 1));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 flex items-center px-6 sm:px-10 shrink-0">
        <GehoxWordmark size={28} />
      </header>

      <div className="flex-1 flex items-start justify-center px-5 sm:px-8 pb-16">
        <div className="w-full max-w-[560px]">
          <OnboardingFlow step={step} />
        </div>
      </div>
    </div>
  );
}
