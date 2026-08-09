# Gehox — Agency Dashboard

The product UI real estate agency owners and agents log into to see and manage the
WhatsApp property inquiries their AI agent is handling, plus the listings that AI
draws on to answer questions.

This repo is **the UI layer only**. There is no backend, no auth, and no database.
`src/lib/data/*` is the seam where all of that lands — see [The data boundary](#the-data-boundary).

---

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:3000>. That's it — no `.env` file, no seed step, no network
required.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint, including the data-boundary rule |
| `npm run typecheck` | `tsc --noEmit` |

Node 20+. Next.js 15 (App Router), React 19, Tailwind v4, TypeScript strict.

### Signing in

There is no authentication. **Any valid-looking email and any password of 6+
characters signs you in** — the form is pre-filled, so you can just press the button.
Or skip it entirely and go straight to `/`.

### Seeing it as an agent instead of the owner

The **View as: Owner / Agent** switch in the top bar. It writes a cookie and
re-renders on the server, which is exactly what a real session change will do.

- **Owner** sees every lead in the agency, plus Team and the approve/dismiss
  controls on Knowledge.
- **Agent** sees only leads assigned to them. Team disappears from the nav.

### Seeing the loading, empty, and error states

Nearly every surface specifies a loading, empty, error, and partial state. With
fixed sample data most of those are unreachable by hand, so there's a switch:

| URL | What you get |
|---|---|
| `/leads?scenario=empty` | The no-data empty state |
| `/leads?scenario=error` | The inline retry surface |
| `/?scenario=slow` | Skeletons — every read delayed 2s |
| `/listings?scenario=partial-sync` | "6 imported, 3 failed" banner |
| `/?scenario=fresh` | A brand-new agency: nothing connected, nothing synced |

It's read at the data boundary only. No component knows it exists.

---

## The screens

| Route | Screen |
|---|---|
| `/login`, `/forgot-password`, `/reset-password` | Auth |
| `/onboarding?step=1..3` | First-run setup: WhatsApp → listings → team |
| `/` | Overview — overdue handoffs, counts, pipeline, per-agent snapshot, activity |
| `/leads` | Leads table, filterable by stage / urgency / agent, searchable |
| `/leads/[id]` | Conversation — the spine thread, AI extraction panel, take over, flag |
| `/listings` | Properties the AI can reference. Sync now, add manually |
| `/knowledge` | Flagged replies awaiting review + the running list the AI follows |
| `/team` | Agents, assignment stats. Owner only |
| `/settings` | WhatsApp connection, Pause AI, overdue threshold, alerts, your account |

---

## The data boundary

**This is the one architectural rule that matters.**

```
  screens  ──▶  lib/data/*  ──▶  lib/data/fixtures.ts   (today)
                    │
                    └────────▶  real API                (later)
```

Every screen reads through the async functions in `src/lib/data/index.ts`. Those
signatures, plus the types in `src/lib/types.ts`, **are the contract the backend has
to satisfy**. When the API arrives, each function body becomes a `fetch` and nothing
else in the app moves.

That only holds if three rules hold:

1. **Never import `lib/data/fixtures` from UI code.** ESLint fails the build if you
   do. Add a function to `lib/data/*` instead.
2. **Filtering, searching, sorting, and pagination happen at the boundary** — never in
   a component. Filtering one page of results client-side silently filters the page
   rather than the dataset, which makes the leads screen lie. Filters live in the URL
   and are passed as query params, exactly as they will be over HTTP.
3. **`src/lib/status.ts` is the only source of status colour.** Badges, filter chips,
   dashboard counts, and the conversation rail all read from it. A hardcoded hex
   anywhere else drifts within a month.

Contract conventions: every timestamp is an ISO 8601 UTC **string** (never a `Date` —
they don't survive the server/client boundary). Every money value is a whole number
of **AED**. Absent is `null`, never `undefined` and never `""`.

---

## Adding a screen

1. `src/app/(app)/<name>/page.tsx` — a server component. Read `searchParams`, call
   `lib/data`, render.
2. Add the read function to `src/lib/data/index.ts`, with a `Scenario` parameter.
3. Add an entry to `src/components/spine/nav.ts` — one config drives both the desktop
   spine and the mobile tab bar, so you can't ship a screen that's unreachable on a
   phone.
4. Interactive bits go in a sibling `'use client'` file, not the page.
5. Use `TableShell` + `Table` + `CardList` from `components/ui/Primitives` for the
   chrome; write your own `<tr>`. There is deliberately no generic `DataTable` — see
   `DESIGN.md`.

---

## Also read

- [`DESIGN.md`](./DESIGN.md) — tokens, the status system, the two deliberate
  divergences from the marketing site, and the AI-slop checklist
- [`SECURITY.md`](./SECURITY.md) — what is *not* enforced in this build, and the
  checklist to complete before real data lands
- [`TODOS.md`](./TODOS.md) — deferred work with context
- [`PLAN.md`](./PLAN.md) — the review record this build came out of
