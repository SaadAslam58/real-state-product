/**
 * THE API CONTRACT.
 *
 * These types are not fixture shapes — they are the interface the backend has to
 * satisfy. `lib/data/*` exposes async functions over them; today those functions
 * read from `lib/data/fixtures.ts`, later they read from the real service. Nothing
 * else about the UI changes. That only holds if this file is treated as a
 * contract rather than a convenience, so: additive changes are cheap, renames and
 * type-narrowings are coordinated changes with whoever implements the server.
 *
 * Conventions used throughout:
 *   - Every timestamp is an ISO 8601 string in UTC. Never a Date object (they do
 *     not survive the server/client boundary) and never a unix number.
 *   - Every money value is a whole number of AED. No floats, no minor units.
 *   - Absent means `null`, never `undefined` and never an empty string. A `null`
 *     renders as "not yet established"; an empty string renders as a UI bug.
 */

// ─────────────────────────────────────────────────────────────
// People and access
// ─────────────────────────────────────────────────────────────

/**
 * An owner sees every lead in the agency. An agent sees only leads assigned to
 * them — agents compete for commission and will not accept colleagues browsing
 * their conversations.
 *
 * IMPORTANT: scoping by this field in the UI is a display filter, not a security
 * boundary. See SECURITY.md and TODOS.md T-01.
 */
export type Role = "owner" | "agent";

export interface Agent {
  id: string;
  name: string;
  role: Role;
  email: string;
  /** E.164, e.g. "+971501234567". */
  phone: string;
  avatarUrl: string | null;
  /** Inactive agents keep their history but drop out of round-robin assignment. */
  active: boolean;
  joinedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Lead stage — the single source of truth for the pipeline
// ─────────────────────────────────────────────────────────────

/**
 * Ordered. `STAGE_ORDER` in lib/status.ts depends on this order for the pipeline
 * display, so do not reorder without updating it.
 */
export type Stage = "new" | "qualifying" | "ready_to_view" | "closed";

/**
 * Attention is a separate axis from stage. A lead is at some stage AND may or may
 * not need someone right now. Collapsing the two into one status ramp is what makes
 * most CRM dashboards impossible to scan.
 *
 * Derived, never stored — see `attentionFor()` in lib/status.ts.
 */
export type AttentionState = "none" | "handoff_pending" | "handoff_overdue";

// ─────────────────────────────────────────────────────────────
// Conversation
// ─────────────────────────────────────────────────────────────

interface TurnBase {
  id: string;
  at: string;
}

export interface CustomerTurn extends TurnBase {
  kind: "customer";
  /** Attacker-controlled. Render as text only — never dangerouslySetInnerHTML. */
  text: string;
}

export interface AiTurn extends TurnBase {
  kind: "ai";
  text: string;
}

export interface AgentTurn extends TurnBase {
  kind: "agent";
  text: string;
  agentId: string;
}

export interface ImageTurn extends TurnBase {
  kind: "image";
  author: "customer" | "ai" | "agent";
  imageUrl: string;
  caption: string | null;
  /** Set when the AI sent a photo of a specific listing. */
  listingId: string | null;
  agentId: string | null;
}

/**
 * Handoff is a turn inside the thread, not metadata beside it. That is what lets
 * the conversation spine change colour at the exact scroll position where the
 * machine stopped and a human started — and it keeps "who was notified, when"
 * inside the timeline where it reads naturally.
 */
export interface HandoffTurn extends TurnBase {
  kind: "handoff";
  toAgentId: string;
  reason: string;
}

/** An agent explicitly handing the thread back to the AI. */
export interface ResumeTurn extends TurnBase {
  kind: "resume";
  byAgentId: string;
}

export type Turn =
  | CustomerTurn
  | AiTurn
  | AgentTurn
  | ImageTurn
  | HandoffTurn
  | ResumeTurn;

// ─────────────────────────────────────────────────────────────
// What the AI has worked out so far
// ─────────────────────────────────────────────────────────────

/**
 * Every field is nullable on purpose. The AI extracts these over the course of a
 * conversation, so early on most of them are genuinely unknown. A null renders as
 * "not yet established", which is honest; a blank row reads as a broken panel.
 */
export interface Extraction {
  budgetMinAED: number | null;
  budgetMaxAED: number | null;
  intent: "buy" | "rent" | null;
  /** Areas the customer named, in the order they named them. */
  areas: string[];
  /** Free text as the customer phrased it, e.g. "before Ramadan". */
  timeline: string | null;
  urgency: "low" | "medium" | "high" | null;
}

// ─────────────────────────────────────────────────────────────
// Lead
// ─────────────────────────────────────────────────────────────

export interface Handoff {
  requestedAt: string;
  /** The agent who was notified. */
  agentId: string;
  /** Null until that agent opens or takes over the thread. */
  acknowledgedAt: string | null;
}

export interface Lead {
  id: string;
  /**
   * Null when the customer has not given a name. The table falls back to the
   * phone number — never to "Unknown".
   */
  contactName: string | null;
  /** E.164. Also the merge key: a repeat contact reuses the existing lead. */
  phone: string;
  stage: Stage;
  /**
   * Only meaningful when `stage === "closed"`; null otherwise.
   *
   * The brief specifies four stages and this keeps all four exactly as specified —
   * but "Closed" on its own cannot answer "how many did we actually close?", which
   * for a commission-driven agency is the only number that matters. An outcome
   * field answers it without adding a fifth stage or touching the pipeline model.
   */
  closedOutcome: "won" | "lost" | null;
  assignedAgentId: string | null;
  /** The listing the customer asked about, if the AI could pin one down. */
  listingId: string | null;
  createdAt: string;
  lastMessageAt: string;
  handoff: Handoff | null;
  /**
   * True from the moment of handoff until an agent resumes AI handling or resolves
   * the lead. While true the AI does not auto-reply on this thread, so it cannot
   * talk over a human mid-conversation.
   */
  aiPaused: boolean;
  extraction: Extraction;
  messageCount: number;
  /**
   * One-line preview of the newest turn, denormalised onto the lead.
   *
   * Without this the leads table is twelve rows of names and an owner has to
   * open every one to triage. With it, the table is scannable — which is the
   * whole job of that screen.
   */
  lastMessage: {
    from: "customer" | "ai" | "agent";
    preview: string;
  } | null;
  /**
   * Internal notes. Never sent to the customer — "he's a time-waster, third
   * time asking" is exactly the kind of thing agents need to record and exactly
   * the kind of thing that must never reach WhatsApp.
   */
  notes: LeadNote[];
}

export interface LeadNote {
  id: string;
  agentId: string;
  at: string;
  body: string;
}

/** A lead plus its thread. Returned by `getLead`; the list view does not need turns. */
export interface LeadDetail extends Lead {
  turns: Turn[];
}

// ─────────────────────────────────────────────────────────────
// Listings
// ─────────────────────────────────────────────────────────────

/**
 * Synced listings auto-update from the portal on every sync and must not be hand
 * edited — an edit would be overwritten silently. Manual listings are the agency's
 * own and are never touched by a sync. The distinction changes what the user is
 * allowed to do, so it gets a visually distinct row treatment, not a small label.
 */
export type ListingSource = "synced" | "manual";

export type ListingStatus = "available" | "reserved" | "let" | "sold" | "archived";

export type PricePeriod = "sale" | "yearly" | "monthly";

export interface Listing {
  id: string;
  /** Agency-facing reference, shown in mono. */
  reference: string;
  title: string;
  /** Community, e.g. "Dubai Marina". The unit customers actually search by. */
  area: string;
  address: string;
  priceAED: number;
  pricePeriod: PricePeriod;
  beds: number;
  baths: number;
  sizeSqft: number;
  source: ListingSource;
  sourcePortal: "bayut" | "propertyfinder" | null;
  status: ListingStatus;
  /**
   * Never empty. Synced listings carry photo URLs from the source; manual entries
   * require an upload. The AI sends these directly in WhatsApp, so a listing with
   * no photo is a listing the AI can only describe in words.
   */
  photos: string[];
  description: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Knowledge / corrections
// ─────────────────────────────────────────────────────────────

export type CorrectionStatus = "pending" | "approved" | "dismissed";

/**
 * SECURITY: `correctAnswer` is free text written by an agency user that the AI
 * will read in every future conversation. It is untrusted data, not an
 * instruction. The backend must inject it delimited and labelled, and scope
 * retrieval by agency. See SECURITY.md and TODOS.md T-02.
 */
export interface Correction {
  id: string;
  status: CorrectionStatus;
  leadId: string | null;
  /** Denormalised so the knowledge screen reads without a join. */
  leadContactLabel: string | null;
  /** Verbatim, so the reviewer sees exactly what the AI said. */
  aiSaid: string;
  whatWasWrong: string;
  correctAnswer: string;
  flaggedByAgentId: string;
  flaggedAt: string;
  /** Who made this part of the AI's reference, and when. Audit, not decoration. */
  approvedByAgentId: string | null;
  approvedAt: string | null;
}

// ─────────────────────────────────────────────────────────────
// Agency and settings
// ─────────────────────────────────────────────────────────────

export type WhatsAppVerification = "verified" | "pending" | "unverified";

export interface WhatsAppConnection {
  connected: boolean;
  /** E.164. Null before onboarding step 1 is completed. */
  number: string | null;
  displayName: string | null;
  verification: WhatsAppVerification;
  connectedAt: string | null;
}

export type SyncStatus = "ok" | "partial" | "failed" | "empty" | "never";

/**
 * `attemptedAt` and `succeededAt` are separate on purpose. "Last synced 09:00" hides
 * a 14:20 failure; showing both is the single most useful operational detail on the
 * listings screen.
 */
export interface SyncState {
  status: SyncStatus;
  attemptedAt: string | null;
  succeededAt: string | null;
  imported: number;
  failed: number;
  message: string | null;
}

export type NotificationChannel = "whatsapp" | "email" | "both";

export interface Agency {
  id: string;
  name: string;
  tradeLicense: string | null;
  email: string;
  phone: string;
  address: string | null;
  whatsapp: WhatsAppConnection;
  /**
   * Global pause. Inquiries queue for a human instead of being auto-answered —
   * for holidays and office closures. Distinct from per-lead `aiPaused`, which is
   * set by a handoff.
   */
  aiPaused: boolean;
  /**
   * Minutes before an unacknowledged handoff counts as overdue. Configurable
   * because a threshold that cries wolf overnight gets ignored, and the UAE
   * weekend is Friday–Saturday.
   */
  overdueThresholdMinutes: number;
  notifications: {
    handoffChannel: NotificationChannel;
    recipients: string[];
  };
  sync: SyncState;
  /** False until onboarding has been completed or explicitly skipped. */
  onboardingComplete: boolean;
}

// ─────────────────────────────────────────────────────────────
// Dashboard aggregates
// ─────────────────────────────────────────────────────────────

export interface AgentStat {
  agentId: string;
  assignedCount: number;
  /** Null when the agent has not yet replied to anything — not zero. */
  avgResponseMinutes: number | null;
  overdueCount: number;
}

export type ActivityKind =
  | "lead_created"
  | "handoff_requested"
  | "agent_took_over"
  | "ai_resumed"
  | "lead_resolved"
  | "stage_changed"
  | "listing_synced"
  | "correction_flagged"
  | "correction_approved"
  | "message_filtered";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  at: string;
  /** Pre-composed summary line. The backend owns the wording. */
  summary: string;
  leadId: string | null;
  agentId: string | null;
}

export interface DashboardSummary {
  newLeadsToday: number;
  /** Same window, previous day. A count with no baseline is decoration. */
  newLeadsYesterday: number;
  awaitingHandoff: number;
  overdueHandoffs: number;
  activeConversations: number;
  listingsSynced: number;
  pendingCorrections: number;
  /**
   * Inbound WhatsApp messages the AI classified as not property-related today —
   * wrong numbers, spam, job inquiries. Shown as a count so the filtering is
   * visible and therefore trustworthy, rather than silent.
   */
  filteredToday: number;
}

// ─────────────────────────────────────────────────────────────
// Transport shapes
// ─────────────────────────────────────────────────────────────

/**
 * Every list endpoint is paginated from day one — including the ones that return
 * eight rows today. Retrofitting pagination into a contract the backend has
 * already implemented is the expensive version of this decision.
 */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type DataErrorCode =
  | "network"
  | "auth"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "sync_failed"
  | "sync_partial"
  | "sync_empty"
  | "upload_too_large"
  | "upload_type"
  | "unknown";

/**
 * One error type across the whole data layer so every surface can branch on
 * `code` instead of string-matching messages. `message` is safe to show a user.
 */
export class DataError extends Error {
  readonly code: DataErrorCode;
  readonly detail: string | null;

  constructor(code: DataErrorCode, message: string, detail: string | null = null) {
    super(message);
    this.name = "DataError";
    this.code = code;
    this.detail = detail;
  }
}

export function isDataError(e: unknown): e is DataError {
  return e instanceof DataError;
}

// ─────────────────────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────────────────────

export interface Session {
  agent: Agent;
  agencyId: string;
}

/** Filters accepted by `getLeads`. All optional; omitted means "no constraint". */
export interface LeadQuery {
  stage?: Stage | "all";
  assignedAgentId?: string | "all" | "unassigned";
  /** Matches contact name, phone, or the linked listing's reference/area. */
  search?: string;
  attention?: AttentionState | "all";
  page?: number;
  pageSize?: number;
}

export interface ListingQuery {
  source?: ListingSource | "all";
  status?: ListingStatus | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}
