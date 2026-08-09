import Link from "next/link";
import type { Metadata } from "next";
import { getRole } from "@/lib/session";
import { getAgentMap, getCorrections, getSession } from "@/lib/data";
import { canApproveCorrections } from "@/lib/rbac";
import { parseScenario } from "@/lib/data/scenarios";
import {
  Avatar,
  Card,
  EmptyState,
  ErrorSurface,
  SectionHeading,
} from "@/components/ui/Primitives";
import { CorrectionActions } from "./CorrectionActions";
import { AddRuleButton, EditRuleButton } from "./AddRule";
import { formatRelative } from "@/lib/format";
import { isDataError } from "@/lib/types";

export const metadata: Metadata = { title: "Knowledge" };

/**
 * Knowledge / Corrections.
 *
 * Conventional CRM design would file this under settings. It belongs near the
 * front: it is the only screen where an agency's annoyance at an AI mistake turns
 * into a permanent fix instead of a support ticket, which is what keeps them
 * trusting the thing.
 */
export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const scenario = parseScenario(sp.scenario);
  const role = await getRole();
  const session = await getSession(role);
  const now = new Date();

  let corrections, agents;
  try {
    [corrections, agents] = await Promise.all([
      getCorrections(scenario),
      getAgentMap(),
    ]);
  } catch (e) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <ErrorSurface
            title="Couldn't load the knowledge base"
            body={isDataError(e) ? e.message : "Something went wrong on our side."}
            retryHref="/knowledge"
          />
        </Card>
      </div>
    );
  }

  const pending = corrections.filter((c) => c.status === "pending");
  const approved = corrections.filter((c) => c.status === "approved");

  return (
    <div className="max-w-[880px] mx-auto flex flex-col gap-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="t-eyebrow mb-1.5">How the AI learns</p>
          <h1 className="t-display text-xl text-ink">Knowledge &amp; corrections</h1>
          <p className="text-sm text-muted mt-2 max-w-[62ch] leading-relaxed">
            When the AI gets something wrong, an agent flags it here and you approve the
            fix — it then applies to every future conversation, not just the one it came
            from. You can also just tell it something directly, without waiting for it
            to get that thing wrong first.
          </p>
        </div>
        {canApproveCorrections(session) ? <AddRuleButton /> : null}
      </div>

      {/* ── Pending review ── */}
      <section>
        <SectionHeading
          eyebrow={`${pending.length} waiting`}
          title="Flagged for review"
        />

        {pending.length === 0 ? (
          <Card>
            <EmptyState
              variant="no-data"
              title="Nothing to review"
              body="Your team hasn't flagged any replies. When someone does, it lands here for your approval."
              icon={
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((c) => {
              const flagger = agents[c.flaggedByAgentId];
              return (
                <li key={c.id}>
                  <Card className="overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-hairline bg-sunk">
                      {flagger ? (
                        <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                          <Avatar name={flagger.name} size={18} />
                          <span className="font-semibold">{flagger.name}</span>
                          flagged this
                        </span>
                      ) : null}
                      <span className="text-xs text-muted">
                        {formatRelative(c.flaggedAt, now)} ago
                      </span>
                      {c.leadId ? (
                        <Link
                          href={`/leads/${c.leadId}`}
                          className="ml-auto text-xs font-semibold text-accent-bright hover:text-accent-hover"
                        >
                          Open conversation
                          {c.leadContactLabel ? ` · ${c.leadContactLabel}` : ""}
                        </Link>
                      ) : null}
                    </div>

                    <div className="px-4 py-4 flex flex-col gap-3.5">
                      <Quote
                        label="What the AI said"
                        text={c.aiSaid}
                        tone="ai"
                      />
                      <Quote
                        label="What was wrong"
                        text={c.whatWasWrong}
                        tone="wrong"
                      />
                      <Quote
                        label="Suggested correction"
                        text={c.correctAnswer}
                        tone="fix"
                      />
                    </div>

                    <CorrectionActions
                      id={c.id}
                      correctAnswer={c.correctAnswer}
                      canApprove={canApproveCorrections(session)}
                    />
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── The running list the AI actually follows ── */}
      <section>
        <SectionHeading
          eyebrow={`${approved.length} in effect`}
          title="What the AI has been taught"
        />

        {approved.length === 0 ? (
          <Card>
            <EmptyState
              variant="no-data"
              title="Nothing approved yet"
              body="Approved corrections appear here as a running list — like an internal FAQ the AI follows."
            />
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-hairline">
              {approved.map((c) => {
                const approver = c.approvedByAgentId ? agents[c.approvedByAgentId] : null;
                return (
                  <li key={c.id} className="px-4 py-3.5 flex gap-3">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                      style={{ background: "var(--color-accent-bright)" }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink leading-relaxed">{c.correctAnswer}</p>
                      {/* Who approved this and when. Approving changes how the AI
                          answers every future customer, so it is an audit record,
                          not a decoration. */}
                      <p className="text-xs text-muted mt-1.5">
                        Approved by {approver?.name ?? "the owner"}{" "}
                        {c.approvedAt ? `${formatRelative(c.approvedAt, now)} ago` : ""}
                      </p>
                    </div>
                    {canApproveCorrections(session) ? (
                      <span className="flex items-center gap-0.5 shrink-0">
                        <EditRuleButton id={c.id} current={c.correctAnswer} />
                        <CorrectionActions
                          id={c.id}
                          correctAnswer={c.correctAnswer}
                          canApprove
                          variant="approved"
                        />
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        {!canApproveCorrections(session) ? (
          <p className="text-xs text-muted mt-3">
            Only the agency owner can approve or remove corrections. You can flag any
            conversation from its detail screen.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Quote({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: "ai" | "wrong" | "fix";
}) {
  const style = {
    ai: {
      background: "var(--color-accent-wash)",
      borderColor: "#ddd0f4",
      color: "var(--color-ink)",
    },
    wrong: {
      background: "var(--color-ember-tint)",
      borderColor: "var(--color-ember-border)",
      color: "#7a3410",
    },
    fix: {
      background: "var(--color-stage-ready-tint)",
      borderColor: "var(--color-stage-ready-border)",
      color: "#14612f",
    },
  }[tone];

  return (
    <div>
      <p className="t-eyebrow mb-1.5">{label}</p>
      <p
        className="text-sm leading-relaxed rounded-md border px-3 py-2.5"
        style={style}
      >
        {text}
      </p>
    </div>
  );
}
