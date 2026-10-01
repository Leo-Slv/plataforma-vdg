# First-Time Visitor Page ("Primeira vez")

**Status:** Approved (2026-10-01) — all open decisions resolved with option (a).

## Why

People visiting Igreja Viver da Graça for the first time should be able to
leave their contact details so the reception team can reach out in the
following days. This is **not** login or account registration: the visitor
gets no account, no session, no e-mail, and no access to courses. It is
purely contact-data collection.

CourseCore already supports this end to end (backend spec
`Docs/specs/visitors/first-time-visitor-registration.md` in the sibling
backend repo, `c:\Users\leonardo.silva\source\repos\CourseCore`,
implemented 2026-10-01). This spec builds the public page that submits to it.

## Source

Design reference: artboards `1a` (desktop, 1280) and `1b` (mobile, 390) in
[`Docs/design/mockups/Primeira Vez.html`](../../design/mockups/Primeira%20Vez.html).
Same visual system as the rest of the platform (near-black `#0a0a0b`
background, Jost headings, DM Sans body, `oklch(0.72 0.1 248)` accent
blue) — see [`landing-page.md`](../landing/landing-page.md) for the palette.

Unlike `/register` (underline fields, single centered card), this mockup
uses **boxed, rounded inputs** (10px radius, filled background) and, on
desktop, a two-column hero + form-card layout. It's a distinct look within
the same system, not a reuse of the auth form styling.

## Backend contract

`POST /api/visitors` — `[AllowAnonymous]`, rate-limited per IP
(`RateLimiting:VisitorRegistration`, 10/min by default):

- **Body**: `name`, `phone`, `email`, `address` (optional), `captchaToken`.
- **Success (201)**: `{ id, submittedAt }` only. No personal data is
  echoed back — the success message is built from what the form already
  holds.
- **Validation**:
  - `name`: required, at least 2 non-blank characters, max 200.
  - `phone`: required; masked (`(11) 98765-4321`) or digits-only accepted;
    must have **10 or 11 digits** after stripping non-digits (no `+55`).
  - `email`: required, valid format, max 320.
  - `address`: optional, max 300; blank is treated as absent.
  - Duplicate submissions are accepted (each creates a new record).
- **Errors**: `400` (any invalid field, or captcha missing/invalid —
  message `"Captcha is invalid."`), `429` (too many submissions from this
  IP), `500`.
- Captcha verification is bypassed outside Production when the backend
  has no `Turnstile:SecretKey` — same as `/register`.

## Goals

- Let a first-time visitor submit name, phone, e-mail, and optional
  address, matching mockups `1a`/`1b`.
- Apply the phone mask from the mockup as the visitor types.
- Validate client-side with the same rules as the backend, showing the
  mockup's single form-level error message.
- Show the in-place confirmation state on success, and let the same
  device register another person ("Cadastrar outra pessoa") — the mockup
  explicitly supports a shared reception device/kiosk.
- Protect the endpoint with Turnstile, same as `/register`, without a
  visible widget change where possible.

## Non-goals

- Any login/account/session behavior. The page never stores or reads an
  access token for its own purposes.
- The reception team's screen for reading submissions
  (`GET /api/visitors`) — the mockup doesn't design one; it gets its own
  spec when a mockup exists.
- Follow-up workflow (contacted status, notes, assignment), export, or
  notifications — not in the backend either.
- International phone numbers.
- Fetching the service schedule ("Cultos aos domingos · 10h e 18h") from
  the API — it's static copy.

## Page content

### Header (both breakpoints)

- Brand mark (`/brand/viver-da-graca-mark.png`, circular) + "Viver da
  Graça" wordmark (Jost, light, uppercase, wide tracking).
- Desktop only: right-aligned "Cultos aos domingos · 10h e 18h".
- Thin bottom border.

### Desktop (`1a`)

Two columns: hero on the left, form card (~520px) on the right. A large,
faded (10% opacity) circular brand mark bleeds off the bottom-left corner
as decoration.

- Hero:
  - Pill badge: "Primeira vez aqui" (accent text and border).
  - Heading: "Que bom ter / você **com a gente.**" (Jost extralight, the
    last phrase in regular weight).
  - Lede: "Deixe seus dados para nossa equipe de recepção entrar em
    contato nos próximos dias."
- Form card (`surface` background, subtle border, 16px radius):
  - Title "Seus dados" + subtitle "Usamos apenas para entrar em contato."
  - **Nome completo** — placeholder "Como podemos chamar você?"
  - **Telefone** and **E-mail** side by side — placeholders
    "(00) 00000-0000" and "voce@email.com".
  - **Endereço** — with an "opcional" hint on the label's right side;
    placeholder "Rua, número, bairro, cidade".
  - Error line (only after a failed attempt).
  - "Enviar" full-width pill button.

### Mobile (`1b`)

Single column: badge, heading ("Que bom ter você **com a gente.**"),
lede, then all four fields stacked, error line, "Enviar" pill, and the
"Usamos seus dados apenas para entrar em contato." note centered under
the button. No form card container.

### Success state (replaces the form in place)

- Accent-outlined circle with a check mark.
- "Obrigado, {first name}." — first whitespace-separated word of the
  submitted name.
- "Recebemos seus dados. Nossa equipe vai falar com você pelo telefone
  {masked phone} em breve."
- "Cadastrar outra pessoa" outline pill button → back to an empty form.

On mobile the heading/lede disappear in the success state (mockup `1b`
replaces everything below the badge); on desktop only the card content
swaps, the hero stays.

## Behavior

### Phone mask

As the visitor types, keep only digits (max 11) and format:

| Digits | Display           |
| ------ | ----------------- |
| 1–2    | `(1` / `(11`      |
| 3–6    | `(11) 9876`       |
| 7–10   | `(11) 3456-7890`  |
| 11     | `(11) 98765-4321` |

The masked value is what's sent — the backend normalizes it.

### Client-side validation

Matches mockup + backend:

- Nome: at least 2 characters after trimming, max 200.
- Telefone: 10 or 11 digits.
- E-mail: valid format, max 320.
- Endereço: optional, max 300.

Validation runs on submit. After the first failed attempt, the invalid
fields get a red border and a single message appears above the button:
**"Preencha nome, telefone e um e-mail válido."** (The mockup has no
per-field messages.) An over-long address — not in the mockup — shows its
own short message instead.

### Submit

1. Disable the button with a pending label ("Enviando...").
2. `POST /api/visitors` with the form values and `captchaToken`.
3. **Success** → success state (above). The Turnstile token is single-use,
   so "Cadastrar outra pessoa" must reset the widget too.
4. **Errors**:
   - `400` whose message contains "captcha" → reset Turnstile and show
     "Não foi possível confirmar a verificação de segurança. Tente
     novamente."
   - `400` otherwise → the mockup's single validation message.
   - `429` → "Muitos cadastros seguidos a partir desta rede. Aguarde um
     minuto e tente novamente."
   - `500`/network → "Não foi possível enviar seus dados agora. Tente
     novamente."

### Turnstile

Same approach as `/register`: render the widget only when
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set; submit is gated on a token only
in that case. The mockup shows no widget — use Turnstile's managed mode
with the dark theme so it stays as unobtrusive as Cloudflare allows
(typically invisible unless a challenge is needed).

### Auth state

The page is public and ignores whether the visitor is logged in. A stored
access token, if any, isn't cleared or used.

## Acceptance criteria

- The page renders mockup `1a` at desktop widths and `1b` at mobile widths.
- Typing in Telefone applies the mask from the table above, capped at 11
  digits.
- Submitting with an invalid name/phone/e-mail shows the single error
  message and red borders on the invalid fields, without calling the API.
- Address is optional; an empty address submits fine.
- A valid submit calls `POST /api/visitors` and swaps to the success
  state with the visitor's first name and masked phone.
- "Cadastrar outra pessoa" returns to an empty form (and a fresh Turnstile
  challenge when Turnstile is enabled).
- Captcha `400`, other `400`, `429`, and network/`500` each show their own
  readable message.
- With `NEXT_PUBLIC_TURNSTILE_SITE_KEY` unset, the page works end to end
  against a local CourseCore backend.
- No account, token, or redirect happens on success.

## Decisions (resolved 2026-10-01)

1. ✅ **Route path** → (a) `/primeira-vez`. Existing routes are English (`/register`, `/catalog`).
   This page is probably shared as a QR code or printed link for
   Portuguese-speaking visitors.
   - (a) **Recommended:** `/primeira-vez` — readable when printed; a
     deliberate exception, recorded in the plan.
   - (b) `/first-visit` — consistent with the existing routes.
2. ✅ **Entry points** → (a) no landing link. The mockup doesn't show where the page is linked from.
   - (a) **Recommended:** no link from the landing page for now; reached by
     direct URL/QR code only.
   - (b) Add a link in the landing header/footer (needs copy and a spot).
3. ✅ **Reception listing screen** → (a) out of scope. The backend already has
   `GET /api/visitors` (`visitors.read`), but there's no mockup for it.
   - (a) **Recommended:** out of scope here; spec it once a mockup exists.
   - (b) Build a minimal admin table now, in the style of
     `/admin/testimonials`.
