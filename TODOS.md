# TODOS — Gehox Agency Dashboard

Deferred work, with enough context to pick up cold. Sourced from the `/autoplan`
review pipeline (CEO / Design / Eng / DX phases) run on 2026-08-09.

---

## P1 — required before this UI carries real data

### T-01 · Enforce lead visibility on the server
**What:** Move role scoping out of the client and into whatever serves `getLeads` / `getLead`.
**Why:** Today an agent who edits the URL to another agent's lead id sees that lead. The brief's stated reason for role separation is that agents compete for commission — so this is a real confidentiality requirement, not a nicety. Client-side filtering is a display filter, never a boundary.
**Pros:** Closes the IDOR. Makes the stated feature actually true.
**Cons:** Requires the backend to exist.
**Context:** Scoping already lives in `src/lib/rbac.ts` and is called from `src/lib/data/*`, never from components — that placement is deliberate so this change is one file, not nine.
**Effort:** human M → CC S · **Priority:** P1 · **Blocked by:** backend + auth.

### T-02 · Treat approved corrections as untrusted data in the AI prompt
**What:** When corrections are injected into the AI's context, delimit and label them as reference data, never as system instructions. Scope retrieval by agency id.
**Why:** An approved correction is free text written by an agency user that the AI follows in every future conversation. Unlabelled, it is a prompt-injection vector; unscoped, one client's rules answer another client's customers.
**Pros:** Removes the sharpest edge on the product's best feature.
**Cons:** None. This is a contract requirement.
**Context:** The UI side is already built — the approval dialog shows the verbatim text and records `approvedBy` / `approvedAt`. This TODO is the backend half.
**Effort:** human S → CC S · **Priority:** P1 · **Blocked by:** backend.

### T-03 · Validate photo uploads server-side
**What:** Magic-byte validation, 5 MB cap, allow only `image/jpeg`, `image/png`, `image/webp`. Reject SVG outright.
**Why:** The client-side accept filter is a convenience, not a control. SVG is scriptable.
**Effort:** human S → CC S · **Priority:** P1 · **Blocked by:** upload endpoint.

---

## P2 — should land soon after

### T-04 · Business-hours awareness on the overdue-handoff clock
**What:** The overdue threshold should not accrue outside the agency's working hours or on the UAE weekend (Fri–Sat).
**Why:** A lead that arrives at 22:00 is not "neglected" at 23:00. A threshold that cries wolf overnight and every Friday gets ignored within a week, which defeats the whole feature.
**Pros:** The one number the dashboard leads with stays trustworthy.
**Cons:** Needs a working-hours model per agency plus timezone handling. That is a real data-model addition, not a UI tweak.
**Context:** The threshold itself is already configurable in Settings (default 60 min) and read via `getAgency()`. This TODO adds the schedule dimension on top.
**Effort:** human M → CC S · **Priority:** P2 · **Depends on:** agency settings persistence.

### T-05 · Real-time updates for new leads and handoffs
**What:** Push (SSE or websocket) so a new overdue handoff appears without a refresh.
**Why:** The dashboard's core claim is time-sensitivity. A stale page undermines it — the owner is looking at a number that was true five minutes ago.
**Cons:** Connection management, reconnect, and a "what changed" affordance so the page does not shift under the reader's cursor.
**Effort:** human L → CC M · **Priority:** P2 · **Depends on:** backend.

### T-06 · Assignment audit trail
**What:** Record and display why a lead landed with a given agent (round-robin position, manual reassign by whom, when).
**Why:** Round-robin is invisible. When an agent asks "why did I get this one and not that one," there is currently no answer, and in a commission-driven team that question gets asked.
**Effort:** human S → CC S · **Priority:** P2.

---

## P3 — genuinely nice, not load-bearing

### T-07 · Full RTL / Arabic localization of the dashboard chrome
**What:** Mirror the whole UI for Arabic, not just message content.
**Why:** Some Dubai agency staff would prefer an Arabic interface.
**Context:** Already shipped in this build: `dir="auto"` on all customer message content, so an Arabic WhatsApp message renders right-to-left correctly inside the thread. That covers the case that actually looks broken. Full chrome RTL is a much larger surface (layout mirroring, icon direction, the spine sidebar) with no stated demand yet.
**Effort:** human L → CC M · **Priority:** P3.

### T-08 · Command palette (⌘K)
**What:** Jump to any lead, listing, or screen by typing.
**Why:** An owner scanning 40 leads a day would use it constantly.
**Cons:** Adds a dependency or a hand-rolled combobox with real a11y requirements.
**Effort:** human M → CC S · **Priority:** P3.

### T-09 · Virtualized rendering for very long threads and tables
**What:** Windowing for conversations beyond a few hundred turns and tables beyond a few hundred rows.
**Why:** Not a problem at realistic agency scale — pagination already handles tables, and property inquiries rarely exceed 100 turns. Recorded so the ceiling is known rather than discovered.
**Effort:** human M → CC S · **Priority:** P3.

### T-10 · Second-vertical generalization
**What:** If Gehox onboards a non-real-estate client, the domain nouns (Listings, bed/bath, "Ready to view", Bayut/Property Finder) need to become configurable rather than hardcoded.
**Why:** The marketing site deliberately keeps its positioning open beyond real estate. This product build is intentionally real-estate-specific because that is what the brief specified and specificity is what makes it good. Recorded so the cost of generalizing later is a known number rather than a surprise.
**Context:** The design system layer (`DataTable`, `EmptyState`, `StageBadge`, tokens) is already vertical-neutral. Only the domain types, copy, and the listings screen are real-estate-shaped.
**Effort:** human L → CC M · **Priority:** P3.
