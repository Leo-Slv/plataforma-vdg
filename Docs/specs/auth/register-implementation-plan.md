# Register Page — Implementation Plan

Implements [`register.md`](register.md).

## Route constants

Add to `src/lib/routes/app-routes.ts`, inside the existing `auth` group
(`login`/`register` already exist since the landing page plan):

```ts
auth: {
	login: '/login',
	register: '/register',
	confirmEmail: '/confirm-email', // new — stub target for the post-register redirect
},
```

`/confirm-email` gets no page in this plan (non-goal per the spec) — same
stub treatment `/login`/`/catalog` already got from the landing page.

## Env var

Add to `src/lib/env.ts`:

```ts
const env = {
	apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:7165',
	turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
};
```

Add to `.env.example`:

```
# Cloudflare Turnstile site key (public). Leave empty in development —
# the register page skips rendering the widget and submits an empty
# captchaToken, which the local CourseCore backend accepts as long as
# Turnstile:SecretKey is also unconfigured there (see
# Docs/specs/auth/register.md, "Known gap").
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

## New dependency: `@marsidev/react-turnstile`

Zero-runtime-dependency React wrapper around Cloudflare's official
Turnstile script (handles script injection/cleanup and exposes
`onSuccess`/`onError`/`onExpire` plus an imperative `reset()` via ref —
otherwise this plan would hand-roll `next/script` + manual
`window.turnstile.render()` bookkeeping for no real benefit). React 19 is
within its peer range.

```
npm install @marsidev/react-turnstile
```

## Feature slice: `src/features/auth/`

Named `auth`, not `register` — this maps to the spec's own domain
(`Docs/specs/auth/`) and the backend's Auth module, which owns
register/login/confirm-email/resend/refresh/logout as one unit. Only
register's pieces are built now; login etc. drop into the same folder
later without relocating anything. No shared cross-screen component
(e.g. a card shell) is extracted yet — with only one screen using it,
that split is speculative until login actually exists.

```text
src/features/auth/
├── model/
│   └── auth-response.ts        # AuthResponse type (matches backend DTO)
├── schemas/
│   ├── auth-response.schema.ts # zod schema for the API response boundary
│   └── register-form.schema.ts # zod schema + inferred type for the form
├── api/
│   └── register.ts             # registerUser() — apiFetch + schema.parse
├── hooks/
│   └── auth.queries.ts         # useRegisterMutation()
├── lib/
│   └── password-strength.ts    # length -> 0-4 segment count (pure fn)
└── components/
    ├── register-page.tsx       # server component: shell + heading + RegisterForm
    ├── register-form.tsx       # 'use client': fields, Turnstile, submit, errors
    ├── form-field.tsx          # shared underline label+input (name/email)
    ├── password-field.tsx      # underline input + show/hide + strength bar
    └── *.spec.ts                # colocated, see "Tests" below
```

`src/app/register/page.tsx` (new route file):

```tsx
import { RegisterPage } from '@/features/auth/components/register-page';

export default function Register() {
	return <RegisterPage />;
}
```

### `model/auth-response.ts`

```ts
type AuthTokenResponse = {
	accessToken: string;
	refreshToken?: string | null; // present in the DTO, but the backend
	// omits it from the body (goes to the httpOnly cookie instead) — see
	// CLAUDE.md "Auth". Typed optional so parsing doesn't require it.
	expiresAt: string;
};

type AuthResponse = {
	userId: string;
	name: string;
	email: string;
	roles: string[];
	token: AuthTokenResponse;
};
```

### `schemas/auth-response.schema.ts`

Zod mirror of the above, used once at the API boundary in `api/register.ts`
(CLAUDE.md: only validate at system boundaries — this is one). `roles` is
`z.array(z.string())` (registration never returns any, per backend rule
1, but the shape still allows it).

### `schemas/register-form.schema.ts`

```ts
const registerFormSchema = z.object({
	name: z.string().trim().min(1, 'Informe seu nome completo.').max(200),
	email: z
		.string()
		.trim()
		.min(1, 'Informe seu e-mail.')
		.max(320)
		.email('E-mail inválido.'),
	password: z.string().min(12, 'Mínimo de 12 caracteres.'),
	captchaToken: z.string(),
});
type RegisterFormValues = z.infer<typeof registerFormSchema>;
```

`captchaToken` has no `min(1)` here deliberately — whether it's required
is conditional on Turnstile being configured at all (see "Turnstile
integration" below), which is a UI-level submit gate, not a schema rule.
No client-side rule reproduces the server's common-password blocklist
(spec's non-goals) — a locally-valid password can still come back
rejected; that's a server error to surface, not a client check to fake.

### `api/register.ts`

```ts
async function registerUser(payload: {
	name: string;
	email: string;
	password: string;
	captchaToken: string;
}): Promise<AuthResponse> {
	const data = await apiFetch<unknown>('/api/auth/register', {
		method: 'POST',
		body: payload,
	});
	return authResponseSchema.parse(data);
}
```

### `hooks/auth.queries.ts`

```ts
function useRegisterMutation() {
	return useMutation({ mutationFn: registerUser });
}
```

### `lib/password-strength.ts`

```ts
// Length-based only — the backend has no character-class rule (see
// PasswordPolicy.cs: min 12, max 72 UTF-8 bytes, common-password
// blocklist). 4 segments to match the mockup's bar.
function passwordStrengthSegments(password: string): 0 | 1 | 2 | 3 | 4 {
	if (password.length < 12) return 0;
	if (password.length < 16) return 1;
	if (password.length < 20) return 2;
	if (password.length < 24) return 3;
	return 4;
}
```

### Components

Same visual system as the landing page (`#0a0a0b` background, `#f2f2f0`
text, Jost/DM Sans, `oklch(0.72 0.1 248)` accent) — **hand-rolled Tailwind
markup, not the shadcn `Input`/`Button`/`Alert` primitives.** Same reason
as the landing page: those primitives are `rounded-none`, boxed, tiny
(`h-8`, `text-xs`), built for the generic `lyra` admin aesthetic — the
mockup's underline fields and full-width pill button are a different
visual language entirely. `react-hook-form` (logic, not markup) is used
normally.

- **`register-page.tsx`** (server component): centered `#0a0a0b` card
  (`max-w-[520px]`, matches mockup's `520px` card width), brand mark,
  "Criar sua conta" heading, "Já tem conta? Entrar" (→
  `appRoutes.auth.login`), renders `<RegisterForm />`.
- **`form-field.tsx`**: uppercase small label (Jost) + underline `<input>`
  (`border-0 border-b bg-transparent`, `rgba(255,255,255,.18)` at rest,
  the `oklch(0.62 0.1 248)` accent on `:focus`) + error text below in a
  literal destructive-red (`oklch(0.704 0.191 22.216)`, the existing
  `--destructive` token's dark-mode value, used as a literal for the same
  reason every other color here is literal). Props: `label`, `error`,
  plus everything `React.ComponentProps<'input'>` accepts — spreads RHF's
  `register('name')` return directly.
- **`password-field.tsx`**: same underline treatment, a
  "mostrar"/"ocultar" toggle (local `useState` flips `type`), the 4-segment
  bar driven by `passwordStrengthSegments(watchedValue)`, and the static
  "Mínimo de 12 caracteres." helper line. Takes the live value as a prop
  (parent does `form.watch('password')`) since RHF's uncontrolled
  `register()` alone doesn't expose it for the bar.
- **`register-form.tsx`** (`'use client'`): `useForm` +
  `zodResolver(registerFormSchema)`, `useRegisterMutation()`, a
  `useRef<TurnstileInstance>` for the widget (verify the exact ref-typed
  API against the installed package's types — `@marsidev/react-turnstile`
  exposes `reset()`/`getResponse()` via ref as of 1.6.x).
  - Renders `<Turnstile siteKey={env.turnstileSiteKey} options={{theme:
    'dark'}} onSuccess={...} onExpire={...} onError={...} />` **only when
    `env.turnstileSiteKey` is non-empty** — this is the real Cloudflare
    widget, so it won't visually match the mockup's mocked-up "✓
    Verificação de segurança concluída" box pixel-for-pixel; that box is
    the mockup's stand-in for an embed it can't render live, same
    category as the striped placeholder covers on the landing page.
  - Submit is disabled while `isPending`, and also while Turnstile is
    configured but not yet completed (`turnstileSiteKey && !captchaToken`).
  - On submit: call the mutation; on success, `setAccessToken(data.token
    .accessToken)` then `router.push(appRoutes.auth.confirmEmail)`.
  - On error, branch on `ApiError.status`:
    - `409` → `form.setError('email', { message: 'Este e-mail já está
      cadastrado.' })`, plus a small "Entrar" link next to that field.
    - `429` → form-level banner, rate-limit copy from the spec.
    - `400` where `error.message` (case-insensitive) includes "captcha" →
      reset the Turnstile widget via the ref, clear `captchaToken`, banner
      asking to redo the verification. This matches on the backend's
      literal exception text ("Captcha is invalid.") since
      `ApiErrorResponse` has no machine-readable error code — noted here
      as a known fragility, not hidden.
    - `400` otherwise, or unmatched → form-level banner with
      `error.message` (already user-facing per CLAUDE.md's API contract
      notes).
    - anything else (network/`503`/`500`) → generic banner, "Não foi
      possível criar sua conta agora. Tente novamente."
  - Form-level banner is a local `useState<string | null>`, rendered as
    `<div role="alert">` above the submit button.

## Tests

Same approach as the landing page — no DOM-testing library installed,
specs render via `react-dom/server`'s `renderToStaticMarkup` and assert
on the output string. Confirm empirically (as was done for
`next/image`/`next/link`) that `@marsidev/react-turnstile`'s `Turnstile`
renders inert under `renderToStaticMarkup` without throwing — it should,
since script injection happens in an effect that a static server render
never runs; adjust the plan here if that's wrong once the package is
installed.

- `schemas/register-form.schema.spec.ts`: valid payload passes; name
  empty/>200 chars, invalid email, email >320 chars, password <12 chars
  each fail with the expected message.
- `lib/password-strength.spec.ts`: boundary values at each of the 4
  thresholds.
- `components/form-field.spec.ts`: renders label, input value, and the
  error text only when `error` is passed.
- `components/register-page.spec.ts`: renders inside a throwaway
  `QueryClientProvider` (register-form needs one); asserts the heading,
  the "Já tem conta?" link's `href`, and that the submit button starts
  disabled when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset in the test env
  (captcha gate) — set the env var per-test via `process.env` before
  importing, since `env.ts` reads it at module load.

## Steps

1. Add `confirmEmail` to the `auth` route group.
2. Add `turnstileSiteKey` to `env.ts` and document the var in
   `.env.example`.
3. `npm install @marsidev/react-turnstile`.
4. Add `model/auth-response.ts`, `schemas/auth-response.schema.ts`,
   `schemas/register-form.schema.ts`.
5. Add `api/register.ts`, `hooks/auth.queries.ts`,
   `lib/password-strength.ts`.
6. Build components bottom-up: `form-field` → `password-field` →
   `register-form` → `register-page`.
7. Add `src/app/register/page.tsx`.
8. Add the colocated specs listed above.
9. Run `npm run test`, `npm run typecheck`, `npm run lint`; fix until
   green.
10. Manually check `/register` in the dev server (desktop + mobile
    viewport) against mockup `1c`, with `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
    unset — confirm the full submit round-trip against a local CourseCore
    backend (`dotnet run`, no `Turnstile:SecretKey` configured, so it
    bypasses verification per `TurnstileCaptchaVerificationService`):
    duplicate-email (`409`), a fresh valid registration (token stored,
    redirect to `/confirm-email` even though that page 404s today — same
    "stub route" acceptance already used for `/catalog`).
11. Update `src/features/README.md` and root `README.md`'s "Módulos
    ativos" per CLAUDE.md's "Docs" workflow step.
12. Commit in small, conventional-commit chunks separated by context
    (route + env; new dependency; model/schemas; api/hooks/lib;
    components; app wiring; tests; docs) — per CLAUDE.md, never one giant
    commit.
