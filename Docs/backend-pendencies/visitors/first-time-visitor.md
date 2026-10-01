# Backend Pendencies — First-Time Visitor Page

Spec: [`Docs/specs/visitors/first-time-visitor.md`](../../specs/visitors/first-time-visitor.md)

The backend was built specifically for this mockup (CourseCore
`Modules/Visitors`, `POST /api/visitors` / `GET /api/visitors`,
2026-10-01), so the screen's own data path has no code gap. The only items
are configuration and a mockup/backend mismatch already resolved in the
backend's favor.

## 1. Turnstile keys not provided

- **Mockup expects**: no visible CAPTCHA at all.
- **Backend today**: `RegisterVisitorUseCase` verifies `captchaToken`
  through `ICaptchaVerificationService` (Turnstile), the same service as
  `/register`. Verification is bypassed outside Production when
  `Turnstile:SecretKey` is unconfigured.
- **What's needed**: the same two credentials already tracked in
  [`auth/register.md`](../auth/register.md), pendency 1 — the Turnstile
  public site key (here) and secret key (backend). Nothing visitor-specific.
- **Workaround shipped**: same as `/register` — the widget renders only
  when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set. Otherwise the form submits
  an empty `captchaToken`, which the dev-mode backend accepts. Managed mode
  keeps the widget invisible unless Cloudflare decides to challenge,
  so it stays as close to the mockup's no-widget look as possible.
- **Severity**: Config.

## 2. Reception listing has no mockup (not a backend gap)

- **Mockup expects**: nothing — only the public form is designed.
- **Backend today**: `GET /api/visitors` (paginated, newest first,
  `search` over name/e-mail/phone, `ReadVisitors` policy / `visitors.read`
  permission) already exists.
- **What's needed**: a mockup for the reception team's screen; then a
  frontend spec. No backend work.
- **Workaround shipped**: none needed for this screen.
- **Severity**: Cosmetic (for this screen) — tracked here so the unused
  endpoint isn't forgotten.
