# Register Page

## Why

Self-registration is how anyone gets into the platform — there is no
invite system and no admin-created-account requirement (see the
CourseCore backend spec at
`Docs/specs/catalog/self-registration-and-free-courses.md` in the
sibling backend repo, `c:\Users\leonardo.silva\source\repos\CourseCore`
— same one CLAUDE.md points to for the API contract). The landing
page's "Começar gratuitamente" / "Criar conta" CTAs already point at
`appRoutes.auth.register` (`/register`) — this spec builds the page
that lives there.

## Source

Design reference: artboard `1c` ("Cadastro (Turnstile)") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same visual system as the landing page (near-black `#0a0a0b` background,
Jost headings, DM Sans body, `oklch(0.72 0.1 248)` accent blue) — see
[`landing-page.md`](../landing/landing-page.md) for the full palette.
Single centered card, no header/footer chrome around it.

## Backend contract

`POST /api/auth/register` (public, rate-limited by IP — same window as
login):

- **Body**: `name`, `email`, `password`, `captchaToken`.
- **Success (201)**: `AuthResponse` — same shape as login (`userId`,
  `name`, `email`, `roles`, `token`). Refresh token cookie is set by the
  backend response; the access token in the body is this repo's job to
  store (`src/lib/auth/access-token.ts`), same as any other auth call.
- **Validation** (mirrors admin user creation): `name` required, ≤200
  chars; `email` required, valid format, ≤320 chars, must be unique;
  `password` required, ≥12 chars, ≤72 UTF-8 bytes, rejected if it's one
  of a small server-side common-password blocklist — that blocklist is
  not exposed to the client, so a password that looks valid client-side
  can still come back rejected.
- **Errors**: `400` (captcha missing/invalid, or field validation
  failure), `409` (email already registered), `429` (too many attempts
  from this IP), `500`.
- Registration **authenticates immediately** — success means the visitor
  is now logged in, just not yet email-confirmed. No separate login step
  is needed after registering.

## Goals

- Let a visitor create an account: name, email, password, CAPTCHA.
- Match the backend's validation rules closely enough that most
  rejections are caught before submit, while still surfacing whatever
  the server rejects that the client couldn't predict (the password
  blocklist, email-uniqueness).
- On success, store the access token and move the visitor toward email
  confirmation — the account is unusable for real content until that
  happens (see CLAUDE.md, "Auth", and the backend spec's rule 10).
- Read as the same product as the landing page: same visual language,
  same brand mark.

## Non-goals

- The email-confirmation screen itself (mockup `1e`), the login screen
  (`1d`), or a "forgot password" flow — none exist in CourseCore either
  (backend spec, §10). This spec covers `/register` only.
- Terms-of-use / privacy-policy pages — same placeholder treatment as
  the landing page's footer links (`landing-page.md`, "Open decisions"):
  inert for now, no destination page speced yet.
- Reproducing the server's common-password blocklist client-side.
- Building a general-purpose CAPTCHA abstraction for other forms —
  Turnstile is used here only, matching the backend spec's §10 ("CAPTCHA
  em login ou em qualquer outro endpoint além de registro... não foi
  pedido").

## Page content

Single card, centered on the dark background, no page header/footer:

- Brand mark (small, circular, same asset as the landing page).
- Heading: "Criar sua conta".
- "Já tem conta? Entrar" — links to `appRoutes.auth.login`.
- Form fields, underline style (not boxed inputs), in order:
  1. **Nome completo** — text, required.
  2. **E-mail** — email, required.
  3. **Senha** — password, required, with a "mostrar"/"ocultar" toggle,
     a length-based progress indicator, and helper text "Mínimo de 12
     caracteres."
  4. **CAPTCHA** (Cloudflare Turnstile widget) — required to submit.
- Consent line: "Ao criar a conta você aceita os termos de uso e a
  política de privacidade." (`termos de uso` as an inline link) — this
  is prose above the submit button, not a checkbox; submitting the form
  is the acceptance.
- Submit button: "Criar conta" (full-width pill).

## Behavior

### Client-side validation (before submit)

- Nome: required, ≤200 chars.
- E-mail: required, valid email format, ≤320 chars.
- Senha: required, ≥12 chars. No character-class rules (matches the
  backend — see "Backend contract").
- CAPTCHA: must have a completed Turnstile token before submit is
  enabled.

### Submit

1. Disable the submit button, show a pending state.
2. Call `POST /api/auth/register` with `{ name, email, password,
   captchaToken }`.
3. **On success**: store the returned access token
   (`setAccessToken`), then redirect toward the email-confirmation step.
   That screen isn't specced yet — until it is, the redirect target is a
   stub route (`appRoutes.auth.confirmEmail`), same treatment the
   landing page gave to `/register`/`/catalog` before they existed.
4. **On error**: re-enable the form and show a message near the field
   that caused it when the API says which field, otherwise a form-level
   error banner:
   - `409` → "Este e-mail já está cadastrado." near the E-mail field,
     with a link to `appRoutes.auth.login`.
   - `429` → a rate-limit message (same tone as the login screen's
     mockup copy: "Muitas tentativas seguidas bloqueiam o acesso por
     alguns minutos, por segurança.").
   - `400` with a captcha-related message → reset the Turnstile widget
     and ask the visitor to complete it again.
   - `400` otherwise, or unmatched → show the server's `message`
     (CourseCore's `ApiErrorResponse.message` is already meant to be
     user-facing) in a form-level banner.
   - `500`/network → generic "Não foi possível criar sua conta agora.
     Tente novamente." banner.

## Known gap: Turnstile site key not yet provided

CourseCore's own spec for this flow (§11.1) already documents that
neither the Turnstile secret key nor a Resend API key have been
provided yet, and that this doesn't block implementation: the backend
verifies CAPTCHA server-side, but **bypasses verification entirely
outside Production** when `Turnstile:SecretKey` is unconfigured
(`TurnstileCaptchaVerificationService.VerifyAsync`) — any `captchaToken`
value, including empty, succeeds against a local dev backend today.

The frontend needs its own (public) Turnstile **site key** to render the
widget — unrelated to the backend's secret key, and equally not
provided yet. Same non-blocking treatment: a new
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` env var, empty by default in
`.env.example`. When it's unset, the page skips rendering the Turnstile
widget and submits with an empty `captchaToken` — which the local
backend accepts today per the bypass above. When a real site key is
added later, the widget renders for real and the submit button's
"CAPTCHA completed" gate becomes meaningful; no code branching needed
beyond "render the widget if the key is configured."

## Acceptance criteria

- `/register` renders the card described above, matching mockup `1c`.
- Client-side validation blocks submit for empty/too-long name, invalid
  or too-long email, and passwords under 12 characters, with inline
  errors.
- A successful submit stores the access token and redirects toward
  email confirmation (stub route).
- Each documented error case (`400` field, `400` captcha, `409`, `429`,
  `500`/network) renders a distinct, user-readable message, not a raw
  API error dump.
- With `NEXT_PUBLIC_TURNSTILE_SITE_KEY` unset, the page still works
  end-to-end against a local dev CourseCore backend (widget hidden,
  empty token sent, backend bypasses verification).
- No admin/internal fields (roles, etc.) are exposed — this is the
  public registration form only.
