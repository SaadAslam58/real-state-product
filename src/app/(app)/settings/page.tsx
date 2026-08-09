import type { Metadata } from "next";
import { getRole } from "@/lib/session";
import { getAgency, getSession } from "@/lib/data";
import { canEditAgencySettings } from "@/lib/rbac";
import { parseScenario } from "@/lib/data/scenarios";
import { Card, ErrorSurface, Mono, SectionHeading } from "@/components/ui/Primitives";
import {
  AccountSettings,
  AgencySettings,
  WhatsAppPanel,
} from "./SettingsControls";
import { isDataError } from "@/lib/types";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const scenario = parseScenario(sp.scenario);
  const role = await getRole();
  const session = await getSession(role);

  let agency;
  try {
    agency = await getAgency(scenario);
  } catch (e) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <ErrorSurface
            title="Couldn't load settings"
            body={isDataError(e) ? e.message : "Something went wrong on our side."}
            retryHref="/settings"
          />
        </Card>
      </div>
    );
  }

  const isOwner = canEditAgencySettings(session);

  return (
    <div className="max-w-[720px] mx-auto flex flex-col gap-7">
      <div>
        <p className="t-eyebrow mb-1.5">Agency &amp; account</p>
        <h1 className="t-display text-xl text-ink">Settings</h1>
      </div>

      {/* ── WhatsApp ── */}
      <section>
        <SectionHeading eyebrow="channel" title="WhatsApp Business" />
        <Card>
          <WhatsAppPanel
            connected={agency.whatsapp.connected}
            number={agency.whatsapp.number}
            displayName={agency.whatsapp.displayName}
            verification={agency.whatsapp.verification}
            canEdit={isOwner}
          />
        </Card>
      </section>

      {/* ── AI behaviour ── */}
      <section>
        <SectionHeading eyebrow="the ai" title="How it answers" />
        <Card>
          <AgencySettings
            aiPaused={agency.aiPaused}
            overdueThresholdMinutes={agency.overdueThresholdMinutes}
            handoffChannel={agency.notifications.handoffChannel}
            recipients={agency.notifications.recipients}
            canEdit={isOwner}
          />
        </Card>

        {/* Language is deliberately not a setting. The underlying model handles it,
            and a language dropdown would invite someone to lock it to English —
            which would silently break every Arabic inquiry. */}
        <div
          className="flex gap-3 mt-3 rounded-lg border px-4 py-3"
          style={{
            background: "var(--color-accent-wash)",
            borderColor: "#ddd0f4",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0 mt-0.5"
            style={{ color: "var(--color-accent-bright)" }}
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" stroke="currentColor" strokeWidth="1.7" />
          </svg>
          <p className="text-xs leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">Language is automatic.</span> The AI
            detects the language each customer writes in and replies in the same one —
            English, Arabic, Hindi, Russian, and others common among Dubai buyers. There
            is deliberately no language setting here, so it can never be pinned to
            English by accident.
          </p>
        </div>
      </section>

      {/* ── Business info ── */}
      <section>
        <SectionHeading eyebrow="agency" title="Business details" />
        <Card>
          <dl className="divide-y divide-hairline">
            <Row label="Agency name" value={agency.name} />
            <Row label="Trade licence" value={agency.tradeLicense ?? "Not set"} mono />
            <Row label="Email" value={agency.email} />
            <Row label="Phone" value={agency.phone} mono />
            <Row label="Address" value={agency.address ?? "Not set"} />
          </dl>
          {!isOwner ? (
            <p className="px-4 py-3 text-xs text-muted border-t border-hairline">
              Only the agency owner can change these.
            </p>
          ) : null}
        </Card>
      </section>

      {/* ── Your own account ── */}
      <section>
        <SectionHeading eyebrow="just you" title="Your account" />
        <Card>
          <AccountSettings name={session.agent.name} email={session.agent.email} />
        </Card>
      </section>

      <p className="text-xs text-muted leading-relaxed border-t border-hairline pt-5">
        Billing is handled directly with Gehox and invoiced outside the app — there is
        no subscription to manage here. Questions about your invoice go to{" "}
        <a
          href="mailto:hello@gehox.com"
          className="text-accent-bright font-semibold hover:text-accent-hover"
        >
          hello@gehox.com
        </a>
        .
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 px-4 py-3">
      <dt className="text-xs text-muted shrink-0">{label}</dt>
      <dd className={`text-sm text-right text-ink ${mono ? "t-mono" : ""}`}>
        {mono ? <Mono className="text-ink">{value}</Mono> : value}
      </dd>
    </div>
  );
}
