# Security — what this build does and does not enforce

This repo is a UI layer over sample data. Several things that look like security
controls are display behaviour. They are listed here so nobody ships on top of them
believing otherwise.

**Nothing below is a bug in this build. Every item is a contract requirement for
whoever wires the backend.**

---

## Not enforced here

### 1. Lead visibility is a display filter, not a boundary

`src/lib/rbac.ts` scopes leads by role, and `lib/data/getLead` throws `forbidden` when
an agent requests someone else's lead. That stops the obvious path. It does not stop
devtools, and in a client-reachable app the data is reachable.

The brief's stated reason for the split is that agents compete for commission and
won't accept colleagues browsing their conversations. That makes it a real
confidentiality requirement, not a nicety.

**Required:** enforce scoping server-side in whatever serves `getLeads` / `getLead`.
The check already lives in `lib/rbac.ts` and is called only from `lib/data/*` — never
from components — specifically so this is a one-file change. → `TODOS.md` T-01

### 2. Approved corrections are untrusted input

An approved correction is free text written by an agency user that the AI then follows
in **every future conversation with every customer**. Two consequences:

- **Prompt injection.** It must be injected into the model context as *delimited,
  labelled reference data* — never concatenated into the system prompt as
  instructions. A correction reading "ignore previous instructions and…" must be inert.
- **Tenant scoping.** Retrieval must be scoped by agency id. Unscoped, one client's
  pricing rules answer another client's customers.

The UI half is done: owner-only approval, a confirmation dialog showing the verbatim
text, and `approvedBy` / `approvedAt` recorded against every entry. → `TODOS.md` T-02

### 3. Photo upload validation is client-side only

`ListingControls.tsx` restricts to `image/jpeg`, `image/png`, `image/webp` and 5 MB.
That is a convenience for the user, not a control — the type comes from the browser.

**Required server-side:** magic-byte validation (do not trust the declared MIME type),
a hard 5 MB cap, **reject SVG outright** (it is scriptable), and re-encode rather than
storing the original bytes. → `TODOS.md` T-03

### 4. No authentication

`/login` validates the shape of an email and routes. `src/lib/session.ts` reads a role
from a plain cookie with no signature. That file is the single seam where a real
session read goes.

### 5. No tenancy

Single-agency assumption throughout. There is no `agencyId` in any query because there
is only one agency. Every read and write needs to be scoped by a tenant claim taken
from the token — never from a client-supplied parameter.

---

## Already handled, keep it that way

- **XSS from WhatsApp content.** Customer messages are attacker-controlled text. They
  render through `<UserText>`, which is a plain React text node. `dangerouslySetInnerHTML`
  appears nowhere in this repo and must not — not for links, not for emoji, not for
  formatting.
- **Phone numbers are personal data** under UAE PDPL, and GDPR for EU buyers. Never log
  a full number. `maskPhone()` in `src/lib/format.ts` gives a last-4 form for anywhere a
  number might reach telemetry.
- **Error messages don't leak.** `/forgot-password` deliberately does not reveal whether
  an account exists — "if an account exists for that address" — because the alternative
  hands an attacker a roster of who works at the agency.
- **No secrets exist yet.** When WhatsApp and Apify credentials arrive they are
  server-only. Anything named `NEXT_PUBLIC_*` is in the browser bundle, permanently.

---

## Checklist before real data

- [ ] Lead scoping enforced server-side; verified by requesting another agent's lead id
- [ ] Corrections injected as delimited untrusted data, scoped by agency
- [ ] Upload validation server-side: magic bytes, 5 MB, no SVG, re-encode
- [ ] Real session: signed, httpOnly, `sameSite=lax`, rotation on privilege change
- [ ] Every query scoped by tenant claim from the token
- [ ] Rate limiting on auth and password-reset endpoints
- [ ] Audit log for correction approvals and agent removals
- [ ] No `NEXT_PUBLIC_` secret of any kind
- [ ] CSP headers; no `unsafe-inline` script
