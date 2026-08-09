# Gehox Dashboard — Design System

Source of truth for the product UI. Tokens live in `src/app/globals.css` (`@theme`)
and the status language in `src/lib/status.ts`. This file explains the *why*; those
two files are the machine-readable version.

---

## Concept

A working SaaS dashboard, not a marketing page. Someone reads this for eight hours a
day and checks it on a phone between viewings. So: clarity, density done well, and
fast scanning. Premium here means restrained and precise — not maximalist.

**Warm sand ground, one violet accent, two-axis status, and a spine.**

---

## Two deliberate divergences from gehox.com

The client sees the marketing site and this product side by side, so identity has to
carry. Two things intentionally do not.

**1. The neutral ground is warm, not cool.** The marketing site sits on a lavender
white (`#F7F5F9`). This sits on a warm sand (`#F6F3EE`). Violet is a cool hue; a warm
ground makes it read deliberate rather than washed out, and it's easier on the eye
across a working day. The violet ramp itself is copied verbatim — that's the tie.

**2. Bebas Neue is dropped.** It carries the marketing site's display voice, and it is
a poster face: condensed, all-caps by nature. At 13px in a table it is unreadable. The
brand tie is carried by the violet ramp, the mark, and Bricolage Grotesque instead.

> ⚠️ **Token names are shared with the marketing repo; values are not.**
> `surface` is `#FFFFFF` there and `#FDFBF8` here. Never copy CSS between the two
> repos — copy components, or copy nothing.

---

## Tokens

### Neutrals — warm sand

Hue ~35–40°, chroma kept very low so it reads as paper, not beige. Never `#FFF`: a
stark white panel on warm ground looks like a rendering bug.

| Token | Hex | Role | Contrast on `canvas` |
|---|---|---|---|
| `canvas` | `#F6F3EE` | App background | — |
| `surface` | `#FDFBF8` | Cards, table bodies, panels | — |
| `sunk` | `#F0ECE5` | Table headers, wells, disabled fields | — |
| `hairline` | `#E7E1D8` | Row rules, dividers | — |
| `edge` | `#D8D0C4` | Input and structural borders | — |
| `ink` | `#1C1917` | Primary text | 15.9:1 |
| `ink-soft` | `#443E38` | Secondary headings, table body | 9.6:1 |
| `muted` | `#6F6862` | Labels, metadata, timestamps | **4.95:1** |
| `graphite` | `#26221F` | The spine | — |
| `graphite-soft` | `#332E2A` | Spine hover / active fill | — |
| `graphite-text` | `#B8B0A8` | Spine nav, inactive | 7.4:1 on graphite |
| `graphite-dim` | `#968C83` | Dimmest allowed on the spine | 4.8:1 on graphite |

`muted` was originally `#78706A` and measured 4.39:1 — under AA. Darkened to `#6F6862`.
Do not lighten it back.

### Accent — Gehox violet, verbatim from the marketing site

| Token | Hex | Role |
|---|---|---|
| `accent-ink` | `#2B0F54` | Gradient start |
| `accent` | `#471A79` | Gradient mid |
| `accent-bright` | `#6411AD` | Primary action, links, focus ring — 8.5:1 on canvas |
| `accent-hover` | `#7B22C9` | Hover |
| `accent-light` | `#C9A9F2` | On dark violet / graphite only |
| `accent-wash` | `#F0E9FA` | Selected row, active nav tint, AI message bubbles |

Primary gradient: `linear-gradient(120deg, #2B0F54, #471A79, #6411AD)`.
**One primary action per screen.** That's what makes it mean anything.

### Type

| Family | Role | Notes |
|---|---|---|
| **Bricolage Grotesque** 600–800 | Page titles, KPI numerals, card headings | `.t-display`, tracking −0.03em |
| **Inter** 400–600 | Everything dense: tables, forms, labels, buttons | `tabular-nums` globally |
| **JetBrains Mono** 400–500 | Phone numbers, references, timestamps, IDs | `.t-mono` |

All three self-hosted via `next/font` — subset, preloaded, no layout shift, no runtime
request to Google.

Scale (rem): `0.6875 · 0.75 · 0.8125 · 0.875 · 1 · 1.125 · 1.375 · 1.75 · 2.25 · 3`.
`0.8125rem` (13px) is the table workhorse.

Tabular figures are on globally. In a dashboard full of counts, prices, and clocks,
proportional digits make columns wobble as values change — precisely when you're
reading them.

### Spacing, radius, elevation

- Spacing: 4px base.
- Radius: `sm 4 · md 6 · lg 10 · xl 14`.
- **Exactly three elevations.** `flat` (hairline border only — the default for all
  static content), `raised` (dropdowns, popovers), `overlay` (modals, drawers).
  A sticky-header shadow reuses `raised`. Do not invent a fourth.
- Shadows are tinted with the warm ink, not black — black goes grey and muddy on sand.
- Focus: `2px solid #6411AD`, offset 2px, everywhere. On the spine it switches to
  `accent-light`. Never removed for aesthetics.

---

## The status language — two axes

Most dashboards collapse "where is this lead" and "does this need me right now" into
one colour ramp, then run out of distinguishable hues. Two independent axes instead.

### Axis A — lead stage

Hue **and** mark shape, so it survives colour blindness, greyscale, and the fact that
teal and green sit close together.

| Stage | Hex | Mark | Meaning |
|---|---|---|---|
| New | `#0F766E` teal | filled disc | AI replied, nothing qualified yet |
| Qualifying | `#9A5B0B` amber | half-filled ring | still working out budget / area / timeline |
| Ready to view | `#15773A` green | disc with a tick | qualified, asking to see something |
| Closed | `#6F6862` stone | hollow ring | finished — the empty one |

`ready_to_view` was `#15803D` and measured 4.35:1 on its own tint. Darkened to clear AA
(4.87:1).

Wire values are snake_case: `new`, `qualifying`, `ready_to_view`, `closed`. Labels
render from `STAGE[x].label` — never from the enum value.

`Closed` carries an `outcome: 'won' | 'lost' | null`. Four stages exactly as briefed;
the outcome answers "how many did we actually close?" without a fifth stage.

### Axis B — attention

Never a stage. An overlay on top of one.

| State | Treatment |
|---|---|
| Handoff pending | 3px ember rule on the row's left edge, no fill |
| Handoff overdue | ember rule + tinted row + live aging clock + 3s pulse on the dot |

**Ember `#B4470F` is orange-red. Danger `#BE123C` is true red.** Keeping them apart is
the whole reason a cooling lead can read as urgent without reading as broken. A red
banner says *you did something wrong*; an ember rule says *someone is waiting*.

Danger is reserved exclusively for failure states and destructive confirmation.

### Listing source

Not decoration. A synced listing is overwritten on the next sync — editing one loses
your edit. A manual one is never touched. That changes what the user is allowed to do,
so the row gets a coloured leading spine (violet `#5B3FA8` / stone) as well as a tag.

---

## The design risk — the spine

One idea at two scales, which is what makes it a system rather than two flourishes.

**The spine sidebar.** Warm graphite rail, not the default white sidebar. The active
item is marked by a violet notch cut into the spine's inner edge with a soft bloom —
not a floating pill. Full labels at `xl`, icons `md`–`xl`, bottom tab bar below `md`.

**The conversation spine.** A 2px rail runs down the thread. Customer turns hang left,
machine and agent turns hang right. **The rail is the state indicator**: violet while
the AI holds the thread, ember from the handoff turn onward, back to violet after a
resume. Scrolling a long conversation, you can *see* where the machine stopped and a
human started.

Implementation note: the rail is rendered as a per-turn slice inside each `<li>`, not
one absolutely-positioned bar split by percentage. Percentages assume uniform turn
heights (image bubbles break that immediately) and can only express one switch point,
while a thread handed off and then resumed needs three segments.

Semantically the thread is an `<ol>` with a speaker label per turn. The rail is CSS,
not content — a screen reader gets the transcript.

---

## Motion

One animation in the product: the overdue-handoff dot. 3s, low amplitude — a heartbeat,
not a blink. A fast blink reads as an error.

Skeletons use a slow sheen over `sunk`. Everything else is a 150ms colour transition.
`prefers-reduced-motion` kills all of it.

---

## Responsive

| Breakpoint | Behaviour |
|---|---|
| `< md` (768) | Spine → bottom tab bar. **Tables → stacked cards, never horizontal scroll.** |
| `md`–`xl` | Icon-only spine |
| `≥ xl` (1280) | Full spine with labels |

Horizontally-scrolling tables are the single most common responsive-dashboard failure,
and the owner reads this on a phone between showings. Verified at 375px: no horizontal
overflow on any screen, tab targets 75×58px.

---

## The AI-slop checklist

The default output for "SaaS dashboard" is a white sidebar, blue primary, four bordered
stat cards each with a coloured icon in a rounded square, a generic table, and pill
badges. Before merging any screen, check you haven't shipped:

- [ ] An icon in a tinted rounded square on every KPI card
- [ ] A purple gradient hero band across the top of a page
- [ ] Emoji in an empty state
- [ ] Three different shadow depths on static cards
- [ ] "Welcome back, Ahmed 👋"
- [ ] A generic bar chart nobody asked for
- [ ] Pure `#FFF` or pure `#000` anywhere
- [ ] A second primary button on the same screen

**The test:** if you recoloured this and it could pass for any other admin panel, it
failed.

---

## Rules

1. **No hex literals in components.** Use a token. A new colour needs a row in this
   file and an entry in `@theme`. Arbitrary values are fine for one-off geometry
   (`w-[3px]`), never for colour.
2. **Status colour comes from `src/lib/status.ts`.** Never re-declare a stage hex.
3. **One primary action per screen.**
4. **Light only in v1.** The tokens are semantic (`canvas` / `surface` / `ink`), so a
   dark theme is a value swap rather than a refactor. It is not built.
5. **Every switch over a union ends in `assertNever`.** Otherwise a new `Turn` kind
   renders as a blank bubble instead of failing the build.
