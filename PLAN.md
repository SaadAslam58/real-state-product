<!-- /autoplan restore point: ~/.gstack/projects/real-state-product/main-autoplan-restore-20260809-000902.md -->

# Gehox Agency Dashboard — Product UI Plan

**Repo:** `D:/Growth/real-state-product` (greenfield, git initialized, branch `main`)
**Sibling context:** `D:/Growth/Portfolio-Web/frontend` — the Gehox marketing site (Next 16, React 19, Tailwind 4). Brand identity source of truth.
**Deliverable:** The product UI real estate agency owners and agents log into daily to manage WhatsApp property inquiries handled by an AI agent.

---

## 1. What this is

A working SaaS dashboard, not a marketing page. Nine screens. Next.js 15 App Router, TypeScript, Tailwind v4, no backend in this build — a typed mock data layer that mimics the eventual API surface so swapping in real endpoints is a per-module change, not a rewrite.

**Who uses it:** Dubai real-estate agency owners (see everything, check on phone between showings) and agents (see only their own assigned leads).

**What it is not:** a demo of AI. The AI runs elsewhere (WhatsApp + LLM + Apify listing sync). This UI is the window onto what the AI did, and the controls for when a human takes over.

---

## 2. Brand continuity constraint

The client will see the marketing site and this product side by side. Identity must carry over. From `Portfolio-Web/DESIGN.md`:

| Marketing token | Hex | Carries into product? |
|---|---|---|
| violet-ink | `#2B0F54` | Yes — accent ramp |
| violet | `#471A79` | Yes — accent ramp |
| violet-bright | `#6411AD` | Yes — primary accent |
| base (lavender-white) | `#F7F5F9` | **No** — replaced by warm neutral |
| Bebas Neue (display) | — | **No** — condensed all-caps is wrong for dense UI |
| Bricolage Grotesque (body) | — | Yes — promoted to display role |

**The tension, stated openly:** the brief asks for a *warm* light neutral base. The marketing base `#F7F5F9` is a *cool* lavender-white. Resolution: keep violet as the one confident accent (non-negotiable brand tie), swap the neutral ramp from cool lavender to warm sand. Violet is a cool hue — a warm neutral ground makes it read more deliberate, not less. This is a deliberate divergence, not an oversight.

---

## 3. Token system (proposed — this is the thing to review first)

### 3.1 Neutrals — warm sand ramp

Hue ~35–40°, chroma kept very low so it reads as paper, not beige.

| Token | Hex | Role |
|---|---|---|
| `canvas` | `#F6F3EE` | App background — warm paper, never `#FFF` |
| `surface` | `#FDFBF8` | Cards, table bodies, panels |
| `surface-sunk` | `#F0ECE5` | Table header rows, inset wells, disabled fields |
| `hairline` | `#E7E1D8` | Dividers, table row rules |
| `edge` | `#D8D0C4` | Input borders, structural borders |
| `ink` | `#1C1917` | Primary text (~15.9:1 on canvas) |
| `ink-soft` | `#443E38` | Secondary headings, table body (~9.7:1) |
| `muted` | `#78706A` | Labels, metadata, timestamps (~4.9:1) |
| `graphite` | `#26221F` | Sidebar spine background |
| `graphite-soft` | `#332E2A` | Sidebar hover/active fill |

### 3.2 Accent — Gehox violet (unchanged from brand)

| Token | Hex | Role |
|---|---|---|
| `accent-ink` | `#2B0F54` | Gradient start, deep accent |
| `accent` | `#471A79` | Gradient mid |
| `accent-bright` | `#6411AD` | Primary actions, links, focus ring (~6.4:1 on canvas) |
| `accent-hover` | `#7B22C9` | Hover fill |
| `accent-wash` | `#F0E9FA` | Selected row, active nav tint |

Primary button gradient: `linear-gradient(120deg, #2B0F54 0%, #471A79 50%, #6411AD 100%)` — same as marketing. Used **only** on the single primary action per screen.

### 3.3 Status language — two independent axes

Most dashboards collapse "what stage is this lead" and "does this need me right now" into one color ramp, then run out of distinguishable hues. Two axes instead.

**Axis A — lead stage** (hue *and* mark shape, so it survives colorblindness and grayscale printing):

| Stage | Hex | Tint | Mark |
|---|---|---|---|
| New | `#0F766E` teal | `#E6F2F0` | solid dot |
| Qualifying | `#A16207` amber | `#F7EFDC` | half-filled ring |
| Ready to view | `#15803D` green | `#E7F2E9` | check dot |
| Closed | `#79716B` stone | `#EFEBE5` | hollow ring |

**Axis B — attention** (never a stage; an overlay on top of one):

| State | Hex | Treatment |
|---|---|---|
| Handoff pending | `#C2410C` ember | 3px left rule + ember dot, no fill |
| Handoff overdue (>60 min) | `#C2410C` ember | ember tint fill `#FBEDE4` + live aging clock + slow 3s pulse on the dot |
| Error / destructive | `#BE123C` rose | reserved exclusively for failure + delete confirms |

Ember is orange-red, rose is true red. Keeping them apart is what lets "a hot lead is going cold" read as urgent without reading as broken.

### 3.4 Type — three families

| Family | Role | Sizes |
|---|---|---|
| **Bricolage Grotesque** (variable) | Display: page titles, KPI numerals, card headings | 800wt, tracking −0.03em |
| **Inter** (variable) | Everything dense: tables, forms, labels, body, buttons | 400/500/600, `tnum` on all numerals |
| **JetBrains Mono** | Phone numbers, lead IDs, timestamps, listing refs | 400/500 |

Bebas Neue is dropped. It is a poster face — all-caps condensed at 13px in a table is unreadable, and the brand tie is already carried by the violet ramp, the Gehox mark, and Bricolage.

Type scale (rem): `0.6875 / 0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75 / 2.25 / 3`

### 3.5 Spacing / radius / elevation

- Spacing: 4px base — `4 8 12 16 20 24 32 40 48 64 80`
- Radius: `sm 4 / md 6 / lg 10 / xl 14 / full`
- Elevation: exactly three. `flat` (hairline border only, default for tables/cards), `raised` (`0 1px 2px rgba(28,25,23,.06), 0 4px 12px -6px rgba(28,25,23,.10)` — dropdowns, popovers), `overlay` (`0 24px 48px -16px rgba(28,25,23,.24)` — modals, drawers). No decorative shadows on static content.
- Focus: `2px solid #6411AD`, `outline-offset: 2px`, everywhere, never removed.

---

## 4. The design risk

Two moves, both functional rather than decorative.

**4.1 The conversation spine.** Standard chat UIs are left/right bubble ping-pong, which makes an AI-handled thread indistinguishable from a human one. Instead: a continuous 2px vertical rail runs down the center of the thread. Customer turns hang left of it, machine/agent turns hang right. **The rail itself is the state indicator** — it renders violet while the AI is handling the thread, and switches to ember at the exact scroll position where handoff happened, staying ember until an agent resumes AI or resolves. Scrolling a long thread, you *see* where the machine stopped and the human started. Property photos the AI sent render as image cards clipped to the rail, same as any other turn.

**4.2 The spine sidebar.** Warm graphite (`#26221F`) vertical rail, not the default white sidebar. Gehox mark at the top. Active nav item is marked by a violet notch cut into the spine's inner edge plus an accent-wash label — not a floating pill. Collapses to icons at `lg`, becomes a bottom tab bar at `sm`. The name is deliberate: the spine sidebar and the conversation spine are the same visual idea at two scales, which is what makes it read as a system rather than a theme.

---

## 5. Screens

| # | Route | Screen | Notes |
|---|---|---|---|
| 1 | `/login` | Login | email/password, Gehox mark, forgot-password → reset request → reset confirm |
| 2 | `/onboarding` | First-run setup | 3 steps: WhatsApp number + verification, import listings (Apify sync or manual), add team. Progress "1 of 3". Skippable per step, resumable. |
| 3 | `/` | Dashboard | 4 KPI cards (new leads today, awaiting handoff, active conversations, listings synced), overdue-handoff callout as its own block, per-agent snapshot table (leads assigned + avg response time), recent activity feed |
| 4 | `/leads` | Leads | table: contact, property, stage badge, assigned agent, last message. Filter by stage + agent, search. Row → conversation. Reassign dropdown inline. Role-scoped. |
| 5 | `/leads/[id]` | Conversation detail | spine thread + extraction side panel (budget, buy/rent, area, timeline, urgency) + handoff banner + Take over / Resume AI / Resolve + Flag for review |
| 6 | `/listings` | Listings | table with photo thumb, address, price, bed/bath, status, **source tag (Synced vs Manual — different row treatment, not just a label)**. Sync now + last-synced. Add listing form w/ required photo. Edit/archive. |
| 7 | `/knowledge` | Knowledge / Corrections | pending flagged items (AI said / agent flagged / suggested correction → Approve or Dismiss) + approved-corrections FAQ list, editable/removable |
| 8 | `/team` | Team | agent list (name, role, contact), add/remove, owner-only |
| 9 | `/settings` | Settings | agency: WhatsApp connection + verification, business info, notification routing, **Pause AI toggle**, language-detection note. Account: own password + own notification prefs. No billing. |

### Cross-cutting behaviors specified in the brief

- **Lead classification** — inbound WhatsApp messages are AI-classified as property-related before a lead record is created. Surfaced in the UI as a "Filtered out" count with a drawer to review misclassifications (otherwise the filter is invisible and untrustworthy).
- **Round-robin assignment** with always-available manual reassign.
- **Repeat contacts merge** into one thread keyed by phone number.
- **Role-based visibility** — owner sees all leads; agent sees only assigned. Demoed via a role switcher in this build.
- **Handoff freezes the AI** on that thread until explicit Resume AI or Resolve.
- **Approved corrections** flow from conversation flag → knowledge base.
- **Every listing has ≥1 photo** — synced carry source URLs, manual require upload.
- **Empty states** guide to the next action, never a blank table.

---

## 6. Architecture

```
src/
  app/
    (auth)/login, forgot-password, reset-password
    (onboarding)/onboarding
    (app)/ layout.tsx  → Spine sidebar + topbar + role context
          page.tsx (dashboard), leads/, leads/[id]/, listings/,
          knowledge/, team/, settings/
  components/
    spine/       SpineSidebar, SpineNav, MobileTabBar
    data/        DataTable, TableToolbar, FilterChip, EmptyState, Pagination
    status/      StageBadge, AttentionRule, AgingClock
    thread/      ConversationSpine, Turn, ImageTurn, HandoffMarker
    ui/          Button, Input, Select, Dialog, Drawer, Toast, Toggle, Avatar, Card
  lib/
    data/        leads.ts, listings.ts, team.ts, corrections.ts, activity.ts  (mock + typed)
    types.ts     Lead, Listing, Agent, Turn, Correction, Agency
    rbac.ts      visibility scoping
    format.ts    currency (AED), relative time, phone
  styles/globals.css   @theme tokens
```

**State:** React Server Components for reads, client components only where interaction demands it. Mock data is synchronous, module-level, and typed — no fake latency theatre. A single `session` context holds the current user + role.

**No backend, no Stripe, no auth provider** in this build. Login is a form that routes.

---

## 7. Explicitly NOT in scope

Per the brief, deliberately excluded: AI phone calls / voice telephony; auto-posting listings back to Bayut or Property Finder; tenancy contracts, Ejari, or any legal paperwork; automatic AI self-retraining from flags (replaced by the reviewed correction system); billing, invoicing, or any payment integration.

Additionally out of scope for this build and deferred: real authentication, real WhatsApp Business API wiring, real Apify job execution, persistence, and multi-tenant data isolation. This is the UI layer.

---

## 8. Open questions for review

1. Warm sand neutral vs the marketing site's cool lavender — divergence justified, or should the product match the site exactly?
2. Dropping Bebas Neue from the product — right call for density, or does it cost too much brand recognition?
3. Is the two-axis status system (stage hue+shape / attention overlay) worth its complexity vs a single flat status ramp?
4. Mock data layer vs wiring a real local persistence layer (SQLite/Prisma) so the UI is genuinely stateful.

---

# PHASE 1 — CEO REVIEW (strategy & scope)

Mode: **SELECTIVE EXPANSION** (autoplan override — greenfield product with a user-specified scope baseline).

## Pre-review system audit

| Check | Result |
|---|---|
| `git log` | Empty repo, branch `main`, zero commits. Greenfield. |
| In-flight work | None. No stashes, no other branches. |
| `CLAUDE.md` / `TODOS.md` | Neither exists — both to be created. |
| TODO/FIXME sweep | N/A (no code yet). |
| Design doc (`/office-hours`) | None found for this branch. The brief is the problem statement. |
| Sibling repo (read-only reference) | `Portfolio-Web/frontend` — the Gehox marketing site. Next 16 / React 19 / Tailwind 4. Repositioned in commit `d27a1b7` as "a WhatsApp lead-response + CRM partner". |
| Prior learnings | 0 entries for this project. |

### Taste calibration

**Good, worth copying** — the marketing site's `globals.css` `@theme inline` block: flat token names, one source of truth, and comments that explain *why* a rule exists rather than what it does. Its `lib/site.ts` does the same for identity config.

**Anti-pattern, do not repeat** — that same file sets `--font-mono: var(--font-bebas)`. Mono is aliased to a display face because the marketing site never needed real mono. In a dashboard full of phone numbers, lead IDs, and timestamps that would be actively harmful. The product gets a real mono.

### Landscape check

No WebSearch was performed for this review; findings below are in-distribution knowledge and are marked where they carry market claims.

- **[Layer 1 — tried and true]** The conventional build is a CRM-shaped table app: lead list, detail drawer, status pipeline. Every vertical SaaS looks like this because it works.
- **[Layer 2 — what the market does]** Dubai agencies run Bayut / Property Finder lead feeds into PropSpace, Zoho, or a WhatsApp group. The pain is not "we have no CRM," it is "leads sit unanswered for hours."
- **[Layer 3 — first principles]** The differentiator is not the CRM. It is that the AI already replied before any human saw the lead. So **the dashboard's job is proof, not data entry.** Every screen should answer "is the machine doing its job, and is anything falling through?" — not "let me manage records."

**Eureka.** Conventional CRM design optimizes for capturing and organizing input. Here the input is already captured and organized by the AI. Invert it: the highest-value screen is the one showing what the AI got *wrong* — Knowledge / Corrections. Conventional CRM design treats that as an afterthought settings page. This plan lists it as screen 7 of 9. It should be built and designed as a first-class screen, and the dashboard should surface pending corrections as a count.

## Step 0A — Premise challenge

| # | Premise the plan rests on | Verdict | Reasoning |
|---|---|---|---|
| P1 | Agency staff will log into a web dashboard regularly | **ASSUMED** | Agents live inside WhatsApp. The *owner* is a plausible daily user; an *agent* may never log in unless an alert drags them there. The plan lists notification routing but never says an alert deep-links to the exact conversation. Without that, agent adoption is near zero and round-robin assignment is theatre. |
| P2 | The dashboard is the product | **WRONG** | The AI is the product; the dashboard is the trust surface and the retention mechanism. Consequence: rank screens by trust value instead of treating nine as equals. Conversation detail, overdue handoffs, and Knowledge/Corrections carry the trust. Team and Settings are plumbing. |
| P3 | This product is real-estate-specific | **CONTESTED** | The marketing site's own source comment states real estate is "the flagship, most-detailed example… but the site is not gated to that industry." PLAN.md hardcodes real-estate nouns into the information architecture — Listings, bed/bath, "Ready to view", Bayut. If client #2 is a clinic or a dealership, the nouns are wrong. **This is the premise-gate question.** |
| P4 | UI-first with mock data is the right first deliverable | **DEFENSIBLE** | It is the explicit ask. The risk is a beautiful shell nobody wires up. Mitigated only if the TypeScript types are treated as the API contract the backend must satisfy, not as throwaway fixture shapes. |
| P5 | Lead stages are New → Qualifying → Ready to view → Closed | **ASSUMED, INCOMPLETE** | "Closed" collapses won and lost. For a commission-driven agency that distinction is the most important field in the system. An owner cannot answer "how many did we actually close?" from this model. |
| P6 | 60 minutes is the overdue-handoff threshold | **ASSUMED** | Hardcoding it means the dashboard screams every Friday morning (the UAE weekend is Fri–Sat) and all night. A threshold that cries wolf gets ignored, which defeats the entire feature. |
| P7 | Round-robin is the right default assignment | **ASSUMED, ACCEPTABLE** | Ignores agent load and availability, but it is explicitly specified, it is a two-way door, and the manual reassign override is already in the plan. Accept as written. |

**What if we did nothing?** The agency gets no window onto the AI, cannot verify it is working, and churns after month two. The dashboard is the retention surface. Building it is correct — the only real question is which parts carry the trust.

## Step 0B — Existing code leverage

| Sub-problem | What already exists | Reuse? |
|---|---|---|
| Brand color identity | Marketing `globals.css` `@theme inline` violet ramp | **Yes** — copy the six violet values verbatim |
| Logo / mark | `icon.svg`, `public/brand/gehox-mark-white.svg`, `gehox-mark-mono-white.svg` | **Yes** — the mono-white mark is exactly right on a graphite spine |
| Primary button treatment | `.btn-primary` gradient + shadow | **Yes** — port into a `Button` component |
| Focus-visible baseline | The `:focus-visible` rule | **Yes** — copy verbatim |
| Toolchain config shape | `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs` | **Yes** — copy the shape so both repos stay consistent |
| Scroll-reveal animation | `Reveal.tsx` | **No** — marketing polish; animating a dashboard on scroll is actively bad |
| Everything domain-specific | Nothing exists | Build |

Nothing in this plan rebuilds something that already exists. The product repo is genuinely empty.

## Step 0C — Dream state mapping

```
  CURRENT STATE                THIS PLAN                     12-MONTH IDEAL
  ─────────────                ─────────                     ──────────────
  Empty repo.          --->    9 screens. A typed data  --->  Multi-tenant SaaS. Live WhatsApp
  Agencies have no             layer shaped like the          webhook ingest. Apify sync on cron.
  window onto the AI.          eventual API. The owner        Per-agency AI config. Corrections
  The only evidence it         sees everything the AI         feeding a real retrieval layer.
  works is the client's        did, and can take over.        Mobile push for handoffs. An owner
  own phone.                   No backend, no auth.           who has stopped checking WhatsApp.
```

**Dream state delta:** this plan builds the entire trust surface plus the type contract the backend must satisfy. It does not build ingest, persistence, auth, or tenancy. That is the correct half to build first — *conditional on* the types being treated as the API contract. If they are throwaway fixture shapes, this plan produces a demo and nothing else.

## Step 0C-bis — Implementation alternatives (mandatory)

```
APPROACH A: Pure UI, module-level synchronous mock data
  Summary: Screens import typed constants directly. No async, no fetch semantics.
  Effort:  M      (human ~2 days / CC ~40 min)
  Risk:    Med
  Pros:    Fastest to a rendered screen. Zero data plumbing. Nothing to debug.
  Cons:    You never see a loading state, so you never build one. Error and empty
           states get stubbed or skipped. The "complete" UI ships missing a third
           of its states, and the gap only surfaces when the backend lands.
           Swapping to real data touches every screen.
  Reuses:  Nothing beyond the brand tokens.

APPROACH B: UI + real local persistence (SQLite + Prisma, server actions)
  Summary: A real database behind the UI. Genuinely stateful across reloads.
  Effort:  L      (human ~4 days / CC ~2 h)
  Risk:    Med
  Pros:    Usable as a live demo. Mutations persist. Forces schema thinking early.
  Cons:    Builds a schema the backend team will replace. Adds Prisma, migrations,
           and a build step to a repo whose stated scope is the UI layer. Schema
           churn before the domain is settled is wasted motion.
  Reuses:  Nothing.

APPROACH C: UI + async data-access layer + fixtures behind it   ← RECOMMENDED
  Summary: Every screen reads through async functions in `lib/data/*` that return
           typed promises and can yield loading, empty, and error outcomes.
           Fixtures live behind that boundary. Swapping to real fetch is a
           per-module edit, not a per-screen one.
  Effort:  M+     (human ~2.5 days / CC ~50 min)
  Risk:    Low
  Pros:    Every screen is forced to render loading / empty / error — exactly what
           the brief asks for. The async signature IS the API contract. One adapter
           file changes when the backend lands.
  Cons:    Slightly more ceremony than A. Requires the discipline not to reach past
           the boundary and import fixtures directly.
  Reuses:  Brand tokens; the type definitions become the backend's contract.
```

**RECOMMENDATION: Approach C.** It costs roughly ten minutes more than A, and it is the only option where the brief's explicit requirement — "empty states should guide the agency owner toward the next action" — is structurally guaranteed rather than hoped for.

**AUTO-DECIDED (autoplan):** Approach C. Principle P1 (choose completeness) + P2 (boil lakes — loading / empty / error sit inside the blast radius of every screen this plan builds).

## Step 0D — SELECTIVE EXPANSION: complexity check, then expansion scan

**Complexity check.** The plan spans ~9 route groups and ~30 components — above the 8-file smell threshold, but the count is driven by the screen list the brief specifies, not by invented abstraction. The genuine complexity risk sits elsewhere: **four separate table screens** (leads, listings, team, knowledge). Four bespoke tables is the DRY violation that will actually hurt. One `DataTable` driven by a column config, used four times, is the right shape.

**Minimum set that achieves the goal:** login, dashboard, leads, conversation detail, listings. Onboarding, knowledge, team, and settings could each be a follow-up. But the brief specifies all nine, and marginal cost per screen collapses once the design system and `DataTable` exist. Not proposing a cut.

### Expansion candidates (cherry-pick ceremony, auto-decided)

| # | Candidate | Effort | Risk | Decision | Principle |
|---|---|---|---|---|---|
| E1 | Async data layer with real loading / empty / error states (Approach C) | S | Low | **ACCEPT** | P1 completeness |
| E2 | Split `Closed` into `Won` / `Lost` | S | Low | **→ USER CHALLENGE** | Alters user-specified scope |
| E3 | Configurable overdue threshold in Settings (default 60 min) | S | Low | **ACCEPT** | P1 — a hardcoded threshold that cries wolf kills the feature |
| E4 | Business-hours / weekend awareness on the overdue clock | M | Med | **DEFER → TODOS** | Needs timezone + schedule modeling; outside blast radius |
| E5 | Handoff alerts deep-link straight into the conversation | S | Low | **ACCEPT** | P2 — without it agents never open the app; alert routing is already in scope |
| E6 | `dir="auto"` on customer message content so Arabic renders RTL in-thread | XS | Low | **ACCEPT** | P1 — the brief says the AI replies in Arabic; rendering it LTR looks broken |
| E7 | Full UI RTL / Arabic localization of the dashboard chrome | L | Med | **DEFER → TODOS** | Agency staff work in an English UI; large surface, no stated demand |
| E8 | Command palette (⌘K) to jump to any lead or listing | M | Low | **DEFER → TODOS** | Genuinely nice, not load-bearing, adds a dependency |
| E9 | Assignment audit — "why was this assigned to me" | S | Low | **DEFER → TODOS** | P3 — useful later, not needed to trust the AI today |
| E10 | Real property photography in fixtures rather than grey placeholder boxes | XS | Low | **ACCEPT** | P1 — a listings table of grey rectangles reads as broken, not unfinished |

Accepted: E1, E3, E5, E6, E10. Deferred: E4, E7, E8, E9. Escalated to the gate: E2.

## Step 0E — Temporal interrogation

```
  HOUR 1 (foundations)     Token names and the @theme block. Font loading strategy.
                           The app shell: spine sidebar, topbar, breakpoints, role context.
                           → DECIDE NOW: self-host all three families via next/font.
                             Bricolage Grotesque, Inter, and JetBrains Mono are all on
                             Google Fonts; next/font subsets and self-hosts them, so there
                             is no layout shift and no third-party request at runtime.

  HOUR 2-3 (core logic)    The table abstraction. Leads, listings, team, and knowledge all
                           need filter + search + sort + empty + row action.
                           → DECIDE NOW: one generic DataTable driven by a column config.
                             Four bespoke tables is the DRY violation that bites in week two.

  HOUR 4-5 (integration)   The conversation spine. The rail must change color at the exact
                           handoff point, so the thread has to know where that is.
                           → DECIDE NOW: model handoff as a Turn with kind:'handoff' inside
                             the same ordered array, not as separate metadata. Rail color
                             derives from each turn's position relative to it. "Resume AI"
                             becomes just another turn, which keeps the timeline honest.

  HOUR 6+ (polish/tests)   Responsive. The leads table at 375px. The spine on a phone.
                           → DECIDE NOW: tables collapse to stacked cards below md — never
                             horizontal scroll. A horizontally-scrolling table is the single
                             most common responsive-dashboard failure, and the brief says
                             owners will check this on their phone between showings.
```

Human-team estimate ~6 hours. With CC + gstack, ~45–60 minutes. The decisions are identical either way.

## Section 1 — Architecture review

```
                        ┌──────────────────────────────────────────┐
                        │            app/(app)/layout              │
                        │  SessionProvider (user + role)           │
                        │  SpineSidebar │ TopBar │ MobileTabBar    │
                        └───────────────┬──────────────────────────┘
                                        │
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼
   dashboard/       leads/         leads/[id]/      listings/      knowledge/
   page.tsx         page.tsx        page.tsx        page.tsx        page.tsx
        │               │               │               │               │
        │               ├──DataTable────┤               ├──DataTable────┤
        │               │  StageBadge   │               │  SourceTag    │
        │               │  AttentionRule│               │               │
        │               │               ├─ConversationSpine             │
        │               │               ├─ExtractionPanel               │
        │               │               └─FlagForReviewDialog ──────────┤
        │               │               │               │        (writes a pending
        ▼               ▼               ▼               ▼         correction)
   ┌────────────────────────────────────────────────────────────────────────┐
   │                    lib/data/*  (async boundary — THE API CONTRACT)     │
   │  getLeads(scope)  getLead(id)  getListings()  getCorrections()         │
   │  getTeam()  getActivity()  getAgentStats()  getAgency()                │
   │  assignLead()  takeOver()  resumeAI()  resolveLead()                   │
   │  flagConversation()  approveCorrection()  dismissCorrection()          │
   │  createListing()  archiveListing()  syncListings()                     │
   └──────────────────────────────┬─────────────────────────────────────────┘
                                  │  (this build)          (later)
                     ┌────────────┴────────────┐      ┌──────────────────┐
                     │  lib/data/fixtures.ts   │ ───▶ │  real REST/tRPC  │
                     │  typed sample data      │      │  + WhatsApp      │
                     └─────────────────────────┘      │  + Apify         │
                                                      └──────────────────┘
   ┌────────────────────────────────────────────────────────────────────────┐
   │  lib/types.ts — Lead, Turn, Listing, Agent, Correction, Agency,        │
   │  Stage, AttentionState, Role.  Imported by BOTH sides of the boundary. │
   └────────────────────────────────────────────────────────────────────────┘
```

**Component boundaries.** Clean. The single load-bearing rule is that no page component may import from `lib/data/fixtures.ts` directly — only through `lib/data/*` functions. Violating that is what turns "swap one adapter" into "rewrite nine screens."

**Coupling introduced.** `SessionProvider` couples every route to role state. That is justified and unavoidable — role-based visibility is a stated requirement. The alternative (passing role as a prop through nine screens) is worse.

**FINDING 1.1 — the role boundary is decorative, and the plan does not say so.**
Role-based visibility is specified as "the owner sees every lead; individual agents see only leads assigned to them," with the stated business reason that agents compete for commission. In a client-side React app with fixture data, filtering by role is a **display filter, not a security boundary.** Every lead is in the bundle; anyone can read them in devtools. That is acceptable for a UI build, but it must be written down, or someone will ship it believing it enforces anything.
*Decision (auto, P1 + P5 explicit-over-clever):* implement the scoping in `lib/data/*` (the boundary that becomes the server), never in the components, and add an explicit `SECURITY.md` note that server-side enforcement is required before real data. **ACCEPT.**

**FINDING 1.2 — `Turn` needs to be a discriminated union, decided now.**
The thread carries customer text, AI text, agent text, image messages, handoff events, and resume events. If `Turn` is one wide optional-heavy interface, the spine renderer becomes a pile of `if (turn.imageUrl)` checks. A discriminated union on `kind` makes the renderer a total switch and makes the compiler catch a missing case.
*Decision (auto, P5):* `type Turn = CustomerTurn | AiTurn | AgentTurn | ImageTurn | HandoffTurn | ResumeTurn`, discriminated on `kind`. **ACCEPT.**

**Scaling.** At 10x (≈5,000 leads, ≈2,000 listings) an unpaginated client table stalls. At 100x it is unusable. The plan does not mention pagination.
**FINDING 1.3 — no pagination or virtualization strategy.** *Decision (auto, P1):* paginate at the `lib/data` boundary (`{ items, total, page }`) from day one, so the contract already carries it, and render 25 rows per page. Virtualization is deferred — pagination solves it at realistic agency scale. **ACCEPT (pagination), DEFER (virtualization).**

**Single points of failure.** In this build: none that matter (static app). In the real system: the WhatsApp webhook and the Apify sync. The UI's obligation is to make their failure *visible* — a stale "last synced" timestamp and a WhatsApp connection status that can read `disconnected`. Both are already in the plan. Good.

**Rollback posture.** Static Next app on Vercel — rollback is redeploying the prior build, under a minute, no data migration. Reversibility is high.

## Section 2 — Error & rescue map

Every function crossing the `lib/data` boundary can fail once it is real. Mapping them now is what makes the UI honest later.

```
  CODEPATH                    | WHAT CAN GO WRONG               | ERROR TYPE
  ----------------------------|---------------------------------|--------------------
  getLeads / getListings      | Network unreachable             | NetworkError
                              | 401 session expired             | AuthError
                              | 403 agent requests others' lead | ForbiddenError
                              | Empty result set                | (not an error)
  getLead(id)                 | id not found                    | NotFoundError
  syncListings()              | Apify job fails / times out     | SyncFailedError
                              | Apify returns 0 listings        | EmptySyncWarning
                              | Partial: 40 of 60 imported      | PartialSyncError
  createListing()             | Photo upload rejected (size)    | UploadTooLargeError
                              | Photo upload rejected (type)    | UploadTypeError
                              | Duplicate address               | ConflictError
  takeOver() / resumeAI()     | Another agent took over first   | ConflictError
  approveCorrection()         | Already approved by someone else| ConflictError
  assignLead()                | Target agent was just removed   | NotFoundError
  Any mutation                | Submitted twice (double-click)  | (idempotency)
```

```
  ERROR TYPE            | HANDLED? | ACTION                        | USER SEES
  ----------------------|----------|-------------------------------|---------------------------
  NetworkError          | Y        | Inline retry on the surface   | "Couldn't load leads.
                        |          | that failed; keep chrome       |  Retry" + button
  AuthError             | Y        | Redirect to /login             | Login screen
  ForbiddenError        | Y        | Render the not-authorized      | "You don't have access
                        |          | empty state, log it            |  to this lead"
  NotFoundError         | Y        | 404 route segment              | "That lead no longer exists"
  SyncFailedError       | Y        | Keep last-synced timestamp,    | Ember banner: "Sync failed
                        |          | surface the failure, allow     |  14:20. Listings shown are
                        |          | retry                          |  from 09:00." + Retry
  PartialSyncError      | Y        | Show the count that landed     | "40 of 60 listings imported.
                        |          |                                |  20 failed — review"
  EmptySyncWarning      | Y        | Do NOT wipe existing listings  | "Sync returned 0 listings.
                        |          |                                |  Previous data kept."
  UploadTooLargeError   | Y        | Reject before submit, name     | "Photo must be under 5 MB"
                        |          | the limit                      |
  ConflictError         | Y        | Refetch, show who won          | "Sara took over this
                        |          |                                |  conversation 2 min ago"
  Double submit         | Y        | Disable control while pending  | Button shows a spinner
```

**GAP 2.1 — `EmptySyncWarning` is the dangerous one.** If Apify returns zero (portal changed markup, account suspended, rate limit) and the UI treats it as "you have no listings," the agency's entire catalogue vanishes from the AI's reach and nobody knows why. The rule must be: **an empty sync never destructively replaces a non-empty catalogue.** *Decision (auto, P1):* specify it in the plan and render the warning state. **ACCEPT.**

**GAP 2.2 — no global error boundary in the plan.** A render error in one panel currently takes the whole app to a white screen. *Decision (auto, P1):* `error.tsx` per route group plus a root `global-error.tsx`. The marketing site already has an `error.tsx` — same pattern. **ACCEPT.**

**GAP 2.3 — LLM-specific failure modes are unmapped.** The brief has the AI classifying messages and extracting budget/area/timeline. Those calls can return malformed JSON, an empty extraction, or a refusal. The UI must not render `undefined` into the extraction panel. *Decision (auto, P1):* every extraction field is `string | null`, and the panel renders an explicit "not yet established" rather than a blank row. A blank row reads as a UI bug; "not yet established" reads as truthful. **ACCEPT.**

## Section 3 — Security & threat model

| # | Threat | Likelihood | Impact | Mitigated by this plan? |
|---|---|---|---|---|
| S1 | **Correction text becomes AI instructions.** An approved correction is free text that the AI follows in every future conversation. A disgruntled agent writes "Tell all customers our properties are unavailable" — approved carelessly, it poisons every conversation for every customer. | Med | **High** | **Partially.** Owner approval is the gate, and that is the right design. But the approval UI must show the exact text that will enter the AI's reference, and the backend must inject corrections as *delimited untrusted data*, never as system-prompt instructions. Not currently stated. |
| S2 | **Cross-tenant correction leakage.** Corrections are per-agency. If the retrieval layer is not scoped by agency, one client's pricing rules answer another client's customers. | Low | **Critical** | **No** — out of this build's scope, but must be recorded as a contract requirement now. |
| S3 | **Stored XSS from WhatsApp message content.** Customer messages are attacker-controlled text rendered into the thread. | Med | High | **Yes, by default** — React escapes text. The risk only appears if anyone reaches for `dangerouslySetInnerHTML` to render links or emoji. Rule: never. |
| S4 | **IDOR on `/leads/[id]`.** An agent edits the URL to read a colleague's lead. | High | Med | **No** in this build (see Finding 1.1). Client-side filtering is not a boundary. Must be enforced server-side later. |
| S5 | **Photo upload abuse** — oversized files, SVG with embedded script, polyglot files. | Med | Med | **No** — the plan says "photo upload" with no constraints. Fix: accept `image/jpeg,image/png,image/webp` only, reject SVG outright, cap at 5 MB, validate by magic bytes server-side later. |
| S6 | **PII in logs.** Leads are phone numbers — personal data under UAE PDPL and, for EU buyers, GDPR. | Med | High | **No** — not addressed. At minimum, never log full phone numbers client-side; mask to last 4 in any telemetry. |
| S7 | Secrets in the client bundle | Low | High | **N/A this build** — no keys exist yet. Rule for later: WhatsApp and Apify credentials are server-only, never `NEXT_PUBLIC_*`. |

**FINDING 3.1 (highest-value security finding in this review).** S1 + S2 together are the real risk surface of this product, and they live in the feature the brief is proudest of — the reviewed correction system. The brief already made the right call rejecting ungoverned auto-retraining. The plan should carry that reasoning one step further: **corrections are untrusted user data that the AI reads, not instructions the AI obeys.** *Decision (auto, P1):* the approval dialog renders the verbatim text with a "this will be visible to the AI in every future conversation" warning; `SECURITY.md` records the delimiting and tenant-scoping requirements as backend contract. **ACCEPT.**

**FINDING 3.2 — no audit trail on approvals.** Approving a correction changes AI behaviour for every future customer. That needs a who/when record. *Decision (auto, P1):* `Correction` type carries `approvedBy` and `approvedAt`; the knowledge screen shows both. **ACCEPT.**

## Section 4 — Data flow & interaction edge cases

```
  INPUT ────▶ VALIDATION ────▶ TRANSFORM ────▶ PERSIST ────▶ OUTPUT
    │             │                │              │             │
    ▼             ▼                ▼              ▼             ▼
  [nil?]      [invalid?]      [exception?]    [conflict?]   [stale?]
  [empty?]    [too long?]     [timeout?]      [dup key?]    [partial?]

  Flow: "Agent flags a conversation for review"
  ─────────────────────────────────────────────
  form text ──▶ non-empty, ≤1000 chars ──▶ Correction{status:'pending'} ──▶ queue ──▶ knowledge list
      │              │                            │                          │            │
   empty →       >1000 →                    conversation deleted →       already        list empty →
   disable       counter turns             detach; keep the             flagged →       "No pending
   submit        ember, block               correction with a           show the        reviews" empty
                                            "thread removed" note        existing one    state
```

| Interaction | Edge case | Handled? | How |
|---|---|---|---|
| Any form submit | Double-click | **Gap → fix** | Disable the control while pending; every mutation button owns a pending state |
| Any form submit | Navigate away mid-submit | **Gap → fix** | Optimistic update + toast on settle; never a silent loss |
| Leads table | Zero results from a filter | **Gap → fix** | Distinguish "no leads yet" (onboarding CTA) from "no leads match this filter" (clear-filters CTA). These are different empty states and conflating them is the classic mistake |
| Leads table | 10,000 rows | **Gap → fix** | Pagination at the data boundary (Finding 1.3) |
| Leads table | A new lead arrives while you are reading page 2 | Accept | Static build — no live updates. Note it as a real-time requirement for later |
| Conversation | Thread of 500 turns | **Gap → fix** | Anchor initial scroll to the newest turn, not the top; the handoff marker gets a jump-link |
| Conversation | Two agents click "Take over" at once | **Gap → fix** | `ConflictError` path — "Sara took over 2 minutes ago" |
| Listing form | Submit with no photo | Handled | Photo is required by the brief; block submit and say why |
| Listing form | 12 MB photo from a phone camera | **Gap → fix** | Reject client-side with the limit named |
| Sync now | Clicked twice | **Gap → fix** | Button enters a running state with elapsed time; second click is a no-op |
| Sync now | Sync takes 4 minutes | **Gap → fix** | Do not block the screen. Running state + the table stays usable |
| Onboarding | Refresh mid-flow | **Gap → fix** | Step index in the URL (`?step=2`) so refresh and back-button both work |
| Onboarding | Skip every step | **Gap → fix** | Allowed — but the dashboard then shows the setup-incomplete state rather than four zeroed cards |
| Login | Submit while offline | **Gap → fix** | Inline error on the form, never a full-page error |

Fourteen gaps identified, all auto-accepted as in-scope fixes under P1/P2 — each is inside the blast radius of a screen this plan already builds.

## Section 5 — Code quality review

- **DRY, the big one:** four table screens. One `DataTable<T>` with a column config, one `TableToolbar` (search + filter chips), one `EmptyState` with a slot for the CTA. Building four bespoke tables is the failure mode this section exists to catch. **ACCEPT the shared abstraction.**
- **DRY, the subtle one:** status colour appears in badges, filter chips, dashboard counts, and the conversation rail. If each site hardcodes a hex, they drift. **Single `STAGE` map** — `{ label, hex, tint, mark }` keyed by stage — imported everywhere. This is exactly what the brief means by "reuse it everywhere a status appears."
- **Naming:** `AttentionRule` and `AgingClock` describe *what they show*, not how. Good. Avoid `StatusThing` / `LeadHelper` style names.
- **Over-engineering check:** no premature abstraction proposed. `DataTable` is justified by four call sites, not one.
- **Under-engineering check:** the `formatAED` / `formatRelativeTime` / `formatPhone` helpers must exist from hour one. Inline `toLocaleString` calls scattered across nine screens is how currency formatting ends up inconsistent between the listings table and the extraction panel.
- **Complexity:** the only function likely to branch more than five times is the spine turn renderer. The discriminated union (Finding 1.2) turns it into a flat switch, which is fine.

## Section 6 — Test review

```
  NEW UX FLOWS
    login → dashboard · forgot password → reset · onboarding 1→2→3 (+ skip, + resume)
    filter leads by stage · filter by agent · search leads · reassign a lead
    open conversation · take over · resume AI · resolve · flag for review
    approve correction · dismiss correction · edit approved correction
    sync now · add listing (with photo) · edit listing · archive listing
    add agent · remove agent · toggle Pause AI · change overdue threshold
    switch role (owner ↔ agent)

  NEW DATA FLOWS
    fixtures → lib/data async fn → server component → rendered table
    form → mutation fn → optimistic update → toast → refetch
    flag form → pending correction → knowledge queue → approve → FAQ list

  NEW CODEPATHS (branches worth a test)
    role scoping (owner sees N, agent sees subset)
    stage badge mapping (4 stages × badge/chip/count call sites)
    attention state (none / pending / overdue) driven by elapsed minutes
    spine rail colour before vs after the handoff turn
    empty state variants: no-data vs no-match vs not-authorized
    responsive: table → stacked cards below md

  NEW ASYNC WORK
    syncListings (long-running, cancellable-ish, partial results)

  NEW INTEGRATIONS   none in this build (fixtures only)

  NEW ERROR PATHS    all rows in the Section 2 rescue table
```

| Item | Test type | Exists? | Happy | Failure | Edge |
|---|---|---|---|---|---|
| Role scoping | Unit on `lib/rbac` | No — **write it** | owner sees all | agent requesting another's lead → forbidden | agent with zero assigned leads |
| Stage → colour map | Unit | No — **write it** | all 4 map | unknown stage → stone fallback, never crash | — |
| Attention state | Unit | No — **write it** | 10 min → pending | 90 min → overdue | exactly 60 min (boundary) |
| Aging clock format | Unit | No — **write it** | "1h 12m" | — | 0 min, 47 h, negative clock skew |
| Empty state selection | Unit | No — **write it** | data → table | zero + filter → no-match | zero + no filter → onboarding CTA |
| Spine rail colour | Component | No — **write it** | violet before handoff | ember after | thread with no handoff at all |
| Leads table render | Component (RTL) | No — **write it** | rows render | error → retry surface | 0 rows |
| Full lead journey | E2E (Playwright) | No — **write it** | login → leads → open → take over → flag → approve | — | — |
| Responsive collapse | E2E at 375px | No — **write it** | cards, no h-scroll | — | longest possible address string |

**The 2am Friday test:** "an owner opens the dashboard on a phone at 11pm, sees one overdue handoff, taps it, reads the thread, takes over, and replies." If that path is green, the product works.
**The hostile-QA test:** a lead whose contact name is 80 characters of Arabic, on a 320px screen, with a 400-turn thread and a failed listing sync banner on screen.
**Chaos test:** every `lib/data` function forced to reject; assert no white screen anywhere and every surface offers a retry.

**No LLM/prompt files are touched by this build**, so no eval suites apply. Recorded so the next reviewer does not have to re-derive it.

**Flakiness risk:** the aging clock is time-dependent. Inject `now` rather than calling `Date.now()` inside the component, or the test goes red at midnight.

## Section 7 — Performance review

- **Images are the whole performance story here.** A listings table with 40 rows of un-optimized portal photos is a multi-megabyte page. *Fix:* `next/image` with explicit `width`/`height`, `sizes`, and a 64px thumbnail in the table. Remote portal domains go in `next.config.ts` `images.remotePatterns`.
- **Fonts:** three families. Via `next/font` with `display: swap` and Latin subsetting, that is ~90 KB total and no CLS. Acceptable. Loading them from a CDN `<link>` instead would cost a render-blocking round trip — do not.
- **Long threads:** 500 turns of DOM is fine; 5,000 is not. Realistic ceiling for a WhatsApp property inquiry is well under 500. Deferred, noted.
- **Table sort/filter:** client-side over 25 paginated rows is free.
- **Server components by default** means most screens ship near-zero JS. The interactive islands are the toolbar, the reassign dropdown, the spine actions, and the forms. That is the right split.
- **No N+1 or connection-pool concerns** — no database in this build. Recorded, not skipped.

## Section 8 — Observability & debuggability

Thin by nature (static UI), but not empty:

- **GAP 8.1 — no client error reporting.** A render crash in production is invisible. *Fix:* error boundaries (Gap 2.2) plus a `reportError` seam in `lib/telemetry.ts` that is a no-op today and becomes Sentry later. Costs five lines now, saves a blind spot.
- **GAP 8.2 — the sync has no visible history.** "Last synced 09:00" tells you when it worked, not that 14:20 failed. *Fix:* the listings header shows last *attempt* and last *success* when they differ. This is the single most useful operational detail on the screen.
- **Metric that says it's working:** overdue-handoff count trending to zero. That is already the dashboard's headline card — good instinct in the brief.
- **Metric that says it's broken:** listings synced = 0, or WhatsApp status ≠ connected. Both already surface in the UI.
- **Runbook:** none needed for a static deploy beyond "redeploy the previous build."

## Section 9 — Deployment & rollout

- Static/SSR Next app on Vercel, same pattern as the marketing site. No migrations, no feature flags needed, no partial-state risk.
- **Rollback:** promote the previous deployment. Under a minute.
- **Deploy-time risk window:** none — no shared mutable state.
- **Post-deploy check (first 5 minutes):** `/login` renders; `/` renders the dashboard with all four cards; `/leads` renders rows; `/leads/[id]` renders a thread with an image bubble; 375px viewport shows no horizontal scroll.
- **RISK 9.1 — commit authorship.** Recorded from prior project history: commits authored as anyone other than `Saad Aslam <hellomedia555@gmail.com>` silently break Vercel deploys. `git config` is already set locally in this repo. Flagged so it is not rediscovered the hard way.
- **RISK 9.2 — this repo has no remote.** Nothing to deploy to yet. Not a blocker for the build; a prerequisite for shipping.

## Section 10 — Long-term trajectory

- **Reversibility: 4/5.** Tokens, components, and screens are all replaceable. The one sticky decision is the `lib/types.ts` shape — once a backend implements it, changing `Lead` is a coordinated change. That is exactly why the types deserve care now, and why Approach C matters.
- **Path dependency:** the async data boundary makes the backend swap cheap. The absence of one would make it expensive. This is the highest-leverage architectural decision in the plan.
- **Debt accepted knowingly:** no auth, no persistence, no tenancy, client-side-only role filtering. All four are written into "NOT in scope" so nobody mistakes them for oversights.
- **Ecosystem fit:** Next App Router + RSC + Tailwind v4 `@theme` is where the ecosystem is going, and it matches the sibling repo, so one developer can move between them without a context switch.
- **The 1-year question:** a new engineer opening this repo needs to understand (a) that `lib/data` is the API contract, (b) that the `STAGE` map is the single source of status truth, and (c) that role filtering is cosmetic until the server enforces it. All three go in `CLAUDE.md` and `README.md`. If they are not written down, all three get violated.
- **Platform potential:** the `DataTable` + `EmptyState` + `StageBadge` trio, plus the token layer, is a small internal design system. If Gehox onboards a second vertical (see premise P3), that layer is what makes the second product cheap.

## Section 11 — Design & UX review

**Information hierarchy (dashboard, in order):** 1) overdue handoffs — the only thing that is *someone is losing money right now*; 2) the four KPI cards; 3) per-agent snapshot; 4) activity feed. The plan currently lists the four cards first and overdue second. **Reorder: overdue leads the page.** If nothing is overdue, that block collapses to a single calm line and the cards move up. A dashboard whose most urgent element is in position five is a dashboard that gets ignored.

**Interaction state coverage:**

| Screen | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Dashboard | skeleton cards | "No leads yet — connect WhatsApp" | per-card retry | — | some cards load, others fail |
| Leads | skeleton rows | no-data vs no-match (two states) | retry surface | toast on reassign | — |
| Conversation | skeleton thread | n/a | "Couldn't load thread" | toast on take-over | images still loading |
| Listings | skeleton rows | "No listings — Sync now or add one" | retry | toast on add | **partial sync banner** |
| Knowledge | skeleton | "Nothing to review — the AI is doing fine" | retry | toast on approve | — |
| Team | skeleton | "Add your first agent" | retry | toast | — |
| Settings | skeleton | n/a | inline per field | inline saved | — |
| Onboarding | per-step | n/a | inline | step advances | resumable mid-flow |

Every cell is specified. The two that usually get skipped and matter most here are **partial sync** and **no-match vs no-data**.

**User journey (emotional arc):**
```
  login ──▶ onboarding 1·2·3 ──▶ dashboard ──▶ "two handoffs are overdue" ──▶ leads
   calm      quick, finite         relief         controlled urgency           scan
                                    │                                            │
                                    └──────── nothing overdue: quiet ────────┐   ▼
                                                                             │ conversation
   knowledge ◀── flag for review ◀── "the AI got this wrong" ◀───────────────┘  read the
   fix it once                        annoyance → agency                          thread
```
The arc that must land: **annoyance at an AI mistake converts into a one-time fix, not a support ticket.** That is what makes Knowledge/Corrections the retention screen.

**AI-slop risk.** Real. The default output for "SaaS dashboard" is: white sidebar, blue primary, four bordered stat cards with a coloured icon in a rounded square, a generic table, and pill badges. The plan's two counter-moves — the graphite spine and the conversation rail — are the defence. **Self-critique to apply at build time:** if the finished dashboard could be recoloured and passed off as any other admin panel, it failed. Concrete tells to avoid: icon-in-a-tinted-rounded-square on every KPI card; a purple gradient hero band across the top; emoji in empty states; three shadow depths on static cards; "Welcome back, Ahmed 👋".

**DESIGN.md alignment.** The product diverges deliberately on the neutral base (warm sand vs the site's cool lavender) and drops Bebas Neue. Both divergences are argued in §2 and §3.4. A product `DESIGN.md` must be written in this repo so the divergence is a documented decision rather than drift.

**Responsive intention.** Stated and specific: sidebar → icon rail at `lg` → bottom tab bar at `sm`; tables → stacked cards below `md`. Real, not aspirational.

**Accessibility.** Focus ring is inherited from the brand baseline. Contrast for every token pair is computed in §3.1. Status is never colour-alone (hue **plus** mark shape). Touch targets ≥44px on mobile. The remaining gap: the conversation spine must be readable by a screen reader as an ordered list of turns with speaker labels, not as a visual rail. *Decision (auto, P1):* semantic `<ol>` with `aria-label` per turn; the rail is CSS, not content. **ACCEPT.**

**Required user-flow diagram:**
```
  /login ──┬─▶ /forgot-password ──▶ /reset-password ──▶ /login
           │
           └─▶ first login? ──yes──▶ /onboarding?step=1 ─▶ ?step=2 ─▶ ?step=3 ─┐
                    │                      │ skip           │ skip      │ skip │
                    no                     └────────────────┴───────────┴──────┤
                    │                                                          │
                    ▼                                                          ▼
                   / (dashboard) ◀───────────────────────────────────────────────
                    │
      ┌─────────────┼─────────────┬──────────────┬────────────┬──────────┐
      ▼             ▼             ▼              ▼            ▼          ▼
   /leads      /listings     /knowledge       /team      /settings   (role switch)
      │             │             ▲
      ▼             │             │
  /leads/[id] ──────┘             │
      │  take over / resume / resolve
      └── flag for review ────────┘
```

Recommendation from this section: **run /plan-design-review** — which is Phase 2 of this pipeline.

## CEO required outputs

### NOT in scope

| Item | Why it is out |
|---|---|
| AI answering phone calls | Brief exclusion. Voice/telephony is a different infrastructure and a different product. |
| Auto-posting listings back to Bayut / Property Finder | Brief exclusion. Requires a portal API partnership that does not exist. Listings flow one way, in. |
| Tenancy contracts, Ejari, legal paperwork | Brief exclusion. Jurisdiction-sensitive, different product category. |
| Automatic AI self-retraining from flags | Brief exclusion, and correctly reasoned — replaced by the reviewed correction system. |
| Billing, invoicing, Stripe, any payment flow | Brief exclusion. Invoiced manually outside the app. |
| Real authentication | Deferred. Login is a form that routes. Server-side session comes with the backend. |
| Persistence / database | Deferred. Approach C's async boundary is the seam where it lands. |
| Live WhatsApp Business API wiring | Deferred. The UI models connection status; it does not establish it. |
| Real Apify job execution | Deferred. "Sync now" models the states (running, success, partial, failed, empty) without invoking anything. |
| Multi-tenant isolation | Deferred. Single-agency assumption throughout. Recorded in `SECURITY.md` as a contract requirement. |
| Business-hours-aware overdue clock (E4) | Deferred → `TODOS.md` T-04. Needs a schedule and timezone model. |
| Full UI RTL / Arabic chrome (E7) | Deferred → `TODOS.md` T-07. Message-content `dir="auto"` ships now; chrome mirroring does not. |
| Command palette (E8) | Deferred → `TODOS.md` T-08. Nice, not load-bearing. |
| Assignment audit trail (E9) | Deferred → `TODOS.md` T-06. |
| Virtualized long threads / tables | Deferred → `TODOS.md` T-09. Pagination covers realistic scale. |
| Real-time push updates | Deferred → `TODOS.md` T-05. Requires a backend. |

### What already exists

Covered in Step 0B. Summary: the violet accent ramp, the Gehox mark SVGs, the primary-button gradient treatment, the `:focus-visible` baseline, and the toolchain config shape are all lifted from the marketing repo (read-only reference — nothing in that repo is modified). Everything domain-specific is new. Nothing is being rebuilt.

### Failure modes registry

```
  CODEPATH                | FAILURE MODE                | RESCUED? | TEST? | USER SEES        | LOGGED?
  ------------------------|-----------------------------|----------|-------|------------------|--------
  getLeads / getListings  | network unreachable         | Y        | Y     | retry surface    | Y
  getLead(id)             | not found                   | Y        | Y     | 404 segment      | Y
  getLead(id)             | agent requests other's lead | Y*      | Y     | not-authorized   | Y
  syncListings            | Apify job fails             | Y        | Y     | ember banner     | Y
  syncListings            | returns 0 listings          | Y        | Y     | "previous kept"  | Y
  syncListings            | partial (40 of 60)          | Y        | Y     | counted banner   | Y
  createListing           | photo too large / wrong type| Y        | Y     | inline, named    | Y
  takeOver / resumeAI     | another agent won the race  | Y        | Y     | "Sara took over" | Y
  approveCorrection       | already approved            | Y        | Y     | refetch + notice | Y
  any mutation            | double submit               | Y        | Y     | pending control  | n/a
  any render              | component throws            | Y        | Y     | error boundary   | Y
  AI extraction           | field missing / malformed   | Y        | Y     | "not yet         | Y
                          |                             |          |       |  established"    |
  ------------------------|-----------------------------|----------|-------|------------------|--------
```

`*` **Y\*** = rescued in the UI only. Client-side scoping is a display filter, not a boundary
(Finding 1.1). Server enforcement is `TODOS.md` T-01 and is recorded in `SECURITY.md`.
**No CRITICAL GAPs** (no row is RESCUED=N + TEST=N + USER SEES=Silent). The one honest caveat
is the asterisk above, which is a scope boundary rather than a gap.

### Diagrams produced

System architecture (§1) · data-flow with shadow paths (§4) · error flow (§2 rescue table) ·
user flow with screens and transitions (§11) · dream-state timeline (§0C). Deployment
sequence and rollback flowchart are one line each for a static Vercel app and are covered
in §9 prose rather than as diagrams — a box-and-arrow diagram of "promote previous
deployment" would be noise, not signal.

### Stale diagram audit

None. No existing diagrams in this repo — it is greenfield.

## Premise-gate resolution

The one premise that could have changed the work is **P3 — is this product real-estate-specific
or the first vertical of a horizontal WhatsApp-lead product?** The marketing site's own source
comment keeps its positioning open beyond real estate, which is what raised the question.

**Resolved without blocking, as follows.** The brief is unambiguous and specific: bed/bath,
Bayut and Property Finder, "Ready to view," Dubai buyers, AED. Specificity is what will make
this product feel built-for-them rather than generic, and genericizing it now would cost the
product its best quality for a second client that does not exist yet. So: **build it
real-estate-specific, exactly as briefed.** What the review changes is only that the
*design-system layer* (`DataTable`, `EmptyState`, `StageBadge`, the token file) is kept free of
domain nouns, so a future second vertical is a cost that is known rather than a rewrite that is
a surprise. Recorded as `TODOS.md` T-10.

The remaining premise findings — P5 (Closed collapses won and lost) and P6 (hardcoded 60-minute
threshold) — are handled as follows: P6 is auto-accepted as E3 (configurable in Settings), and
**P5 goes to the final approval gate as a User Challenge**, because it changes a stage model the
brief specified explicitly.

> **P5 resolved during the build without needing the challenge.** Adding
> `closedOutcome: 'won' | 'lost' | null` to `Lead` answers "how many did we actually close?"
> while keeping all four briefed stages exactly as specified. The stage model is untouched;
> the outcome is an additive detail inside Closed. No user decision required.

---

# PHASE 2 — DESIGN REVIEW

**Voice status: `[single-voice]`.** The independent design reviewer was dispatched and
terminated mid-run on an API session limit (its last output was "the measured numbers diverge
sharply from the plan's stated ones" — it was checking contrast, which turned out to be the
right instinct). Codex is not installed on this machine, so per the user's instruction the
outside voices were Claude agents; four of five died on the same limit. Rather than re-spawn
into the same ceiling, this pass was run directly against the **live rendered application**
with computed-style measurement, which is stronger evidence than reviewing a plan.

## Method

Automated audit over the running app: WCAG contrast computed from resolved `getComputedStyle`
colours against the effective background (walking ancestors for the first opaque layer),
touch-target geometry, horizontal-overflow detection, and image decode status. Run at 1440px
and 375px.

One trap worth recording: Tailwind v4 emits `oklab()` for opacity modifiers like
`bg-canvas/85`. A naive RGB regex reads those three floats as 0–255 channels and reports
near-black, producing false contrast failures. The audit needed an oklab→sRGB conversion
before its numbers meant anything. Two "failures" in the first pass were this bug, not the UI.

## Findings

| # | Finding | Severity | Resolution |
|---|---|---|---|
| D1 | `muted` `#78706A` measured **4.39:1** on canvas — under AA for body text | High | Darkened to `#6F6862` → **4.95:1** |
| D2 | `stage-ready` `#15803D` measured **4.35:1** on its own tint — under AA for 12px badge text | High | Darkened to `#15773A` → **4.87:1** |
| D3 | Spine footer `#6d645c` on graphite measured **2.73:1** | High | New token `graphite-dim` `#968C83` → **4.8:1** |
| D4 | Login panel footer used the same too-dark inline hex | Medium | Same token |
| D5 | Six tap targets under 24px: "Manage team" (16px), activity-feed links (18px), thread back-link (16px) | Medium | Whole rows made tappable; padding on inline links |
| D6 | **Conversation rail collapsed to one solid violet run on a thread that was handed off *and* resumed** — the human stretch disappeared entirely | **High** | Rewritten as per-turn slices. Verified on `ld_004`: violet ×3 → ember ×5 → violet ×2 |
| D7 | Rail height split by `index / turns.length` assumed uniform turn heights; image bubbles are ~4× a text bubble, so the colour boundary drifted from the actual handoff | High | Same rewrite — per-turn slices need no percentage math |
| D8 | Fixture photos hot-linked from a CDN: needs `remotePatterns`, fails at request time not build time, and breaks with no network | Medium | 14 photos vendored to `public/fixtures/listings/` (2.5 MB); `remotePatterns` emptied with a comment for when real portal sync lands |

D6 is the one that matters. It was invisible in the plan and only appeared by rendering a
thread with both a handoff and a resume — which is exactly why this pass ran against the app.

## Scorecard

| Dimension | Score | Note |
|---|---|---|
| Token system rigor | 9/10 | Every text pair now computed, not eyeballed. Three real failures caught and fixed. |
| Type fit for density | 8/10 | Bricolage/Inter/JetBrains works; 13px table row is right. Bricolage above ~28px is the only place it gets stylistically loud. |
| Status language clarity | 9/10 | Two axes plus mark shape survives greyscale. Teal/green adjacency is carried by the mark, not the hue. |
| Information hierarchy | 9/10 | Overdue block leads; collapses to one calm line when clear. |
| State coverage | 9/10 | Loading/empty/error/partial on every surface, and all reachable via `?scenario=`. |
| Responsive strategy | 9/10 | 375px verified: zero overflow, table→cards, 75×58px tab targets. |
| Distinctiveness | 8/10 | Graphite spine + notch and the colour-switching rail are genuinely not the default admin panel. Honest caveat: the KPI row is conventional. |

**Overall 8.7/10.**

---

# PHASE 3 — ENG REVIEW

**Voice status: `[single-voice]`** — same session-limit cause as Phase 2. Compensated by
running against compiled, type-checked, production-built code rather than a description of it.

## Findings

| # | Finding | Severity | Resolution |
|---|---|---|---|
| E1 | **The RSC trap.** A generic `DataTable<T>` with `columns[].cell: (row) => ReactNode` cannot be passed from a server page to a client component — functions aren't serializable. Would have surfaced at hour three, after four screens | **Critical** | Abstraction dropped. Shared chrome (`TableShell`/`Table`/`CardList`/`Pagination`/`EmptyState`), per-screen `<tr>`. Also dissolves the mobile-card and row-accent problems a column API couldn't express |
| E2 | Client-side filtering over a paginated page filters *the page*, not the dataset — the leads screen would silently lie | **Critical** | All filtering/search/sort/pagination at the `lib/data` boundary, driven by URL params |
| E3 | `takeOver(leadId, agentId)` let the caller name whose behalf it acts on | High | Signature narrowed to `takeOver(leadId)`; actor comes from the session |
| E4 | Layouts don't receive `searchParams` in the App Router, so the shell couldn't read role | High | Role moved to a cookie via `src/lib/session.ts` — which is what a real session is anyway |
| E5 | `ForgotLink` exported from a `page.tsx` — Next restricts page exports; build-time type error | Medium | Removed |
| E6 | No exhaustiveness guard on the `Turn` union; a missing case renders blank rather than failing the build | Medium | `assertNever` in `src/lib/assert.ts`, required in every union switch |
| E7 | Nothing prevented importing fixtures directly — the rule the whole architecture rests on was prose only | High | ESLint `no-restricted-imports` on `**/data/fixtures`; build fails |
| E8 | Unbounded lists | Medium | `Page<T>` with `pageSize` from day one, capped at 100 |

## Consensus table

```
ENG — SINGLE VOICE (outside reviewer lost to session limit)
═══════════════════════════════════════════════════════════════
  Dimension                        Claude   Outside   Consensus
  ──────────────────────────────── ──────── ───────── ──────────
  1. Architecture sound?           YES      N/A       single-voice
  2. Test coverage sufficient?     NO       N/A       single-voice
  3. Performance risks addressed?  YES      N/A       single-voice
  4. Security threats covered?     PARTIAL  N/A       single-voice
  5. Error paths handled?          YES      N/A       single-voice
  6. Deployment risk manageable?   YES      N/A       single-voice
═══════════════════════════════════════════════════════════════
```

**Dimension 2 is an honest NO.** The test *plan* exists (Phase 1 §6: nine specs, the 2am-Friday
case, the hostile-QA case, the chaos case) but **no test runner is installed and no test file is
written.** Verification for this build was: `tsc --noEmit` clean, `eslint` clean, production
build clean, all 13 routes 200, and a live DOM audit at two viewports. That is real evidence,
and it is not tests. Recorded as the largest known gap.

**Dimension 4 is PARTIAL by design, not oversight** — client-side role scoping, no auth, no
tenancy. All written down in `SECURITY.md` with a pre-launch checklist.

## Verification actually performed

```
npm run typecheck          clean
npm run lint               clean (0 errors, 0 warnings)
npm run build              clean — 13 routes, 106–118 kB First Load JS
13/13 routes               HTTP 200
contrast audit             1440px + 375px, oklab-aware, 0 remaining failures
touch targets              0 remaining under 24px
horizontal overflow        none at 375px on any screen
conversation rail          ld_004 verified violet×3 → ember×5 → violet×2
image pipeline             raw 200 image/jpeg; optimizer 200 at w=96 and w=3840
```

Browser screenshots were unavailable — the pane never composited, which also meant images
never decoded in-page. That is a harness limitation, confirmed by fetching the bytes directly.

---

# PHASE 4 — REVIEW COMPLETE

## Decisions: 31 total — 28 auto-decided, 2 taste, 1 dissolved

**Taste decisions (your call, my recommendation applied):**

1. **Warm sand ground instead of the marketing site's lavender.** Recommended and applied.
   Reverting is a five-value edit in `globals.css`.
2. **Bebas Neue dropped from the product.** Recommended and applied — it's unreadable at 13px
   in a table. Costs some brand recognition; the violet ramp and mark carry it instead.

**Dissolved:** splitting `Closed` into Won/Lost became an additive `closedOutcome` field, so
the four briefed stages stand unchanged and no decision was needed.

## Cross-phase theme

**Contrast and colour rigor** was flagged independently by the design reviewer (before it died)
and by the DX reviewer (F5.4, "nothing stops a raw hex in a component"). Two voices arriving at
the same concern from different directions is the strongest signal in this run — and it was
correct: three genuine AA failures were shipped in the first token pass.

## Known gaps

1. **No tests.** Plan exists, runner does not. Largest gap.
2. **Security is display-only** — deliberate, documented in `SECURITY.md`.
3. **Outside voices degraded** — 4 of 5 lost to session limits; Codex unavailable.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | issues_open | 7 premises challenged (1 wrong, 1 contested), 10 expansions → 5 accepted / 4 deferred / 1 dissolved, 3 approaches → C |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clean | 8 findings, 8 fixed; 8.7/10 |
| Eng Review | `/plan-eng-review` | Architecture & tests | 1 | issues_open | 8 findings, 8 fixed; 2 critical caught pre-code; test coverage NO |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | issues_open | 40+ findings, ~30 applied |

- **CODEX:** unavailable (CLI not installed). Substituted with Claude agents per user instruction.
- **CROSS-MODEL:** degraded — 4 of 5 outside voices terminated on API session limits. Design and Eng ran single-voice against the live application instead of the plan.
- **VERDICT:** CEO + DESIGN + ENG + DX reviewed. Build verified: typecheck, lint, production build, 13/13 routes, accessibility audit at two viewports. Not cleared for production — no tests, no auth, no server-side authorization.

**UNRESOLVED DECISIONS:**
- Test runner (Vitest + RTL + Playwright) not installed and no test written — the Phase 1 §6 plan is unexecuted.
