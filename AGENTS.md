# Agent rules — Gehox Dashboard

Read this before writing code here. `README.md` has the tour; this is the short list
of things that will break if you get them wrong.

## Stack

Next.js 15 App Router · React 19 · Tailwind v4 (`@theme`, not a config file) ·
TypeScript strict with `noUncheckedIndexedAccess`. Node 20+.

## MUST

- **Read through `src/lib/data/*`.** Those async signatures plus `src/lib/types.ts`
  are the contract the backend will implement. Change them deliberately, not casually.
- **Filter, search, sort and paginate at the data boundary**, driven by URL search
  params. Never in a component — filtering one page of results client-side filters the
  page, not the dataset, and the screen silently lies.
- **Take status colour from `src/lib/status.ts`.** It is the only source. Badges,
  filter chips, dashboard counts, and the conversation rail all read from it.
- **End every switch over a union with `assertNever`** (`src/lib/assert.ts`). Without
  it a new `Turn` kind renders as a blank bubble instead of failing the build.
- **Render customer-authored text through `<UserText>`.** It carries `dir="auto"` so
  Arabic renders right-to-left, and it keeps the XSS question answered in one place.
- **Give every data read a `Scenario` parameter** so its loading / empty / error states
  stay reachable via `?scenario=`.
- **Add new screens to `src/components/spine/nav.ts`** — one config drives the desktop
  spine and the mobile tab bar, so a screen can't be desktop-only by accident.
- **Commit as `Saad Aslam <hellomedia555@gmail.com>`.** A placeholder author silently
  breaks Vercel deploys. `git config` is already set in this repo — don't override it.

## NEVER

- **Never import `src/lib/data/fixtures`** from UI code. ESLint fails the build. Add a
  function to `lib/data/*` instead. This is the rule the whole architecture rests on.
- **Never use `dangerouslySetInnerHTML`.** Not for links, not for emoji, not for
  formatting. Customer messages are attacker-controlled.
- **Never hardcode a hex in a component.** Use a token from `@theme`. New colour →
  a row in `DESIGN.md` and an entry in `globals.css`.
- **Never treat `src/lib/rbac.ts` as a security boundary.** In this build it is a
  display filter. See `SECURITY.md`.
- **Never build a generic `DataTable` with a column config.** It was considered and
  rejected: a config carrying `cell: (row) => ReactNode` cannot cross the server/client
  boundary, and row markup genuinely differs per screen. Share the chrome
  (`TableShell` / `Table` / `CardList` / `Pagination` / `EmptyState`), write your own
  `<tr>`.
- **Never add a fourth elevation.** Three: flat, raised, overlay.

## Conventions

- Pages are server components. Interactive pieces go in a sibling `'use client'` file
  (`ReassignSelect.tsx`, `ListingControls.tsx`, …), never inline in the page.
- Timestamps are ISO 8601 UTC **strings**, never `Date` objects — they don't survive
  the server/client boundary. Money is a whole number of AED.
- Absent is `null`. Never `undefined`, never `""`. `null` renders as an explicit phrase
  ("not yet established"); a blank cell reads as a broken panel.
- Components taking a time (`AgingClock`, anything relative) accept `now` as a prop, so
  tests don't go red at midnight.
- Distinguish **no-data** from **no-match** in every empty state. Showing an onboarding
  CTA to someone who over-filtered reads as if their data vanished.

## Before you finish

```bash
npm run typecheck && npm run lint && npm run build
```
