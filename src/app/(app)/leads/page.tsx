import Link from "next/link";
import type { Metadata } from "next";
import { getRole } from "@/lib/session";
import {
  getAgentMap,
  getAgency,
  getLeads,
  getListingMap,
  getSession,
  getTeam,
} from "@/lib/data";
import { parseScenario } from "@/lib/data/scenarios";
import { attentionFor, STAGE, STAGE_ORDER } from "@/lib/status";
import { isOwner } from "@/lib/rbac";
import {
  Avatar,
  Card,
  CardList,
  EmptyState,
  ErrorSurface,
  Pagination,
  Table,
  TableShell,
  Td,
  Th,
  UserText,
  ButtonLink,
  Mono,
} from "@/components/ui/Primitives";
import {
  AgingClock,
  AttentionRule,
  StageBadge,
  attentionRowStyle,
} from "@/components/status/Status";
import { SearchBox, FilterSelect, ClearFilters } from "@/components/ui/Interactive";
import { ReassignSelect } from "./ReassignSelect";
import { formatPhone, formatRelative } from "@/lib/format";
import { isDataError, type AttentionState, type Stage } from "@/lib/types";

export const metadata: Metadata = { title: "Leads" };

const FILTER_KEYS = ["stage", "agent", "attention", "q"];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const scenario = parseScenario(sp.scenario);
  const role = await getRole();
  const session = await getSession(role);
  const now = new Date();

  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const query = {
    stage: (one("stage") ?? "all") as Stage | "all",
    assignedAgentId: one("agent") ?? "all",
    attention: (one("attention") ?? "all") as AttentionState | "all",
    search: one("q") ?? "",
    page: Number(one("page") ?? 1) || 1,
  };

  const hasFilters = FILTER_KEYS.some((k) => {
    const v = one(k);
    return v && v !== "all";
  });

  const qs = (patch: Record<string, string | number>) => {
    const p = new URLSearchParams();
    for (const k of [...FILTER_KEYS, "scenario"]) {
      const v = one(k);
      if (v && v !== "all") p.set(k, v);
    }
    for (const [k, v] of Object.entries(patch)) p.set(k, String(v));
    return `/leads${p.toString() ? `?${p}` : ""}`;
  };

  let body: React.ReactNode;

  try {
    const [page, agents, listings, agency, team] = await Promise.all([
      getLeads(session, query, scenario),
      getAgentMap(),
      getListingMap(),
      getAgency(scenario),
      getTeam(scenario),
    ]);

    const threshold = agency.overdueThresholdMinutes;
    const activeAgents = team.filter((a) => a.active);

    if (page.items.length === 0) {
      body = (
        <Card>
          {hasFilters ? (
            // "No leads match this filter" and "you have no leads yet" are
            // different problems with different next actions. Showing the
            // onboarding CTA to someone who just over-filtered is the classic
            // mistake — it reads as if their data vanished.
            <EmptyState
              variant="no-match"
              title="No leads match these filters"
              body="Try widening the stage or agent filter, or clear the search."
              action={<ButtonLink href="/leads" size="sm">Clear all filters</ButtonLink>}
              icon={<FilterIcon />}
            />
          ) : (
            <EmptyState
              variant="no-data"
              title="No leads yet"
              body="As soon as someone messages your WhatsApp Business number about a property, the AI will reply and the conversation will appear here."
              action={<ButtonLink href="/settings" tone="primary" size="sm">Check WhatsApp connection</ButtonLink>}
              icon={<ChatIcon />}
            />
          )}
        </Card>
      );
    } else {
      body = (
        <TableShell>
          <Table>
            <thead>
              <tr>
                <Th>Contact</Th>
                <Th>Property</Th>
                <Th>Stage</Th>
                <Th>Assigned</Th>
                <Th align="right">Last message</Th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((lead) => {
                const attention = attentionFor(lead, threshold, now);
                const listing = lead.listingId ? listings[lead.listingId] : null;

                return (
                  <tr
                    key={lead.id}
                    className="relative border-b border-hairline last:border-0 hover:bg-sunk/60 transition-colors"
                    style={attentionRowStyle(attention)}
                  >
                    <Td className="relative">
                      <AttentionRule state={attention} />
                      <Link
                        href={`/leads/${lead.id}`}
                        className="block pl-1 -my-3 py-3 group"
                      >
                        <span className="block font-semibold text-ink group-hover:text-accent-bright truncate-1 max-w-[22ch]">
                          <UserText>{lead.contactName ?? "Unknown contact"}</UserText>
                        </span>
                        <Mono>{formatPhone(lead.phone)}</Mono>
                      </Link>
                    </Td>

                    <Td>
                      {listing ? (
                        <Link href="/listings" className="block group max-w-[26ch]">
                          <span className="block truncate-1 group-hover:text-accent-bright">
                            {listing.area}
                          </span>
                          <Mono>{listing.reference}</Mono>
                        </Link>
                      ) : (
                        <span className="text-muted text-xs">Not identified yet</span>
                      )}
                    </Td>

                    <Td>
                      <span className="flex flex-col items-start gap-1.5">
                        <StageBadge stage={lead.stage} outcome={lead.closedOutcome} size="sm" />
                        {attention !== "none" && lead.handoff ? (
                          <AgingClock
                            since={lead.handoff.requestedAt}
                            state={attention}
                            now={now}
                          />
                        ) : null}
                      </span>
                    </Td>

                    <Td>
                      <ReassignSelect
                        leadId={lead.id}
                        current={lead.assignedAgentId}
                        agents={activeAgents.map((a) => ({ id: a.id, name: a.name }))}
                      />
                    </Td>

                    <Td align="right">
                      <span className="text-xs text-muted whitespace-nowrap">
                        {formatRelative(lead.lastMessageAt, now)}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {/* Below md the table becomes cards. A horizontally-scrolling table on
              a phone is the most common responsive-dashboard failure, and the
              owner reads this between showings. */}
          <CardList>
            {page.items.map((lead) => {
              const attention = attentionFor(lead, threshold, now);
              const agent = lead.assignedAgentId ? agents[lead.assignedAgentId] : null;
              const listing = lead.listingId ? listings[lead.listingId] : null;

              return (
                <li key={lead.id} className="relative" style={attentionRowStyle(attention)}>
                  <AttentionRule state={attention} />
                  <Link href={`/leads/${lead.id}`} className="block pl-5 pr-4 py-3.5">
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block font-semibold text-sm text-ink truncate-1">
                          <UserText>{lead.contactName ?? "Unknown contact"}</UserText>
                        </span>
                        <Mono>{formatPhone(lead.phone)}</Mono>
                      </span>
                      <span className="text-xs text-muted shrink-0">
                        {formatRelative(lead.lastMessageAt, now)}
                      </span>
                    </span>

                    <span className="flex flex-wrap items-center gap-2 mt-2.5">
                      <StageBadge stage={lead.stage} outcome={lead.closedOutcome} size="sm" />
                      {attention !== "none" && lead.handoff ? (
                        <AgingClock
                          since={lead.handoff.requestedAt}
                          state={attention}
                          now={now}
                        />
                      ) : null}
                      {agent ? (
                        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
                          <Avatar name={agent.name} size={18} />
                          {agent.name.split(" ")[0]}
                        </span>
                      ) : null}
                    </span>

                    {listing ? (
                      <span className="block text-xs text-muted mt-2 truncate-1">
                        {listing.area} · {listing.reference}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </CardList>

          <Pagination
            page={page.page}
            pageSize={page.pageSize}
            total={page.total}
            hrefFor={(p) => qs({ page: p })}
          />
        </TableShell>
      );
    }
  } catch (e) {
    body = (
      <Card>
        <ErrorSurface
          title="Couldn't load your leads"
          body={isDataError(e) ? e.message : "Something went wrong on our side."}
          retryHref="/leads"
        />
      </Card>
    );
  }

  const team = await getTeam().catch(() => []);

  return (
    <div className="max-w-[1180px] mx-auto flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="t-eyebrow mb-1.5">
            {isOwner(session) ? "All inquiries" : "Assigned to you"}
          </p>
          <h1 className="t-display text-xl text-ink">Leads</h1>
        </div>
        {role === "agent" ? (
          <p className="text-xs text-muted max-w-[38ch]">
            You&rsquo;re seeing only leads assigned to you. Owners see every lead in the agency.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox placeholder="Search name, number, or property" />
        <FilterSelect
          paramKey="stage"
          label="Filter by stage"
          options={[
            { value: "all", label: "All stages" },
            ...STAGE_ORDER.map((s) => ({ value: s, label: STAGE[s].label })),
          ]}
        />
        <FilterSelect
          paramKey="attention"
          label="Filter by attention"
          options={[
            { value: "all", label: "Any urgency" },
            { value: "handoff_overdue", label: "Overdue only" },
            { value: "handoff_pending", label: "Awaiting handoff" },
            { value: "none", label: "No handoff" },
          ]}
        />
        {isOwner(session) ? (
          <FilterSelect
            paramKey="agent"
            label="Filter by agent"
            options={[
              { value: "all", label: "All agents" },
              { value: "unassigned", label: "Unassigned" },
              ...team.filter((a) => a.active).map((a) => ({ value: a.id, label: a.name })),
            ]}
          />
        ) : null}
        <ClearFilters keys={FILTER_KEYS} />
      </div>

      {body}
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 5h18l-7 8v6l-4 2v-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
