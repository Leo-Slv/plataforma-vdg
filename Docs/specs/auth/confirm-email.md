# Confirm Email Page

## Why

Both `/register` and (for an unconfirmed account) `/login` land the user
somewhere real once a session exists — right now `appRoutes.auth
.confirmEmail` (`/confirm-email`) is a stub. Until a user confirms,
`GET /api/courses/available` shows the catalog but every course is
locked (backend spec rules 9–10) — this page is what gets them from "just
registered" to "can actually watch something."

## Source

Design reference: artboard `1e` ("Confirmação de e-mail — estado
bloqueado") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same visual system as `/register`/`/login` (see
[`register.md`](register.md), "Source") — same `520px` centered dark
card. One deviation from the mockup is load-bearing enough to call out
up front (next section) rather than bury in "Known gaps."

## Deviation from the mockup: a code to paste, not a link to click

The mockup's copy says "Enviamos um link para ana.souza@email.com" and
shows only two actions, "Reenviar link" / "Trocar e-mail" — no field to
enter anything. That assumes the email contains a clickable URL. It
doesn't, today:

- The token is a 32-byte random value, base64url-encoded, ~43 opaque
  characters (`SecureEmailVerificationTokenGenerator.Generate()`) —
  shaped like something meant to go in a URL query string.
- But the actual email body
  (`RegisterUseCase`/`ResendEmailConfirmationUseCase`'s
  `BuildVerificationEmailHtml`) just renders
  `<p>Use o código a seguir para confirmar seu e-mail:</p><p><strong>
  {token}</strong></p>` — the raw token as text, with **no `<a href>`**
  wrapping it. There's no frontend base URL in the backend's config for
  it to build a link with anyway.

So today, confirming email means: open the email, copy that string,
paste it somewhere in the app. This page adds the one thing the mockup
didn't need to show because it assumed a link: a field to paste the
token into, plus a submit action that calls
`POST /api/auth/confirm-email`. Everything else from the mockup (icon,
heading, status card, resend/change-email actions, the rate-limit
footnote) carries over; copy that says "link" becomes "código" throughout.

This page also reads a `?token=` query param on load, pre-filling (and
auto-submitting) the field — free to support alongside the paste field,
and it's exactly what would make a *real* emailed link work if the
backend's template gets a proper `<a href>` later. No backend change is
required by this plan; it's just not left on the table.

## Backend contract

Both endpoints require the caller to already be authenticated as the
account the token belongs to (`GetCurrentUserId()` from the JWT, not a
request field) — this page is CourseCore's first page that only makes
sense for a logged-in user (see "Auth gating").

| Endpoint | Auth | Body | Success | Errors |
|---|---|---|---|---|
| `POST /api/auth/confirm-email` | Bearer | `{ token }` | `204` | `400` invalid/expired/already-used token, `401` not authenticated, `500` |
| `POST /api/auth/resend-confirmation` | Bearer | — | `204` | `401`, `404` user not found, `409` email already confirmed, `429` rate-limited, `500` |

- `ConfirmEmailUseCase` checks the token belongs to *the calling user*
  (`token.UserId != currentUserId` fails the same as an invalid token) —
  so a token copy-pasted while logged in as a different account than the
  one it was issued to also comes back as the generic invalid-token
  `400`, not a more specific error. Don't try to distinguish that case.
- `ResendEmailConfirmationUseCase` invalidates the previous token before
  issuing a new one (backend spec rule 11) — an old pasted code stops
  working the moment a new one is requested.
- Tokens expire 24h after issuance (`EmailVerificationTokenExpirationHours`)
  — not surfaced as a countdown anywhere; an expired token just fails
  the same `400` as any other invalid one.
- There's no "am I confirmed?" read endpoint (same `/auth/me` gap
  documented in CLAUDE.md's "Auth" section) — the page can't know the
  current status on load. It only finds out indirectly: a `409` from
  resend means "already confirmed."

## Goals

- Let a logged-in, unconfirmed user paste their emailed code and
  confirm, request a new code, or (per the mockup) see the option to
  change their e-mail.
- On confirmation succeeding, move on: redirect to
  `appRoutes.catalog.index`, the same destination `/login` already
  redirects to.
- Read as the same product as the other auth screens.

## Non-goals

- **Actual email-change functionality.** No self-service endpoint exists
  for a user to change their own e-mail — `PUT /api/users/{userId}`
  requires the `ManageUsers` policy (admin-only), and a self-registered
  user has no roles at all (backend spec rule 1). "Trocar e-mail" is a
  stub link, no page, same treatment as `/forgot-password`.
- **Fixing the backend's email template to send a real link.** Noted
  above as a nice follow-up on the CourseCore side; this plan works
  either way and doesn't depend on it.
- **A countdown or "confirmed" status badge without user action** — no
  endpoint provides that, per "Backend contract."
- **Login persisted through the auth-gate redirect** (see "Auth
  gating") — if there's no stored token, this plan sends the visitor to
  `/login` with no way to return to the pasted code afterward. Revisit
  only if that friction turns out to matter in practice.

## Auth gating

The first real protected page in this repo — every action on it needs a
Bearer token, so the page needs one to render meaningfully at all. On
mount: if `getAccessToken()` returns nothing, redirect to
`appRoutes.auth.login` immediately (no flash of the confirm-email UI).
This is exactly the client-side pattern CLAUDE.md's "Auth" section
already describes for gating ("read the stored access token... redirect
if missing") — this page is simply the first caller of it. The guard
lives in this feature (not a shared `requireAuth` utility yet) since
nothing else needs it until the catalog/dashboard screens do.

## Page content

Single card, centered on the dark background, same shell as
`/register`/`/login`:

- Circular envelope icon (accent-blue outline).
- Heading: "Confirme seu e-mail para liberar as aulas".
- Body: "Enviamos um código para **{email}**. Até você confirmar, o
  catálogo fica visível mas nenhuma aula abre — inclusive nos cursos
  gratuitos." `{email}` comes from the stored auth state (see "Where the
  e-mail comes from").
- Status card (bordered box, `#101012` fill):
  - "Status da conta" label.
  - Three rows: "Conta criada" → "✓ concluído"; "E-mail confirmado" →
    "pendente"; "Acesso às aulas" → "bloqueado". Static — there's no
    partial state to reflect (see "Backend contract" on the missing
    status-read endpoint).
- **New** (not in the mockup — see "Deviation"): a "Código de
  confirmação" underline field + "Confirmar e-mail" submit button
  (full-width pill, same treatment as register's/login's submit).
- Below: "Reenviar código" and "Trocar e-mail" as a secondary two-up
  row, same pill/outline pairing the mockup already shows for "Reenviar
  link"/"Trocar e-mail".
- Footer line: "Você pode pedir um novo código a cada 2 minutos." (copy
  swap only — the *2 minutes* framing was already the mockup's; the
  real rate limit is enforced server-side regardless of what this says).

## Where the e-mail comes from

Register's and login's `AuthResponse` already includes `email` — worth
storing it (alongside the access token, same lifecycle) specifically so
this page can display it without a `/me` call. Small, scoped addition to
`src/lib/auth/access-token.ts`'s stored-state shape, detailed in the
implementation plan.

## Behavior

### On mount

1. No access token → redirect to `/login` (see "Auth gating").
2. Read `?token=` from the URL. If present, pre-fill the code field and
   submit immediately.

### Confirm (submit the code field)

1. Disable the field/button, pending state.
2. `POST /api/auth/confirm-email` with `{ token }`.
3. **Success (`204`)**: brief confirmed state (status card's "E-mail
   confirmado"/"Acesso às aulas" rows flip to done, matching the visual
   language already established), then redirect to
   `appRoutes.catalog.index`.
4. **Error**:
   - `400` → inline error under the field: "Código inválido ou
     expirado. Peça um novo código." — don't try to distinguish
     invalid/expired/wrong-account (see "Backend contract").
   - `401` → the token expired mid-session; redirect to `/login` (same
     handling as the auth-gate case).
   - network/`500` → generic form-level banner, same tone as the other
     auth screens.

### Reenviar código

1. Pending state on that button specifically (confirm button/field stay
   independently usable).
2. `POST /api/auth/resend-confirmation`.
3. **Success (`204`)**: toast/banner "Novo código enviado." — no page
   navigation.
4. **Error**:
   - `409` → the account turns out to already be confirmed: treat like
     a confirm success (redirect to `/catalog`).
   - `429` → banner with the standing rate-limit copy already visible on
     the page.
   - `401`/`404` → redirect to `/login` (broken session).
   - network/`500` → generic banner.

### Trocar e-mail

Stub link (`appRoutes.auth.changeEmail`, new — no page), per "Non-goals."

## Acceptance criteria

- Visiting `/confirm-email` with no stored access token redirects to
  `/login` before rendering the form.
- The page renders the mockup's icon/heading/status-card/footer, plus
  the new code field + "Confirmar e-mail" button, with "link" copy
  swapped for "código" throughout.
- `?token=xyz` in the URL pre-fills and auto-submits the code field.
- A successful confirm redirects to `/catalog`.
- An invalid/expired code shows one generic inline error, never
  distinguishing *why* it failed.
- "Reenviar código" success shows a non-blocking confirmation; a `409`
  from it is treated as "you're already confirmed" and redirects same as
  a successful confirm.
- "Trocar e-mail" is present but inert beyond linking to a stub route.
