# Confirm Email Page — Implementation Plan

Implements [`confirm-email.md`](confirm-email.md).

## Route constant

Add to `src/lib/routes/app-routes.ts`, inside the existing `auth` group:

```ts
auth: {
	login: '/login',
	register: '/register',
	confirmEmail: '/confirm-email', // already existed, now gets its real page
	forgotPassword: '/forgot-password',
	changeEmail: '/change-email', // new — stub target for "Trocar e-mail"
},
```

## Storing the e-mail alongside the access token

`src/lib/auth/access-token.ts` gets a second stored value, same
lifecycle as the token (this is what lets the page show "Enviamos um
código para {email}" without a `/me` call — see spec, "Where the e-mail
comes from"):

```ts
const USER_EMAIL_STORAGE_KEY = 'coursecore.auth.user-email';

function getUserEmail() { /* same canUseWebStorage guard as getAccessToken */ }
function setUserEmail(email: string) { /* same shape as setAccessToken */ }
```

`clearAccessToken()` also removes `USER_EMAIL_STORAGE_KEY` — one
"clear the session" call instead of two scattered ones.

`register-form.tsx` and `login-form.tsx`'s `onSuccess` handlers each
gain one line, `setUserEmail(data.email)`, right after the existing
`setAccessToken(data.token.accessToken)`.

## Feature slice: `src/features/auth/` (extends register/login)

```text
src/features/auth/
├── schemas/
│   └── confirm-email-form.schema.ts  # token: non-empty string
├── api/
│   ├── confirm-email.ts              # confirmEmail(token) -> void, 204
│   └── resend-confirmation.ts        # resendConfirmation() -> void, 204
├── hooks/
│   └── auth.queries.ts               # add useConfirmEmailMutation(),
│                                        # useResendConfirmationMutation()
└── components/
    ├── confirm-email-page.tsx        # new — 'use client' (see below)
    ├── confirm-email-form.tsx        # new — 'use client'
    └── *.spec.ts
```

`src/app/confirm-email/page.tsx` (new route file):

```tsx
import { ConfirmEmailPage } from '@/features/auth/components/confirm-email-page';

export default function ConfirmEmail() {
	return <ConfirmEmailPage />;
}
```

### `schemas/confirm-email-form.schema.ts`

```ts
const confirmEmailFormSchema = z.object({
	token: z.string().trim().min(1, 'Informe o código recebido por e-mail.'),
});
```

### `api/confirm-email.ts` / `api/resend-confirmation.ts`

Both endpoints return `204` (no body) — `apiFetch` already resolves
that to `null`, so these just await it:

```ts
async function confirmEmail(token: string): Promise<void> {
	await apiFetch('/api/auth/confirm-email', { method: 'POST', body: { token } });
}
```

```ts
async function resendConfirmation(): Promise<void> {
	await apiFetch('/api/auth/resend-confirmation', { method: 'POST' });
}
```

### `hooks/auth.queries.ts`

Add `useConfirmEmailMutation()` and `useResendConfirmationMutation()`,
same one-line `useMutation({ mutationFn })` shape as the existing two.

### Components — why both are client components

Unlike `register-page.tsx`/`login-page.tsx` (static server shell + a
client form), **this page's shell itself needs client-only data**: the
access token for the auth-gate check, and the stored e-mail for the body
copy. Both only exist in `localStorage`. So `confirm-email-page.tsx` is
`'use client'` too, not a server component — there's no static part left
to keep on the server.

- **`confirm-email-page.tsx`**: on mount (`useEffect`), read
  `getAccessToken()`. Missing → `router.replace(appRoutes.auth.login)`,
  render nothing while that's pending (no flash of the card). Present →
  read `getUserEmail()`, render the card shell (icon, heading, body with
  the e-mail interpolated, the status card) and `<ConfirmEmailForm
  email={email} />`. Track gate state as `'checking' | 'ready'` (start
  `'checking'`, flip once the effect resolves either way) rather than a
  bare boolean, so the redirect path never briefly renders the form.
- **`confirm-email-form.tsx`**: the code field (`FormField`, reused
  as-is — no new field component needed, this is a plain text input like
  E-mail/Nome, not a password) + "Confirmar e-mail" submit, plus
  "Reenviar código" / "Trocar e-mail" (→ `appRoutes.auth.changeEmail`,
  stub) below.
  - `useSearchParams()` (`next/navigation`) reads `token`; a mount
    effect pre-fills the field and calls `form.handleSubmit(onConfirm)()`
    immediately if present.
  - `confirmed` local boolean: on a successful confirm (or a `409` from
    resend — see below), set it `true` — this flips the status card's
    "E-mail confirmado"/"Acesso às aulas" rows to their done state for a
    beat (matches the spec's "brief confirmed state") — then
    `router.push(appRoutes.catalog.index)` after a short delay
    (`setTimeout`, ~900ms) so that state is actually visible before
    navigating away.
  - Confirm error handling: `400` → `form.setError('token', {message:
    'Código inválido ou expirado. Peça um novo código.'})`; `401` →
    `router.replace(appRoutes.auth.login)`; network/`500` → the same
    generic form-level banner pattern as register/login.
  - Resend is a **separate** mutation with its own pending/message state
    (a small `useState<{ tone: 'success' | 'error'; text: string } |
    null>`) — it must not fight over the confirm mutation's field error
    or disable the confirm button while resending:
    - `204` → `{ tone: 'success', text: 'Novo código enviado.' }`.
    - `409` → treat exactly like a confirm success: set `confirmed` and
      redirect after the same delay.
    - `429` → `{ tone: 'error', text: RATE_LIMIT_MESSAGE-ish copy }`
      (reuse `lib/auth-messages.ts`'s constant if the wording fits, else
      a resend-specific one next to it in the same file).
    - `401`/`404` → `router.replace(appRoutes.auth.login)`.
    - network/`500` → generic error tone.

No new shared "status card" component — it's only used here, inline in
`confirm-email-page.tsx`.

## Tests

Same constraint as register/login: `confirm-email-form.tsx` uses
`useRouter()` *and* `useSearchParams()`, both of which throw/misbehave
outside a real Next App Router tree, so it can't be exercised through
bare `renderToStaticMarkup` (confirmed empirically for `useRouter()`
while building register; `useSearchParams()` carries the same
constraint). Scope stays at the schema layer, same as login:

- `schemas/confirm-email-form.schema.spec.ts`: valid non-empty token
  passes; empty/whitespace-only token fails.

`access-token.ts`'s new `getUserEmail`/`setUserEmail` aren't unit-tested
either — they're thin `localStorage` wrappers, and `canUseWebStorage()`
is always `false` under `tsx --test`'s plain-Node environment (no
`window`), so a test here could only assert the no-op branch, not the
actual storage behavior this change adds. Covered by the manual browser
verification below instead, consistent with this repo not carrying a
DOM-testing dependency.

## Steps

1. Add `changeEmail` to the `auth` route group.
2. Extend `access-token.ts` with `getUserEmail`/`setUserEmail`; update
   `clearAccessToken`; add the one-line `setUserEmail(...)` call to
   `register-form.tsx` and `login-form.tsx`.
3. Add `schemas/confirm-email-form.schema.ts`, `api/confirm-email.ts`,
   `api/resend-confirmation.ts`; extend `hooks/auth.queries.ts`.
4. Build `confirm-email-form.tsx` then `confirm-email-page.tsx`.
5. Add `src/app/confirm-email/page.tsx`.
6. Add the schema spec listed above.
7. Run `npm run test`, `npm run typecheck`, `npm run lint`; fix until
   green.
8. Manually verify in the dev server against a local CourseCore backend:
   - No stored token → visiting `/confirm-email` redirects to `/login`
     before showing the card.
   - Log in with a real account (register or login flow) → visiting
     `/confirm-email` shows the card with that account's e-mail.
   - "Reenviar código" → real `204`, success message shown.
   - Pasting a made-up string → real `400`, inline "Código inválido ou
     expirado." error.
   - **Known limitation, not fixable from this repo**: verifying an
     actually *valid* code end-to-end isn't possible in this dev
     environment today — tokens are stored hashed
     (`IEmailVerificationTokenHasher`), so there's no way to recover a
     usable plaintext code without Resend actually delivering the email
     (not configured locally, same gap already documented for Turnstile).
     The confirm and resend code paths share the same request/response
     handling shape in this plan, and resend's real `204` exercises most
     of it — call this covered by code review, not a live test, and say
     so plainly rather than claim more than was actually verified.
9. Update `src/features/README.md` and root `README.md`'s "Módulos
   ativos".
10. Commit in small, conventional-commit chunks separated by context
    (route constant; access-token e-mail storage; schema/api/hooks;
    components; app wiring; tests; docs).
