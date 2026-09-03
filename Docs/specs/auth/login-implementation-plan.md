# Login Page — Implementation Plan

Implements [`login.md`](login.md).

## Route constant

Add to `src/lib/routes/app-routes.ts`, inside the existing `auth` group:

```ts
auth: {
	login: '/login',
	register: '/register',
	confirmEmail: '/confirm-email',
	forgotPassword: '/forgot-password', // new — stub target for "Esqueci"
},
```

No page for `/forgot-password` in this plan (non-goal per the spec).

## Feature slice: `src/features/auth/` (extends the register work)

No new top-level folders — this drops into the same `auth` feature next
to register's pieces, reusing what already fits (`AuthResponse` model,
`authResponseSchema`, `isApiError`, `setAccessToken`, `FormField`,
`PasswordField`) instead of re-deriving any of it.

```text
src/features/auth/
├── schemas/
│   └── login-form.schema.ts     # new — email + non-empty password
├── api/
│   └── login.ts                 # new — loginUser(), same shape as register.ts
├── hooks/
│   └── auth.queries.ts          # add useLoginMutation() alongside the
│                                  # existing useRegisterMutation()
├── lib/
│   └── auth-messages.ts         # new — RATE_LIMIT_MESSAGE, shared verbatim
│                                  # between register-form.tsx and login-form.tsx
└── components/
    ├── password-field.tsx       # extended (see below), used by both screens
    ├── login-page.tsx           # new
    ├── login-form.tsx           # new
    └── *.spec.ts
```

`src/app/login/page.tsx` (new route file):

```tsx
import { LoginPage } from '@/features/auth/components/login-page';

export default function Login() {
	return <LoginPage />;
}
```

### `schemas/login-form.schema.ts`

```ts
const loginFormSchema = z.object({
	email: z.string().trim().min(1, 'Informe seu e-mail.').email('E-mail inválido.'),
	password: z.string().min(1, 'Informe sua senha.'),
});
type LoginFormValues = z.infer<typeof loginFormSchema>;
```

No 12-character rule and no `.max()` — this authenticates an existing
password, it doesn't create one (spec, "Client-side validation").

### `api/login.ts`

Same shape as `api/register.ts`: `apiFetch<unknown>('/api/auth/login',
{ method: 'POST', body: { email, password } })` parsed through the
already-existing `authResponseSchema`.

### `hooks/auth.queries.ts`

Add:

```ts
function useLoginMutation() {
	return useMutation({ mutationFn: loginUser });
}
```

### `lib/auth-messages.ts`

```ts
const RATE_LIMIT_MESSAGE =
	'Muitas tentativas seguidas bloqueiam o acesso por alguns minutos, por segurança.';
```

`register-form.tsx` switches its local copy of this same string to this
import (small refactor, touched as part of this plan) so the two screens
can't drift apart on identical copy.

### Extending `password-field.tsx`

Two new optional props, both used only by the login screen — register's
existing usage is unaffected since both default to today's behavior:

```ts
type PasswordFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
	label: string;
	value: string;
	error?: string;
	labelExtra?: ReactNode; // renders at the end of the label row — login's "Esqueci" link
	showStrength?: boolean; // default true; false hides the 4-segment bar
	                         // *and* drops the "Mínimo de 12 caracteres." helper
	                         // (login has neither — spec's "Non-goals")
};
```

The label row becomes `justify-between` with `labelExtra` on the right
(register passes nothing, so its row is unaffected). When
`showStrength` is `false`, the helper/error line still renders the error
when present, just never the static helper text otherwise.

### Components

Same hand-rolled-Tailwind approach as register, same reason (bespoke
underline/pill visual language, not the `rounded-none` shadcn
primitives).

- **`login-page.tsx`** (server component): identical shell to
  `register-page.tsx` — `#0a0a0b` card, brand mark, "Bem-vindo de volta"
  heading, "Não tem conta ainda? Criar conta" (→
  `appRoutes.auth.register`), renders `<LoginForm />`.
- **`login-form.tsx`** (`'use client'`): `useForm` +
  `zodResolver(loginFormSchema)`, `useLoginMutation()`.
  - `FormField` for E-mail (reused as-is).
  - `PasswordField` for Senha with `labelExtra={<Link href={appRoutes
    .auth.forgotPassword}>Esqueci</Link>}` and `showStrength={false}`.
  - An inert row: a plain styled `<span>` checkbox square (no
    `<input type="checkbox">`, no state — matches the reference
    project's own unwired checkbox, see spec's "Known gaps") + "Continuar
    conectado neste aparelho" text.
  - Submit button "Entrar" (same pill styling as register's).
  - Below a `border-t` divider: the `RATE_LIMIT_MESSAGE`, always
    rendered statically (not conditional on an error — per spec).
  - On submit: call the mutation; on success, `setAccessToken(...)` then
    `router.push(appRoutes.catalog.index)`.
  - On error, branch on `ApiError.status`:
    - `401` → form-level banner: "E-mail ou senha incorretos." (never
      `form.setError` on a specific field — spec is explicit that the
      API doesn't say which one was wrong).
    - `429` → form-level banner using `RATE_LIMIT_MESSAGE`.
    - `400`/unmatched → form-level banner with `error.message`.
    - network/`500` → generic "Não foi possível entrar agora. Tente
      novamente." banner.
  - Same `useState<string | null>` + `role="alert"` banner pattern as
    `register-form.tsx`.

## Tests

Same constraints as register: no DOM-testing library, and `login-form
.tsx`/`login-page.tsx` can't render through bare `renderToStaticMarkup`
because `useRouter()` throws outside a real Next App Router tree
(confirmed empirically while building register — same reason
`register-page.spec.ts` was dropped from that plan). Scope stays at the
same layer that worked before:

- `schemas/login-form.schema.spec.ts`: valid payload passes; empty/
  invalid email fails; empty password fails; a non-empty password under
  12 characters **passes** (proves the register-only rule doesn't leak
  in here).
- `components/password-field.spec.ts` (existing file, extended): a case
  with `showStrength={false}` asserts the strength bar and the "Mínimo
  de 12 caracteres." text are both absent; a case with `labelExtra`
  asserts it renders in the output.

## Steps

1. Add `forgotPassword` to the `auth` route group.
2. Add `schemas/login-form.schema.ts`, `api/login.ts`, `lib/auth-messages
   .ts`; add `useLoginMutation()` to `hooks/auth.queries.ts`.
3. Extend `password-field.tsx` with `labelExtra`/`showStrength`; switch
   `register-form.tsx` to import `RATE_LIMIT_MESSAGE` from
   `lib/auth-messages.ts` instead of its local copy.
4. Build `login-form.tsx` then `login-page.tsx`.
5. Add `src/app/login/page.tsx`.
6. Add/extend the specs listed above.
7. Run `npm run test`, `npm run typecheck`, `npm run lint`; fix until
   green.
8. Manually check `/login` in the dev server (desktop + mobile) against
   mockup `1d`, against the local CourseCore backend: a valid login
   (redirects to `/catalog`, 404 expected — stub route, same as
   register's `/confirm-email`), and a wrong password (`401`, generic
   banner, no field singled out).
9. Update `src/features/README.md` and root `README.md`'s "Módulos
   ativos".
10. Commit in small, conventional-commit chunks separated by context
    (route constant; schemas/api/hooks/lib; password-field extension +
    register's small refactor; login components; app wiring; tests;
    docs).
