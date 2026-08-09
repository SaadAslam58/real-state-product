import Link from "next/link";
import type { Metadata } from "next";
import { getRole } from "@/lib/session";
import {
  getActivity,
  getAgency,
  getAgentMap,
  getAgentStats,
  getDashboardSummary,
  getLeads,
  getListingMap,
  getSession,
} from "@/lib/data";
import { parseScenario } from "@/lib/data/scenarios";
import { attentionFor } from "@/lib/status";
import {
  Avatar,
  Card,
  EmptyState,
  ErrorSurface,
  SectionHeading,
  ButtonLink,
  UserText,
} from "@/components/ui/Primitives";
import { AgingClock, StageBadge, StageCount } from "@/components/status/Status";
import { formatRelative } from "@/lib/format";
import { isDataError, type Stage } from "@/lib/types";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const scenario = parseScenario(sp.scenario);
  const role = await getRole();
  const session = await getSession(role);
  const now = new Date();

  try {
    const [summary, agency, leadPage, agents, stats, activity, listings] =
      await Promise.all([
        getDashboardSummary(session, scenario),
        getAgency(scenario),
        getLeads(session, { pageSize: 100 }, scenario),
        getAgentMap(),
        getAgentStats(scenario),
        getActivity(7, scenario),
        getListingMap(),
      ]);

    const threshold = agency.overdueThresholdMinutes;
    const leads = leadPage.items;

    const overdue = leads.filter(
      (l) => attentionFor(l, threshold, now) === "handoff_overdue",
    );
    const pending = leads.filter(
      (l) => attentionFor(l, threshold, now) === "handoff_pending",
    );

    const stageCounts = leads.reduce<Record<Stage, number>>(
      (acc, l) => {
        acc[l.stage] += 1;
        return acc;
      },
      { new: 0, qualifying: 0, ready_to_view: 0, closed: 0 },
    );

    // Nothing set up yet — an empty dashboard of four zeroes tells the owner
    // nothing. Point them at the one thing that matters instead.
    if (!agency.onboardingComplete) {
      return (
        <Card className="max-w-2xl mx-auto mt-8">
          <EmptyState
            variant="no-data"
            title="Let's connect your WhatsApp number"
            body="Once your WhatsApp Business number is connected and your listings are imported, every inquiry your AI agent handles will appear here."
            action={
              <ButtonLink href="/onboarding" tone="primary">
                Start setup
              </ButtonLink>
            }
            icon={
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 14a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </Card>
      );
    }

    return (
      <div className="max-w-[1180px] mx-auto flex flex-col gap-6">
        <div>
          <p className="t-eyebrow mb-1.5">
            {role === "owner" ? "Agency overview" : "Your leads"}
          </p>
          <h1 className="t-display text-xl text-ink">
            {greeting(now)}, {session.agent.name.split(" ")[0]}
          </h1>
        </div>

        {/* ── The urgent block leads the page. A dashboard whose most
            time-sensitive element sits in position five is a dashboard that
            gets ignored. When nothing is overdue this collapses to one calm
            line and the counts move up. ── */}
        {overdue.length > 0 ? (
          <section
            className="rounded-lg border overflow-hidden"
            style={{
              borderColor: "var(--color-ember-border)",
              background: "var(--color-ember-tint)",
            }}
          >
            <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3">
              <span
                className="w-2 h-2 rounded-full shrink-0 pulse-ember"
                style={{ background: "var(--color-ember)" }}
              />
              <h2 className="t-display text-md" style={{ color: "#8a3a10" }}>
                {overdue.length} {overdue.length === 1 ? "handoff has" : "handoffs have"}{" "}
                been waiting over {threshold} minutes
              </h2>
            </div>
            <ul className="bg-surface border-t" style={{ borderColor: "var(--color-ember-border)" }}>
              {overdue.map((lead) => {
                const agent = lead.assignedAgentId ? agents[lead.assignedAgentId] : null;
                const listing = lead.listingId ? listings[lead.listingId] : null;
                return (
                  <li key={lead.id} className="relative border-b border-hairline last:border-0">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{ background: "var(--color-ember)" }}
                    />
                    <Link
                      href={`/leads/${lead.id}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-5 pr-4 py-3 hover:bg-sunk transition-colors"
                    >
                      <span className="font-semibold text-sm text-ink min-w-0 truncate-1">
                        <UserText>{lead.contactName ?? lead.phone}</UserText>
                      </span>
                      {listing ? (
                        <span className="text-xs text-muted truncate-1 min-w-0 hidden sm:inline">
                          {listing.area} · {listing.reference}
                        </span>
                      ) : null}
                      <span className="ml-auto flex items-center gap-3 shrink-0">
                        {agent ? (
                          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted">
                            <Avatar name={agent.name} size={20} />
                            {agent.name}
                          </span>
                        ) : null}
                        <AgingClock
                          since={lead.handoff!.requestedAt}
                          state="handoff_overdue"
                          now={now}
                          showLabel={false}
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <p
            className="flex items-center gap-2 text-sm rounded-md px-3.5 py-2.5 border"
            style={{
              background: "var(--color-stage-ready-tint)",
              borderColor: "var(--color-stage-ready-border)",
              color: "#14612f",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            No overdue handoffs. Every lead that asked for a person has one.
          </p>
        )}

        {/* ── Counts ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi
            label="New leads today"
            value={summary.newLeadsToday}
            href="/leads?stage=new"
            foot={
              summary.filteredToday > 0
                ? `${summary.filteredToday} messages filtered as not property-related`
                : undefined
            }
          />
          <Kpi
            label="Awaiting handoff"
            value={summary.awaitingHandoff}
            href="/leads?attention=handoff_pending"
            tone={pending.length > 0 ? "ember" : "default"}
            foot={
              summary.overdueHandoffs > 0
                ? `${summary.overdueHandoffs} overdue`
                : "all within threshold"
            }
          />
          <Kpi
            label="Active conversations"
            value={summary.activeConversations}
            href="/leads"
            foot="messaged in the last 3 days"
          />
          <Kpi
            label="Listings synced"
            value={summary.listingsSynced}
            href="/listings?source=synced"
            foot={
              agency.sync.succeededAt
                ? `last sync ${formatRelative(agency.sync.succeededAt, now)} ago`
                : "never synced"
            }
          />
        </div>

        {/* ── Pipeline ── */}
        <section>
          <SectionHeading eyebrow="pipeline" title="Where your leads sit" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {(["new", "qualifying", "ready_to_view", "closed"] as Stage[]).map((s) => (
              <StageCount key={s} stage={s} count={stageCounts[s]} href={`/leads?stage=${s}`} />
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
          {/* ── Per-agent snapshot ── */}
          {role === "owner" ? (
            <section>
              <SectionHeading
                eyebrow="team"
                title="Who's responding"
                action={
                  <Link
                    href="/team"
                    className="inline-flex items-center text-xs font-semibold text-accent-bright hover:text-accent-hover px-1.5 py-1.5 -mr-1.5 rounded"
                  >
                    Manage team
                  </Link>
                }
              />
              <Card>
                {stats.length === 0 ? (
                  <EmptyState
                    variant="no-data"
                    title="No agents yet"
                    body="Add your team so new leads have someone to go to."
                    action={<ButtonLink href="/team" size="sm">Add an agent</ButtonLink>}
                  />
                ) : (
                  <ul className="divide-y divide-hairline">
                    {stats.map((s) => {
                      const agent = agents[s.agentId];
                      if (!agent) return null;
                      return (
                        <li key={s.agentId} className="flex items-center gap-3 px-4 py-3">
                          <Avatar name={agent.name} size={30} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-ink truncate-1">
                              {agent.name}
                            </p>
                            <p className="text-xs text-muted">
                              {s.assignedCount} assigned
                              {s.overdueCount > 0 ? (
                                <>
                                  {" · "}
                                  <span className="font-semibold" style={{ color: "var(--color-ember)" }}>
                                    {s.overdueCount} overdue
                                  </span>
                                </>
                              ) : null}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="t-mono text-sm text-ink">
                              {/* null, not zero — an agent who has never replied
                                  has no average, and "0m" would read as instant. */}
                              {s.avgResponseMinutes === null
                                ? "—"
                                : `${s.avgResponseMinutes}m`}
                            </p>
                            <p className="t-eyebrow" style={{ fontSize: "0.5625rem" }}>
                              avg reply
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </section>
          ) : (
            <section>
              <SectionHeading eyebrow="your queue" title="Needs you next" />
              <Card>
                {pending.length + overdue.length === 0 ? (
                  <EmptyState
                    variant="no-data"
                    title="Nothing waiting on you"
                    body="The AI is handling every conversation assigned to you right now."
                  />
                ) : (
                  <ul className="divide-y divide-hairline">
                    {[...overdue, ...pending].slice(0, 6).map((lead) => (
                      <li key={lead.id}>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-sunk"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-ink truncate-1">
                              <UserText>{lead.contactName ?? lead.phone}</UserText>
                            </span>
                            <span className="block text-xs text-muted">
                              {formatRelative(lead.lastMessageAt, now)} ago
                            </span>
                          </span>
                          <StageBadge stage={lead.stage} outcome={lead.closedOutcome} size="sm" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>
          )}

          {/* ── Activity ── */}
          <section>
            <SectionHeading eyebrow="recent" title="What just happened" />
            <Card>
              {activity.length === 0 ? (
                <EmptyState
                  variant="no-data"
                  title="Nothing yet"
                  body="Activity appears here as soon as your first inquiry arrives."
                />
              ) : (
                <ul className="divide-y divide-hairline">
                  {activity.map((item) => {
                    // The whole row is the target, not just the sentence — an
                    // 18px-tall text link is a miss on a phone.
                    const inner = (
                      <>
                        <span className="shrink-0 mt-1.5">
                          <ActivityDot kind={item.kind} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-sm text-ink-soft leading-snug block">
                            {item.summary}
                          </span>
                          <span className="text-xs text-muted">
                            {formatRelative(item.at, now)} ago
                          </span>
                        </span>
                      </>
                    );
                    return (
                      <li key={item.id}>
                        {item.leadId ? (
                          <Link
                            href={`/leads/${item.leadId}`}
                            className="flex gap-3 px-4 py-3 hover:bg-sunk transition-colors"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div className="flex gap-3 px-4 py-3">{inner}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </section>
        </div>

        {summary.pendingCorrections > 0 ? (
          <Link
            href="/knowledge"
            className="flex items-center gap-3 px-4 py-3.5 rounded-lg border border-hairline bg-surface hover:border-edge transition-colors"
          >
            <span
              className="w-8 h-8 rounded-md grid place-items-center shrink-0"
              style={{ background: "var(--color-accent-wash)", color: "var(--color-accent-bright)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8.8 10.2l1.9 1.9 3.9-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v14H5.5A1.5 1.5 0 0 0 4 19.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">
                {summary.pendingCorrections} flagged{" "}
                {summary.pendingCorrections === 1 ? "reply" : "replies"} waiting for review
              </span>
              <span className="block text-xs text-muted">
                Approving a correction teaches the AI for every future conversation.
              </span>
            </span>
            <span className="ml-auto shrink-0 text-accent-bright" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        ) : null}
      </div>
    );
  } catch (e) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <ErrorSurface
            title="Couldn't load your overview"
            body={isDataError(e) ? e.message : "Something went wrong on our side."}
            retryHref="/"
          />
        </Card>
      </div>
    );
  }
}

function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Kpi({
  label,
  value,
  href,
  foot,
  tone = "default",
}: {
  label: string;
  value: number;
  href: string;
  foot?: string;
  tone?: "default" | "ember";
}) {
  return (
    <Link
      href={href}
      className="group block bg-surface border border-hairline rounded-lg px-4 py-3.5 hover:border-edge transition-colors"
      style={
        tone === "ember"
          ? { borderColor: "var(--color-ember-border)", background: "var(--color-ember-tint)" }
          : undefined
      }
    >
      <p className="t-eyebrow mb-2">{label}</p>
      <p
        className="t-metric"
        style={{ color: tone === "ember" ? "var(--color-ember)" : "var(--color-ink)" }}
      >
        {value}
      </p>
      {foot ? <p className="text-xs text-muted mt-1.5 leading-snug">{foot}</p> : null}
    </Link>
  );
}

function ActivityDot({ kind }: { kind: string }) {
  const color =
    kind === "handoff_requested"
      ? "var(--color-ember)"
      : kind === "lead_resolved"
        ? "var(--color-stage-ready)"
        : kind === "correction_approved" || kind === "correction_flagged"
          ? "var(--color-accent-bright)"
          : kind === "message_filtered"
            ? "var(--color-edge)"
            : "var(--color-stage-new)";

  return (
    <span
      className="block w-1.5 h-1.5 rounded-full"
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}
