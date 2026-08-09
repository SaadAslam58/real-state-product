import {
  DataError,
  type ActivityItem,
  type Agency,
  type Agent,
  type AgentStat,
  type Correction,
  type DashboardSummary,
  type Lead,
  type LeadDetail,
  type LeadQuery,
  type Listing,
  type ListingQuery,
  type Page,
  type Session,
} from "../types";
import { attentionFor } from "../status";
import { scopeLeads, canViewLead } from "../rbac";
import { minutesSince } from "../format";
import { applyScenario, isEmptyScenario, type Scenario } from "./scenarios";
import {
  ACTIVITY,
  AGENCY,
  AGENTS,
  CORRECTIONS,
  CURRENT_AGENT_ID,
  CURRENT_OWNER_ID,
  FILTERED_TODAY,
  LEADS,
  LISTINGS,
  threadFor,
} from "./fixtures";

/**
 * ══════════════════════════════════════════════════════════════════════════
 * THE API CONTRACT — and the only door between the UI and its data.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Every screen reads through these functions. They are async and they return
 * the shapes in `lib/types.ts`, which means swapping fixtures for a real
 * service is an edit to THIS file, not to nine screens.
 *
 * Rules that make that true, and which are worth defending in review:
 *
 *   1. No UI code imports `./fixtures` — ESLint blocks it.
 *   2. Filtering, searching, sorting, and pagination happen HERE, never in a
 *      component. Client-side filtering over one page of results silently
 *      filters the page rather than the dataset, which makes the leads screen
 *      lie. These are query parameters, exactly as they will be over HTTP.
 *   3. Role scoping happens here too, because this is the function that
 *      becomes a server endpoint. See SECURITY.md — in this build it is a
 *      display filter, not a boundary.
 *   4. Every read takes a `Scenario` so loading, empty, and error states are
 *      reachable in development. See `scenarios.ts`.
 *
 * When the backend lands, each body becomes a `fetch`. The signatures do not
 * change. That is the whole point.
 */

const PAGE_SIZE = 25;

// ─────────────────────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────────────────────

/**
 * There is no auth in this build. The role switcher in the top bar sets this,
 * so the owner/agent split can actually be seen. Replaced by a real session
 * read when auth lands.
 */
export async function getSession(role: "owner" | "agent" = "owner"): Promise<Session> {
  const id = role === "owner" ? CURRENT_OWNER_ID : CURRENT_AGENT_ID;
  const agent = AGENTS.find((a) => a.id === id);
  if (!agent) throw new DataError("auth", "No signed-in user.");
  return { agent, agencyId: AGENCY.id };
}

// ─────────────────────────────────────────────────────────────
// Agency
// ─────────────────────────────────────────────────────────────

export async function getAgency(scenario: Scenario = "default"): Promise<Agency> {
  await applyScenario(scenario);

  if (scenario === "fresh") {
    return {
      ...AGENCY,
      whatsapp: {
        connected: false,
        number: null,
        displayName: null,
        verification: "unverified",
        connectedAt: null,
      },
      sync: {
        status: "never",
        attemptedAt: null,
        succeededAt: null,
        imported: 0,
        failed: 0,
        message: null,
      },
      onboardingComplete: false,
    };
  }

  if (scenario === "partial-sync") {
    return {
      ...AGENCY,
      sync: {
        status: "partial",
        attemptedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
        succeededAt: new Date(Date.now() - 180 * 60_000).toISOString(),
        imported: 6,
        failed: 3,
        message: "3 listings could not be read from Property Finder.",
      },
    };
  }

  return AGENCY;
}

// ─────────────────────────────────────────────────────────────
// Team
// ─────────────────────────────────────────────────────────────

export async function getTeam(scenario: Scenario = "default"): Promise<Agent[]> {
  await applyScenario(scenario);
  if (scenario === "fresh") return AGENTS.filter((a) => a.role === "owner");
  return AGENTS;
}

export async function getAgent(id: string): Promise<Agent | null> {
  return AGENTS.find((a) => a.id === id) ?? null;
}

/** Map for render-time lookups so a table does not do N round trips. */
export async function getAgentMap(): Promise<Record<string, Agent>> {
  return Object.fromEntries(AGENTS.map((a) => [a.id, a]));
}

// ─────────────────────────────────────────────────────────────
// Leads
// ─────────────────────────────────────────────────────────────

function matchesSearch(lead: Lead, listing: Listing | undefined, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [
    lead.contactName ?? "",
    lead.phone,
    listing?.reference ?? "",
    listing?.area ?? "",
    listing?.title ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export async function getLeads(
  session: Session,
  query: LeadQuery = {},
  scenario: Scenario = "default",
): Promise<Page<Lead>> {
  await applyScenario(scenario);

  if (isEmptyScenario(scenario)) {
    return { items: [], total: 0, page: 1, pageSize: PAGE_SIZE };
  }

  const threshold = AGENCY.overdueThresholdMinutes;
  const listings = new Map(LISTINGS.map((l) => [l.id, l]));

  // Role scoping first — an agent must never be able to page through, filter
  // into, or search up a colleague's lead.
  let rows = scopeLeads(session, LEADS);

  if (query.stage && query.stage !== "all") {
    rows = rows.filter((l) => l.stage === query.stage);
  }

  if (query.assignedAgentId && query.assignedAgentId !== "all") {
    rows =
      query.assignedAgentId === "unassigned"
        ? rows.filter((l) => l.assignedAgentId === null)
        : rows.filter((l) => l.assignedAgentId === query.assignedAgentId);
  }

  if (query.attention && query.attention !== "all") {
    rows = rows.filter(
      (l) => attentionFor(l, threshold) === query.attention,
    );
  }

  if (query.search) {
    rows = rows.filter((l) =>
      matchesSearch(l, l.listingId ? listings.get(l.listingId) : undefined, query.search as string),
    );
  }

  // Overdue first, then pending handoffs, then most recent. The owner opens this
  // screen to find what is going cold, not to read it chronologically.
  const weight = (l: Lead) => {
    const a = attentionFor(l, threshold);
    if (a === "handoff_overdue") return 0;
    if (a === "handoff_pending") return 1;
    return 2;
  };
  rows = [...rows].sort(
    (a, b) =>
      weight(a) - weight(b) ||
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  const pageSize = Math.min(query.pageSize ?? PAGE_SIZE, 100);
  const page = Math.max(1, query.page ?? 1);
  const start = (page - 1) * pageSize;

  return {
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
}

export async function getLead(
  session: Session,
  id: string,
  scenario: Scenario = "default",
): Promise<LeadDetail> {
  await applyScenario(scenario);

  const lead = LEADS.find((l) => l.id === id);
  if (!lead) throw new DataError("not_found", "That lead no longer exists.");

  // The check the server will do for real. Today it stops the obvious case; it
  // does not stop devtools. See SECURITY.md / TODOS.md T-01.
  if (!canViewLead(session, lead)) {
    throw new DataError(
      "forbidden",
      "This lead is assigned to another agent.",
    );
  }

  return { ...lead, turns: threadFor(lead.id) };
}

// ─────────────────────────────────────────────────────────────
// Listings
// ─────────────────────────────────────────────────────────────

export async function getListings(
  query: ListingQuery = {},
  scenario: Scenario = "default",
): Promise<Page<Listing>> {
  await applyScenario(scenario);

  if (isEmptyScenario(scenario)) {
    return { items: [], total: 0, page: 1, pageSize: PAGE_SIZE };
  }

  let rows = LISTINGS.filter((l) => l.status !== "archived");

  if (query.source && query.source !== "all") {
    rows = rows.filter((l) => l.source === query.source);
  }
  if (query.status && query.status !== "all") {
    rows = rows.filter((l) => l.status === query.status);
  }
  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    rows = rows.filter((l) =>
      `${l.reference} ${l.title} ${l.area} ${l.address}`
        .toLowerCase()
        .includes(needle),
    );
  }

  rows = [...rows].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const pageSize = Math.min(query.pageSize ?? PAGE_SIZE, 100);
  const page = Math.max(1, query.page ?? 1);
  const start = (page - 1) * pageSize;

  return {
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
}

export async function getListing(id: string): Promise<Listing | null> {
  return LISTINGS.find((l) => l.id === id) ?? null;
}

export async function getListingMap(): Promise<Record<string, Listing>> {
  return Object.fromEntries(LISTINGS.map((l) => [l.id, l]));
}

// ─────────────────────────────────────────────────────────────
// Corrections
// ─────────────────────────────────────────────────────────────

export async function getCorrections(
  scenario: Scenario = "default",
): Promise<Correction[]> {
  await applyScenario(scenario);
  if (isEmptyScenario(scenario)) return [];
  return [...CORRECTIONS].sort(
    (a, b) => new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime(),
  );
}

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

export async function getDashboardSummary(
  session: Session,
  scenario: Scenario = "default",
): Promise<DashboardSummary> {
  await applyScenario(scenario);

  if (isEmptyScenario(scenario)) {
    return {
      newLeadsToday: 0,
      awaitingHandoff: 0,
      overdueHandoffs: 0,
      activeConversations: 0,
      listingsSynced: 0,
      pendingCorrections: 0,
      filteredToday: 0,
    };
  }

  const threshold = AGENCY.overdueThresholdMinutes;
  const rows = scopeLeads(session, LEADS);
  const attention = rows.map((l) => attentionFor(l, threshold));

  return {
    newLeadsToday: rows.filter((l) => minutesSince(l.createdAt) < 24 * 60).length,
    awaitingHandoff: attention.filter((a) => a !== "none").length,
    overdueHandoffs: attention.filter((a) => a === "handoff_overdue").length,
    activeConversations: rows.filter(
      (l) => l.stage !== "closed" && minutesSince(l.lastMessageAt) < 72 * 60,
    ).length,
    listingsSynced: LISTINGS.filter(
      (l) => l.source === "synced" && l.status !== "archived",
    ).length,
    pendingCorrections: CORRECTIONS.filter((c) => c.status === "pending").length,
    filteredToday: FILTERED_TODAY,
  };
}

/**
 * Leads assigned and average response time per agent, from data already captured
 * (assignment + timestamps). Not an analytics suite — just enough for an owner to
 * see who is responsive and who is falling behind.
 *
 * `avgResponseMinutes` is null, never zero, for an agent who has not yet replied
 * to anything. Zero would read as "instant", which is the opposite of the truth.
 */
export async function getAgentStats(
  scenario: Scenario = "default",
): Promise<AgentStat[]> {
  await applyScenario(scenario);
  if (isEmptyScenario(scenario)) return [];

  const threshold = AGENCY.overdueThresholdMinutes;

  return AGENTS.filter((a) => a.active).map((agent) => {
    const assigned = LEADS.filter((l) => l.assignedAgentId === agent.id);

    // Response time = handoff requested → agent acknowledged.
    const responded = assigned.filter(
      (l) => l.handoff?.acknowledgedAt != null,
    );
    const avg =
      responded.length === 0
        ? null
        : Math.round(
            responded.reduce((sum, l) => {
              const req = new Date(l.handoff!.requestedAt).getTime();
              const ack = new Date(l.handoff!.acknowledgedAt as string).getTime();
              return sum + Math.max(0, (ack - req) / 60_000);
            }, 0) / responded.length,
          );

    return {
      agentId: agent.id,
      assignedCount: assigned.length,
      avgResponseMinutes: avg,
      overdueCount: assigned.filter(
        (l) => attentionFor(l, threshold) === "handoff_overdue",
      ).length,
    };
  });
}

export async function getActivity(
  limit = 8,
  scenario: Scenario = "default",
): Promise<ActivityItem[]> {
  await applyScenario(scenario);
  if (isEmptyScenario(scenario)) return [];
  return ACTIVITY.slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
// Mutations
//
// No persistence in this build — these resolve and the UI updates optimistically.
// The signatures are the contract; only the bodies change when the backend lands.
// ─────────────────────────────────────────────────────────────

const settle = (ms = 550) => new Promise((r) => setTimeout(r, ms));

export async function assignLead(leadId: string, agentId: string): Promise<void> {
  await settle();
  void leadId;
  void agentId;
}

/**
 * Agent jumps into the thread. Freezes the AI on this lead until resume/resolve.
 * The acting agent comes from the session server-side, not from the caller — a
 * client that can name whose behalf it acts on is a client that can act as
 * someone else.
 */
export async function takeOver(leadId: string): Promise<void> {
  await settle();
  void leadId;
}

/** Hands the thread back to the AI. */
export async function resumeAI(leadId: string): Promise<void> {
  await settle();
  void leadId;
}

export async function resolveLead(
  leadId: string,
  outcome: "won" | "lost",
): Promise<void> {
  await settle();
  void leadId;
  void outcome;
}

export async function flagConversation(input: {
  leadId: string;
  aiSaid: string;
  whatWasWrong: string;
  correctAnswer: string;
}): Promise<void> {
  await settle();
  void input;
}

export async function approveCorrection(id: string): Promise<void> {
  await settle();
  void id;
}

export async function dismissCorrection(id: string): Promise<void> {
  await settle();
  void id;
}

/**
 * Long-running in reality (Apify can take minutes). Over HTTP this becomes
 * `POST /sync → { jobId }` plus polling; the UI already models running, ok,
 * partial, empty, and failed, so only this body changes.
 */
export async function syncListings(): Promise<void> {
  await settle(2200);
}

export async function createListing(input: unknown): Promise<void> {
  await settle();
  void input;
}

export async function archiveListing(id: string): Promise<void> {
  await settle();
  void id;
}

export async function addAgent(input: unknown): Promise<void> {
  await settle();
  void input;
}

export async function removeAgent(id: string): Promise<void> {
  await settle();
  void id;
}

export async function setAiPaused(paused: boolean): Promise<void> {
  await settle();
  void paused;
}

export async function updateAgencySettings(input: unknown): Promise<void> {
  await settle();
  void input;
}
