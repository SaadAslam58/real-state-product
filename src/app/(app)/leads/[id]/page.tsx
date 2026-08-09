import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRole } from "@/lib/session";
import { getAgency, getAgentMap, getLead, getListingMap, getSession } from "@/lib/data";
import { parseScenario } from "@/lib/data/scenarios";
import { attentionFor } from "@/lib/status";
import { canApproveCorrections } from "@/lib/rbac";
import {
  Avatar,
  Card,
  ErrorSurface,
  Mono,
  UserText,
} from "@/components/ui/Primitives";
import { AgingClock, StageBadge } from "@/components/status/Status";
import { ConversationActions } from "./ConversationActions";
import { Composer } from "./Composer";
import {
  formatBudgetRange,
  formatClock,
  formatDayLabel,
  formatPhone,
  formatRelative,
} from "@/lib/format";
import { assertNever } from "@/lib/assert";
import { isDataError, type Agent, type Turn } from "@/lib/types";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const scenario = parseScenario(sp.scenario);
  const role = await getRole();
  const session = await getSession(role);
  const now = new Date();

  let lead, agents, listings, agency;
  try {
    [agents, listings, agency] = await Promise.all([
      getAgentMap(),
      getListingMap(),
      getAgency(scenario),
    ]);
    lead = await getLead(session, id, scenario);
  } catch (e) {
    if (isDataError(e) && e.code === "not_found") notFound();
    if (isDataError(e) && e.code === "forbidden") {
      return (
        <div className="max-w-2xl mx-auto mt-8">
          <Card>
            <ErrorSurface
              title="You don't have access to this lead"
              body="This conversation is assigned to another agent. Ask the agency owner if you need it reassigned."
              retryHref="/leads"
            />
          </Card>
        </div>
      );
    }
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <ErrorSurface
            title="Couldn't load this conversation"
            body={isDataError(e) ? e.message : "Something went wrong on our side."}
            retryHref={`/leads/${id}`}
          />
        </Card>
      </div>
    );
  }

  const attention = attentionFor(lead, agency.overdueThresholdMinutes, now);
  const listing = lead.listingId ? listings[lead.listingId] : null;
  const assigned = lead.assignedAgentId ? agents[lead.assignedAgentId] : null;

  // Who holds the thread at each turn. Handoff switches it to a human, resume
  // hands it back — and a thread can do that more than once, so this is a walk
  // rather than a single switch point. Modelling handoff as a turn inside the
  // thread (not as metadata beside it) is what makes this possible at all.
  let holder: "ai" | "human" = "ai";
  const owners = lead.turns.map((t) => {
    if (t.kind === "handoff") holder = "human";
    const at = holder;
    if (t.kind === "resume") holder = "ai";
    return at;
  });

  return (
    <div className="max-w-[1180px] mx-auto">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink mb-4 -ml-1 px-1 py-1.5 rounded"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All leads
      </Link>

      <div className="grid lg:grid-cols-[1fr_312px] gap-5 items-start">
        {/* ── Thread ── */}
        <div className="min-w-0">
          <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h1 className="t-display text-xl text-ink truncate-1">
                <UserText>{lead.contactName ?? "Unknown contact"}</UserText>
              </h1>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                <Mono className="text-sm">{formatPhone(lead.phone)}</Mono>
                <span className="text-xs text-muted">
                  {lead.messageCount} messages · started{" "}
                  {formatRelative(lead.createdAt, now)} ago
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StageBadge stage={lead.stage} outcome={lead.closedOutcome} />
            </div>
          </header>

          {/* Handoff banner — urgent, never an error state. */}
          {lead.handoff && attention !== "none" ? (
            <div
              className="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 mb-4"
              style={{
                background:
                  attention === "handoff_overdue"
                    ? "var(--color-ember-tint)"
                    : "var(--color-surface)",
                borderColor: "var(--color-ember-border)",
              }}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${attention === "handoff_overdue" ? "pulse-ember" : ""}`}
                style={{ background: "var(--color-ember)" }}
              />
              <p className="text-sm min-w-0" style={{ color: "#8a3a10" }}>
                <span className="font-semibold">
                  {agents[lead.handoff.agentId]?.name ?? "An agent"} was notified
                </span>{" "}
                {formatRelative(lead.handoff.requestedAt, now)} ago
                {lead.handoff.acknowledgedAt
                  ? " and has picked this up."
                  : " and hasn't replied yet."}
              </p>
              <span className="ml-auto shrink-0">
                <AgingClock
                  since={lead.handoff.requestedAt}
                  state={attention}
                  now={now}
                />
              </span>
            </div>
          ) : null}

          {lead.aiPaused ? (
            <p className="flex items-center gap-2 text-xs font-semibold rounded-md px-3 py-2 mb-4 border"
              style={{
                background: "var(--color-sunk)",
                borderColor: "var(--color-edge)",
                color: "var(--color-ink-soft)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 5v14M15 5v14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              AI replies are paused on this thread so it can&rsquo;t talk over you. Resume
              AI handling or resolve the lead to unpause.
            </p>
          ) : null}

          <Card className="overflow-hidden">
            <Thread turns={lead.turns} owners={owners} agents={agents} now={now} />
          </Card>

          <Composer
            leadId={lead.id}
            aiPaused={lead.aiPaused}
            notes={lead.notes}
            agents={agents}
            customerPhone={lead.phone}
          />

          <ConversationActions
            leadId={lead.id}
            aiPaused={lead.aiPaused}
            stage={lead.stage}
            canApprove={canApproveCorrections(session)}
            lastAiMessage={
              [...lead.turns].reverse().find((t) => t.kind === "ai" || t.kind === "image")
                ? (([...lead.turns].reverse().find((t) => t.kind === "ai") as
                    | { text: string }
                    | undefined)?.text ?? "")
                : ""
            }
          />
        </div>

        {/* ── What the AI worked out ── */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
          <Card>
            <div className="px-4 py-3 border-b border-hairline">
              <p className="t-eyebrow">What the AI has established</p>
            </div>
            <dl className="px-4 py-3 flex flex-col gap-3">
              <Fact
                label="Looking to"
                value={
                  lead.extraction.intent === "buy"
                    ? "Buy"
                    : lead.extraction.intent === "rent"
                      ? "Rent"
                      : null
                }
              />
              <Fact
                label="Budget"
                value={formatBudgetRange(
                  lead.extraction.budgetMinAED,
                  lead.extraction.budgetMaxAED,
                )}
              />
              <Fact
                label="Areas"
                value={lead.extraction.areas.length ? lead.extraction.areas.join(", ") : null}
              />
              <Fact label="Timeline" value={lead.extraction.timeline} />
              <Fact
                label="Urgency"
                value={
                  lead.extraction.urgency
                    ? lead.extraction.urgency[0]!.toUpperCase() +
                      lead.extraction.urgency.slice(1)
                    : null
                }
              />
            </dl>
          </Card>

          <Card>
            <div className="px-4 py-3 border-b border-hairline">
              <p className="t-eyebrow">Assigned to</p>
            </div>
            <div className="px-4 py-3">
              {assigned ? (
                <div className="flex items-center gap-2.5">
                  <Avatar name={assigned.name} size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate-1">
                      {assigned.name}
                    </p>
                    <Mono>{formatPhone(assigned.phone)}</Mono>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">Not yet assigned.</p>
              )}
            </div>
          </Card>

          {listing ? (
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b border-hairline">
                <p className="t-eyebrow">Property discussed</p>
              </div>
              <div className="relative aspect-[16/10] bg-sunk">
                <Image
                  src={listing.photos[0] ?? ""}
                  alt={listing.title}
                  fill
                  sizes="312px"
                  className="object-cover"
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-ink leading-snug">
                  {listing.title}
                </p>
                <p className="text-xs text-muted mt-1">{listing.area}</p>
                <Mono className="block mt-1.5">{listing.reference}</Mono>
              </div>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-muted shrink-0">{label}</dt>
      {/* null renders as an explicit phrase, never a blank row — a blank row
          reads as a broken panel, "not yet established" reads as the truth. */}
      <dd
        className={`text-sm text-right ${value ? "text-ink font-medium" : "text-muted italic"}`}
      >
        {value ?? "not yet established"}
      </dd>
    </div>
  );
}

/**
 * THE CONVERSATION SPINE.
 *
 * A continuous rail runs down the thread. Customer turns hang left of it, machine
 * and agent turns hang right. The rail is violet while the AI holds the thread and
 * ember from the handoff turn onward — so scrolling a long conversation, you can
 * *see* where the machine stopped and a human started, instead of reading every
 * bubble to work it out.
 *
 * Semantically it is an ordered list with a speaker label on every item; the rail
 * is CSS, not content, so a screen reader gets the transcript rather than a
 * description of a line.
 */
function Thread({
  turns,
  owners,
  agents,
  now,
}: {
  turns: Turn[];
  owners: ("ai" | "human")[];
  agents: Record<string, Agent>;
  now: Date;
}) {
  let lastDay = "";

  return (
    <ol className="relative px-3 sm:px-6 py-5" aria-label="Conversation transcript">
      {turns.map((turn, i) => {
        const day = formatDayLabel(turn.at, now);
        const showDay = day !== lastDay;
        lastDay = day;
        const owner = owners[i] ?? "ai";

        return (
          <li key={turn.id} className="relative">
            {/* Each turn carries its own slice of the rail rather than one
                absolutely-positioned bar split by percentage. Percentages assume
                every turn is the same height, which image bubbles immediately
                break — and a thread that is handed off and then resumed needs
                three segments, not two. Per-turn slices get both right for free. */}
            <span
              aria-hidden="true"
              className={`absolute top-0 bottom-0 w-[2px] left-6 sm:left-1/2 sm:-translate-x-1/2 ${
                owner === "human" ? "rail-human" : "rail-ai"
              }`}
            />
            {showDay ? (
              <p className="relative flex justify-center my-4">
                <span className="t-eyebrow bg-surface px-2.5 py-1 rounded-full border border-hairline z-10">
                  {day}
                </span>
              </p>
            ) : null}
            <TurnRow turn={turn} agents={agents} />
          </li>
        );
      })}
    </ol>
  );
}

function TurnRow({
  turn,
  agents,
}: {
  turn: Turn;
  agents: Record<string, Agent>;
}) {
  switch (turn.kind) {
    case "customer":
      return (
        <Bubble side="left" speaker="Customer" at={turn.at} tone="customer">
          <UserText>{turn.text}</UserText>
        </Bubble>
      );

    case "ai":
      return (
        <Bubble side="right" speaker="Gehox AI" at={turn.at} tone="ai">
          {turn.text}
        </Bubble>
      );

    case "agent":
      return (
        <Bubble
          side="right"
          speaker={agents[turn.agentId]?.name ?? "Agent"}
          at={turn.at}
          tone="agent"
        >
          {turn.text}
        </Bubble>
      );

    case "image":
      return (
        <Bubble
          side={turn.author === "customer" ? "left" : "right"}
          speaker={turn.author === "customer" ? "Customer" : "Gehox AI"}
          at={turn.at}
          tone={turn.author === "customer" ? "customer" : "ai"}
          padded={false}
        >
          <span className="block relative w-full aspect-[4/3] bg-sunk overflow-hidden rounded-[5px]">
            <Image
              src={turn.imageUrl}
              alt={turn.caption ?? "Property photo sent in the conversation"}
              fill
              sizes="(max-width: 640px) 70vw, 300px"
              className="object-cover"
            />
          </span>
          {turn.caption ? (
            <span className="block px-3 py-2 text-xs leading-snug opacity-90">
              <UserText>{turn.caption}</UserText>
            </span>
          ) : null}
        </Bubble>
      );

    // Handoff and resume are events on the rail, not bubbles — they belong to
    // the thread's spine rather than to either speaker.
    case "handoff":
      return (
        <Marker
          tone="ember"
          at={turn.at}
          label={`Handed to ${agents[turn.toAgentId]?.name ?? "an agent"}`}
          detail={turn.reason}
        />
      );

    case "resume":
      return (
        <Marker
          tone="accent"
          at={turn.at}
          label={`${agents[turn.byAgentId]?.name ?? "An agent"} handed back to the AI`}
        />
      );

    default:
      return assertNever(turn);
  }
}

function Bubble({
  side,
  speaker,
  at,
  tone,
  children,
  padded = true,
}: {
  side: "left" | "right";
  speaker: string;
  at: string;
  tone: "customer" | "ai" | "agent";
  children: React.ReactNode;
  padded?: boolean;
}) {
  const styles = {
    customer: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-edge)",
      color: "var(--color-ink)",
    },
    ai: {
      background: "var(--color-accent-wash)",
      border: "1px solid #ddd0f4",
      color: "var(--color-ink)",
    },
    agent: {
      background: "var(--color-graphite)",
      border: "1px solid var(--color-graphite-line)",
      color: "#F1EDE6",
    },
  }[tone];

  return (
    <div
      className={`relative flex flex-col gap-1 py-1.5 ${
        side === "left"
          ? "items-start pl-11 sm:pl-0 sm:pr-[calc(50%+18px)] sm:items-end"
          : "items-start pl-11 sm:pl-[calc(50%+18px)]"
      }`}
    >
      <span
        className={`flex items-center gap-2 text-2xs ${side === "left" ? "sm:flex-row-reverse" : ""}`}
        style={{ color: "var(--color-muted)" }}
      >
        <span className="font-semibold">{speaker}</span>
        <span className="t-mono" style={{ fontSize: "0.625rem" }}>
          {formatClock(at)}
        </span>
      </span>
      <div
        className={`max-w-[min(100%,340px)] rounded-lg text-sm leading-relaxed overflow-hidden ${
          padded ? "px-3.5 py-2.5" : ""
        }`}
        style={styles}
      >
        {children}
      </div>
    </div>
  );
}

function Marker({
  tone,
  at,
  label,
  detail,
}: {
  tone: "ember" | "accent";
  at: string;
  label: string;
  detail?: string;
}) {
  const color = tone === "ember" ? "var(--color-ember)" : "var(--color-accent-bright)";
  const bg = tone === "ember" ? "var(--color-ember-tint)" : "var(--color-accent-wash)";
  const border = tone === "ember" ? "var(--color-ember-border)" : "#ddd0f4";

  return (
    <div className="relative flex justify-start sm:justify-center my-3 pl-11 sm:pl-0">
      <div
        className="inline-flex flex-col gap-0.5 rounded-lg border px-3 py-2 max-w-[min(100%,420px)] z-10"
        style={{ background: bg, borderColor: border }}
      >
        <span
          className="flex items-center gap-2 text-xs font-semibold"
          style={{ color }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
          {label}
          <span className="t-mono font-normal" style={{ color: "var(--color-muted)", fontSize: "0.625rem" }}>
            {formatClock(at)}
          </span>
        </span>
        {detail ? (
          <span className="text-xs leading-snug" style={{ color: "var(--color-ink-soft)" }}>
            {detail}
          </span>
        ) : null}
      </div>
    </div>
  );
}
