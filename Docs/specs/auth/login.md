# Login Page

## Why

Returning users need a way back in — `appRoutes.auth.login` (`/login`)
already exists as a link target from the landing page's header and from
the register page's "Já tem conta?" line; this spec builds the page that
lives there.

## Source

Design reference: artboard `1d` ("Login") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same card layout, colors, and type system as `/register` (see
[`register.md`](register.md), "Source") — same `520px` centered dark
card, same underline fields.

Also checked, per CLAUDE.md's instruction to prefer an established
convention over inventing one: the reference project's
`front/src/features/login/components/LoginForm.tsx`. Two things from it
carry over here (details below): its "Lembrar de mim" checkbox is
rendered but never wired to `register()`/`onChange` — fully decorative —
and its "Esqueci minha senha" link points at a real
`ForgotPasswordForm.tsx` flow that CourseCore has no backend for (see
"Known gaps").

## Backend contract

`POST /api/auth/login` (public, rate-limited by IP — same policy as
register):

- **Body**: `email`, `password`.
- **Success (200)**: `AuthResponse` — identical shape to register's
  (`userId`, `name`, `email`, `roles`, `token`). Refresh token cookie is
  set by the response, same as register.
- **Errors**: `401` for *any* failure reason — missing fields, unknown
  email, wrong password, or inactive user all produce the same
  `"Invalid credentials."` (`LoginUseCase.ExecuteAsync`, which also
  runs a dummy password-hash check when the user doesn't exist, so a
  nonexistent email doesn't respond faster than a wrong password would —
  deliberate enumeration/timing protection on the backend's part). There
  is no field-specific error to surface, unlike register's `409` — the
  UI must not imply whether it was the e-mail or the password that was
  wrong. `429` (too many attempts), `400`/`500` (malformed
  request/server error).
- Login does **not** check `EmailVerifiedAt` — an unconfirmed account can
  still log in and get a session; content access (not login) is what's
  gated on email confirmation (CLAUDE.md, "Auth"; backend spec rule 10).

## Goals

- Let a returning user sign in with email + password.
- Read as the same product as `/register` — identical visual system, one
  `AuthResponse` handling path reused where it already exists
  (`setAccessToken`, `isApiError`).
- On success, land somewhere real: `appRoutes.catalog.index` (`/catalog`)
  — the product's actual "you're in" destination once a session exists,
  regardless of email-confirmation status (per backend rule 9, the
  catalog itself is visible unconfirmed; it's still a stub route today,
  same as when `/register` first linked to it).

## Non-goals

- **Forgot password.** CourseCore has no password-recovery endpoint —
  confirmed absent from `Docs/specs/catalog/self-registration-and-free-courses.md`'s
  own "Fora de escopo" list in the backend repo. The reference project's
  equivalent screen is a real, working flow against a different backend;
  this is a deliberate deviation, not an oversight. See "Known gaps."
- **"Remember me" with real behavior.** No backend concept exists for
  it (`LoginRequest` is just `email`/`password`; the refresh-token cookie
  always gets the same fixed `MaxAgeDays` regardless — see
  `RefreshTokenCookieService.cs`). The reference project's own checkbox
  is equally inert (rendered, never wired to its form state) — same
  treatment here, not a gap to fill.
- **Redirect away from `/login` if already authenticated.** Would need
  decoding/expiry-checking the stored JWT client-side, which is a
  general "is this session still valid" concern that belongs with
  whatever page first needs to gate access (the catalog, once it's
  built) — not duplicated here for a single caller.
- The catalog page itself (`/catalog`) — still a stub route, per the
  landing page spec's original decision.

## Page content

Single card, centered on the dark background, no page header/footer
(identical shell to `/register`):

- Brand mark (same asset).
- Heading: "Bem-vindo de volta".
- "Não tem conta ainda? Criar conta" — links to `appRoutes.auth.register`.
- Form fields, underline style:
  1. **E-mail** — email, required.
  2. **Senha** — password, required, with a "mostrar"/"ocultar" toggle
     (no strength meter or length helper here — those are register-only,
     tied to the password-creation rule, not login).
  3. A row with an inert **"Continuar conectado neste aparelho"**
     checkbox on the left and an **"Esqueci"** link on the right (→
     `appRoutes.auth.forgotPassword`, a new stub route — no page, same
     treatment `/register`/`/catalog` got before they existed).
- Submit button: "Entrar" (full-width pill, same as register's "Criar
  conta").
- Below a divider: "Muitas tentativas seguidas bloqueiam o acesso por
  alguns minutos, por segurança." — shown as a **static, always-visible**
  disclaimer per the mockup (not conditional on an actual `429`).

## Behavior

### Client-side validation (before submit)

- E-mail: required, valid email format.
- Senha: required (non-empty only — this field is authenticating an
  *existing* password, not creating one, so the 12-character creation
  rule from `/register` does not apply here).

### Submit

1. Disable the submit button, show a pending state ("Entrando..." /
   "Entrar").
2. Call `POST /api/auth/login` with `{ email, password }`.
3. **On success**: store the access token, redirect to
   `appRoutes.catalog.index`.
4. **On error**, branch on `ApiError.status`:
   - `401` → a single form-level message, **not** attached to either
     field (per "Backend contract" — the API deliberately doesn't say
     which one was wrong): "E-mail ou senha incorretos."
   - `429` → form-level banner with the same rate-limit copy already
     shown statically below the button (the static disclaimer stays
     visible either way; this is the same message surfacing as an
     actual error, not a second, different one).
   - `400`/unmatched → form-level banner with the server's `message`.
   - network/`500` → generic "Não foi possível entrar agora. Tente
     novamente." banner.

## Known gaps

- **Forgot password**: no CourseCore endpoint. "Esqueci" is a stub link
  (`appRoutes.auth.forgotPassword`, no page) — same non-blocking
  treatment as every other not-yet-built destination in this repo.
  Revisit only if a password-recovery endpoint gets speced on the
  CourseCore side first (same condition already attached to the
  `/auth/me` gap in CLAUDE.md).
- **"Remember me"**: decorative only, matching the reference project's
  own unwired checkbox — not a missing feature, a deliberately-scoped-out
  one, since there is nothing on either backend for it to control.

## Acceptance criteria

- `/login` renders the card described above, matching mockup `1d`.
- Client-side validation blocks submit for an empty/invalid email or an
  empty password, with inline errors.
- A successful submit stores the access token and redirects to
  `appRoutes.catalog.index`.
- A `401` renders one form-level "E-mail ou senha incorretos." message —
  never attached to the e-mail or password field individually.
- `429`, `400`, and network/`500` each render a distinct, user-readable
  message.
- The "Continuar conectado" checkbox and "Esqueci" link render per the
  mockup but carry no functional promise beyond what's stated above.
