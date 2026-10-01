# First-Time Visitor Page — Implementation Plan

Implements [`first-time-visitor.md`](first-time-visitor.md).
**Status:** Implemented (2026-10-01) — spec decisions resolved: `/primeira-vez`
(**[D1]**), no landing link (**[D2]**), no reception screen.

## Route constant

Add a `visitors` group to `src/lib/routes/app-routes.ts`:

```ts
visitors: {
	firstVisit: '/primeira-vez', // [D1] deliberate pt-BR path: shared via QR/print
},
```

New route file `src/app/primeira-vez/page.tsx` **[D1]**, thin as usual:

```tsx
import type { Metadata } from 'next';

import { FirstVisitPage } from '@/features/visitors/components/first-visit-page';

export const metadata: Metadata = { title: 'Primeira vez | Viver da Graça' };

export default function FirstVisit() {
	return <FirstVisitPage />;
}
```

Check `node_modules/next/dist/docs/` for the current `metadata` export
conventions before writing it (per the repo's Next.js agent rules).

## No new dependencies

`@marsidev/react-turnstile`, `react-hook-form`, `@hookform/resolvers`,
`zod`, and TanStack Query are already installed. `env.turnstileSiteKey`
already exists in `src/lib/env.ts`.

## Feature slice: `src/features/visitors/`

Named after the backend module (`Modules/Visitors`), like `auth/` and
`testimonials/` are.

```text
src/features/visitors/
├── model/
│   └── visitor-registration.ts          # RegisterVisitorResponse type
├── schemas/
│   ├── visitor-registration.schema.ts   # zod for the 201 response
│   └── first-visit-form.schema.ts       # zod + inferred type for the form
├── api/
│   └── register-visitor.ts              # registerVisitor() — apiFetch + parse
├── hooks/
│   └── visitors.queries.ts              # useRegisterVisitorMutation()
├── lib/
│   ├── phone-mask.ts                    # maskPhone(), phoneDigits()
│   ├── first-name.ts                    # firstName()
│   └── first-visit-messages.ts          # all user-facing copy constants
└── components/
    ├── first-visit-page.tsx             # server: header + decoration shell
    ├── first-visit-layout.tsx           # client: hero/form grid, submitted flag
    ├── first-visit-header.tsx           # brand + service times
    ├── first-visit-hero.tsx             # badge + heading + lede
    ├── first-visit-form.tsx             # 'use client': fields, Turnstile, submit
    ├── first-visit-success.tsx          # thank-you state
    ├── visitor-input-field.tsx          # boxed label+input (mockup style)
    └── *.spec.ts                        # colocated, see "Tests"
```

### `model` + `schemas/visitor-registration.schema.ts`

```ts
type RegisterVisitorResponse = { id: string; submittedAt: string };

const registerVisitorResponseSchema = z.object({
	id: z.string(),
	submittedAt: z.string(),
});
```

### `lib/phone-mask.ts`

Port of the mockup's `mask()` (pure, unit-tested):

```ts
function phoneDigits(value: string): string {
	return value.replace(/\D/g, '').slice(0, 11);
}

function maskPhone(value: string): string {
	const n = phoneDigits(value);
	if (n.length <= 2) return n.length ? `(${n}` : '';
	if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
	if (n.length <= 10)
		return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
	return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}
```

`lib/first-name.ts`: `value.trim().split(/\s+/)[0] ?? ''`.

### `schemas/first-visit-form.schema.ts`

Mirrors the backend rules (CourseCore `Visitor` entity +
`VisitorValidationLimits`):

```ts
const firstVisitFormSchema = z.object({
	name: z.string().trim().min(2).max(200),
	phone: z.string().refine((v) => {
		const length = phoneDigits(v).length;
		return length === 10 || length === 11;
	}),
	email: z.string().trim().max(320).email(),
	address: z.string().trim().max(300, ADDRESS_TOO_LONG_MESSAGE),
	captchaToken: z.string(),
});
type FirstVisitFormValues = z.infer<typeof firstVisitFormSchema>;
```

Per-field messages are intentionally left off name/phone/email. The UI
shows one shared message (`FORM_INVALID_MESSAGE`) whenever any of those
three has an error, matching the mockup. `captchaToken` has no `min(1)`,
same reasoning as `register-form.schema.ts`: the gate depends on whether
Turnstile is configured, so it lives in the UI.

### `api/register-visitor.ts` / `hooks/visitors.queries.ts`

```ts
async function registerVisitor(payload: RegisterVisitorPayload) {
	const data = await apiFetch('/api/visitors', {
		method: 'POST',
		body: payload,
	});
	return registerVisitorResponseSchema.parse(data);
}

function useRegisterVisitorMutation() {
	return useMutation({ mutationFn: registerVisitor });
}
```

The payload sends `address` as `null` when blank. `apiFetch` will attach a
Bearer token if the visitor happens to be logged in. That's harmless
because the endpoint is `[AllowAnonymous]`, so nothing special is needed.

### `lib/first-visit-messages.ts`

All copy from the spec, as constants, so components and tests share it:
`FORM_INVALID_MESSAGE`, `ADDRESS_TOO_LONG_MESSAGE`, `CAPTCHA_ERROR_MESSAGE`,
`RATE_LIMIT_MESSAGE` (visitor-specific wording, not the auth one),
`GENERIC_ERROR_MESSAGE`, and `SERVICE_TIMES = 'Cultos aos domingos · 10h e 18h'`.

### Components

Same rule as the auth/landing screens: hand-rolled Tailwind markup, not
the shadcn `Input`/`Button` primitives (those are boxy, `rounded-none`, and
sized for the admin aesthetic). Colors use the existing theme tokens where
they match the mockup (`bg-background` = `#0a0a0b`, `bg-surface` ≈
`#111113`, `text-foreground`). Accent and destructive stay literal
`oklch(...)` values, as in `form-field.tsx`.

- **`visitor-input-field.tsx`** — boxed variant of the auth `FormField`:
  - Jost uppercase label, with an optional `hint` rendered right-aligned
    (used for "opcional").
  - Input: `rounded-[10px]`, 1px `foreground/12` border, padding
    `15px 16px`, 15px DM Sans (16px on mobile to avoid iOS zoom).
  - Background flips by breakpoint with Tailwind classes, not a prop
    (`bg-surface lg:bg-background`): `#111113` on mobile, `#0a0a0b` inside
    the desktop card.
  - Focus border uses the accent. An `invalid` boolean switches the
    border to `oklch(0.65 0.12 30)`, the mockup's error border, with
    `aria-invalid`.
  - Spreads `ComponentProps<'input'>`, like `FormField`.
- **`first-visit-header.tsx`** — brand mark (`next/image`, 36px desktop /
  32px mobile) + wordmark; `SERVICE_TIMES` with `hidden lg:block`.
- **`first-visit-hero.tsx`** — badge, heading (the `<br>` only on desktop),
  lede. Takes no props.
- **`first-visit-success.tsx`** — `{ name, phone, onReset }`; check
  circle, "Obrigado, {firstName(name)}.", sentence with the masked phone,
  outline pill "Cadastrar outra pessoa" calling `onReset`. Container gets
  `role="status"`, so screen readers announce it.
- **Layout approach: one form instance, responsive via Tailwind.** Never
  two form trees toggled by `hidden lg:block`, which would mount two
  `<form>`s and two Turnstile widgets at once. A `useMediaQuery` variant
  switch is also out: it causes a hydration flash. Breakpoint differences
  are handled with `lg:` classes:
  - card chrome and the "Seus dados" title/subtitle on desktop only;
  - Telefone and E-mail side by side on desktop only (`lg:grid-cols-2`);
  - the privacy note under the button on mobile only.
- **`first-visit-form.tsx`** (`'use client'`) — owns all form state:
  - `useForm` + `zodResolver`, `mode: 'onSubmit'`. Phone uses
    `register('phone', { onChange })`, rewriting the value through
    `maskPhone` and `setValue`. The alternative is a `Controller`; pick
    whichever keeps the caret behavior acceptable when tested manually.
  - `useRegisterVisitorMutation()`, `useRef<TurnstileInstance>`, local
    `formError` and `submitted: { name, phone } | null` state.
  - Turnstile rendered only when `env.turnstileSiteKey` is set
    (`options={{ theme: 'dark', appearance: 'interaction-only' }}`, for the
    "invisible unless challenged" behavior; verify that option name
    against the installed package's types).
  - Error branching mirrors `register-form.tsx`: `isApiError`, then
    `status`, then a captcha substring match on `message`, with the same
    documented fragility.
  - On success it stores `{ name, phone }` in `submitted` and renders
    `<FirstVisitSuccess>`.
  - `onReset` calls `form.reset()`, clears `submitted`/`formError`, and
    calls `turnstileRef.current?.reset()`.
  - Exposes `onSubmittedChange(submitted: boolean)` so the page can hide
    the hero heading/lede on mobile in the success state (mockup `1b`).
    On desktop the hero stays (`lg:block` overrides the hide).
- **`first-visit-layout.tsx`** (`'use client'`, small) — holds the
  `submitted` flag from `onSubmittedChange`. It renders the hero (with
  `hidden lg:block` while submitted) and the form in a single tree:
  - two-column grid on desktop (`lg:grid-cols-[1fr_520px] lg:gap-20`);
  - a stacked column on mobile.
- **`first-visit-page.tsx`** (server) — `bg-background min-h-screen` shell
  with the header, `<FirstVisitLayout />`, and the decorative faded mark
  (desktop only: `absolute`, `opacity-10`, `pointer-events-none`,
  `aria-hidden`).

## Tests

Same tooling as the rest of the repo: `tsx --test`, `node:test` +
`node:assert`, components rendered with `renderToStaticMarkup`.

- `lib/phone-mask.spec.ts`: every row of the spec's mask table,
  non-digits stripped, capped at 11 digits, empty input → `''`.
- `lib/first-name.spec.ts`: single word, multiple words, extra
  whitespace.
- `schemas/first-visit-form.schema.spec.ts`:
  - A valid payload passes, with and without an address.
  - These fail: 1-character name, 9-digit and 12-digit phone, invalid
    e-mail, 301-character address.
  - Both masked and digits-only phones pass.
- `components/visitor-input-field.spec.ts`: label, the "opcional" hint
  when passed, and `aria-invalid` when `invalid`.
- `components/first-visit-success.spec.ts`: "Obrigado, Ana." from
  "Ana Lima", the masked phone in the sentence, and the reset button.
- `components/first-visit-page.spec.ts`:
  - Renders inside a throwaway `QueryClientProvider`.
  - Asserts the badge, the heading, the service-times copy, and exactly
    one `<form` in the markup (guards the single-form layout approach).
  - Asserts the submit button is enabled when the Turnstile key is unset.

## Steps

1. Add the `visitors.firstVisit` route constant **[D1]**.
2. Add `model`, `schemas`, `api`, and `hooks` for the visitor
   registration.
3. Add `lib/phone-mask.ts`, `lib/first-name.ts`, and
   `lib/first-visit-messages.ts`.
4. Build the components bottom-up: `visitor-input-field` →
   `first-visit-success` → `first-visit-form` → `first-visit-header` /
   `first-visit-hero` → `first-visit-layout` → `first-visit-page`.
5. Add `src/app/primeira-vez/page.tsx` **[D1]**.
6. Add the colocated specs listed above.
7. Run `npm run test`, `npm run typecheck`, and `npm run lint` until all
   are green.
8. Check the page manually in the dev server against `1a` (1280) and
   `1b` (390), with `NEXT_PUBLIC_TURNSTILE_SITE_KEY` unset and a local
   CourseCore backend running:
   - mask behavior while typing and deleting;
   - the invalid submit (no request sent);
   - a valid submit → success state → "Cadastrar outra pessoa";
   - an over-long address;
   - force a `429` by submitting more than 10 times in a minute.
9. Docs:
   - Add `visitors/` to `src/features/README.md`.
   - Add "Primeira vez" to the root `README.md`'s "Módulos ativos".
   - Add the pendency row to `Docs/backend-pendencies/README.md` (already
     done with this spec).
   - **[D2]** If a landing link is chosen, update `landing-page.md` as
     well.
10. Commit in small conventional commits:
    - route;
    - model/schemas/api/hooks;
    - lib helpers;
    - components;
    - app route;
    - tests;
    - docs.

    No `Co-Authored-By` trailer.

## Implementation notes (2026-10-01)

- **Breakpoint is `lg:` (1024px), not `md:`.** At 768px the desktop grid
  (`1fr 520px`, 80px gap, 44px gutters) leaves the hero column only ~80px
  wide, so tablets get the stacked mobile layout instead.
- **Phone validation counts every digit, not the mask-capped 11.**
  `phoneDigits()` caps at 11 for the mask. Reusing it in the schema let
  `+55 (11) 98765-4321` (13 digits) pass client-side, which the backend
  rejects. The schema now strips non-digits without capping.
- **Phone re-validation after masking.** RHF validates the raw keystroke
  before the `onChange` mask runs, so the masked value is set with
  `shouldValidate: formState.isSubmitted`. Without that, a fixed phone kept
  its red border after the first failed submit.
- Manual check done against a local CourseCore backend (Turnstile unset):
  - desktop `1a`: empty submit shows the single error and red borders,
    which clear as fields become valid;
  - the mask caps typing at 11 digits;
  - a valid submit gets `201` and shows the success state;
  - "Cadastrar outra pessoa" brings back an empty form;
  - mobile `1b`: the landline mask works and the success state hides the
    heading.
