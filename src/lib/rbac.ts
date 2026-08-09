import type { Lead, Session } from "./types";

/**
 * Lead visibility scoping.
 *
 * ⚠️  THIS IS NOT A SECURITY BOUNDARY IN THIS BUILD.
 *
 * Everything runs client-reachable over fixture data, so scoping here is a display
 * filter. An agent who edits the URL to another agent's lead id can still reach it.
 * That is acceptable for a UI-layer build and unacceptable the moment real data
 * lands. See SECURITY.md and TODOS.md T-01.
 *
 * It lives in `lib/` rather than in components on purpose: this module is the one
 * that becomes a server-side check, so enforcing it here means the fix is one file
 * instead of nine screens.
 */

export function isOwner(session: Session): boolean {
  return session.agent.role === "owner";
}

/**
 * Owners see the whole agency. Agents see only what is assigned to them — the
 * brief's reasoning is that agents compete for commission and will not accept
 * colleagues browsing their conversations.
 */
export function canViewLead(session: Session, lead: Pick<Lead, "assignedAgentId">): boolean {
  if (isOwner(session)) return true;
  return lead.assignedAgentId === session.agent.id;
}

export function scopeLeads<T extends Pick<Lead, "assignedAgentId">>(
  session: Session,
  leads: T[],
): T[] {
  if (isOwner(session)) return leads;
  return leads.filter((l) => l.assignedAgentId === session.agent.id);
}

/** Only owners manage the roster. An agent removing a colleague is not a thing. */
export function canManageTeam(session: Session): boolean {
  return isOwner(session);
}

/**
 * Only owners approve corrections. Approving changes AI behaviour for every future
 * customer of the agency, so it is deliberately not something any agent can do
 * alone — that gate is the difference between this and ungoverned self-retraining.
 */
export function canApproveCorrections(session: Session): boolean {
  return isOwner(session);
}

/** Anyone can flag. Raising a hand should be frictionless; acting on it should not. */
export function canFlagConversation(): boolean {
  return true;
}

/** Agency-wide settings — WhatsApp connection, Pause AI, notification routing. */
export function canEditAgencySettings(session: Session): boolean {
  return isOwner(session);
}

/** Both roles can reassign: owners reallocate, agents hand off when they are stuck. */
export function canReassignLead(): boolean {
  return true;
}
