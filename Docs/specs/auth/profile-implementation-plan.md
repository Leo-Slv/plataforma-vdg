# Profile — implementation plan

Implements [`Docs/specs/auth/profile.md`](profile.md).

## Data layer (`src/features/auth/`)

- `model/current-user.ts` — `CurrentUser` type mirroring
  `CurrentUserResponse`: `{ userId, name, email, active, emailVerifiedAt: string | null, roles: string[] }`.
- `schemas/current-user.schema.ts` — `currentUserSchema` (zod), same shape,
  `emailVerifiedAt: z.string().nullable()`.
- `api/get-current-user.ts` — `getCurrentUser()`: `apiFetch<unknown>('/api/auth/me')`
  parsed through `currentUserSchema`. Mirrors `login.ts`'s shape.
- `api/logout.ts` — `logoutUser()`: `apiFetch('/api/auth/logout', { method: 'POST' })`,
  no response body expected (204). Errors are swallowed by the caller (see
  hook below), not here — keep the API wrapper a plain, honest call.

## Query layer

- `src/lib/constants/query-keys.ts` — add `auth: { currentUser: ['auth', 'current-user'] as const }`.
- `src/features/auth/hooks/auth.queries.ts` — add:
  - `useCurrentUserQuery(options: { enabled: boolean })` — `useQuery` wrapping
    `getCurrentUser`, keyed `queryKeys.auth.currentUser`.
  - `useLogoutMutation()` — `useMutation` wrapping `logoutUser`.

## Shared logout helper

New `src/lib/auth/logout.ts`:

```ts
async function performLogout(logout: () => Promise<unknown>) {
	try {
		await logout();
	} catch {
		// Best-effort: the refresh-token cookie may already be gone or the
		// request may fail, but the user must still be able to log out
		// locally either way.
	}
	clearAccessToken();
	window.location.href = appRoutes.auth.login;
}
```

Both `AppNav` and the new profile page call this through
`useLogoutMutation()`, passing its `mutateAsync` in. Keeps the "POST
best-effort, then always clear + redirect" rule in one place instead of
duplicated inline in two components (per the spec's "Open decisions").

## `AppNav` changes

- `handleLogout` becomes `async`, calls `performLogout(() => logoutMutation.mutateAsync())`
  instead of directly calling `clearAccessToken()`.
- "Editar perfil" `<span>` becomes a `Link` to `appRoutes.profile.index`
  (same treatment as the existing "Painel admin" item — `onClick={() => setMenuOpen(false)}`).

## Page component

- `src/features/auth/components/profile-page.tsx` — modeled on
  `confirm-email-page.tsx`'s structure (`useRequireAuth()` gate,
  `<LoadingScreen />`, centered card, `rounded-lg border border-white/12
  bg-[#101012]` info panel):
  - Back link (`← Voltar`) to `appRoutes.catalog.index`.
  - Heading "Perfil".
  - Initials avatar (reuse `getInitials`/`getDisplayName` from
    `src/features/catalog/lib/user-display.ts`).
  - Info panel with two rows: "Nome" → `currentUserQuery.data?.name ?? '…'`,
    "E-mail" → `currentUserQuery.data?.email ?? '…'` plus a
    Confirmado/Pendente badge from `emailVerifiedAt`.
  - On `currentUserQuery.isError`: replace the two rows with an inline
    "Não foi possível carregar seus dados agora." + retry button; the panel
    and "Sair da conta" still render.
  - "Sair da conta" button below the panel, calls the shared logout flow,
    disabled while the mutation is pending (label "Saindo...").
- `src/app/profile/page.tsx` — thin route wrapper rendering `<ProfilePage />`,
  following the pattern of `src/app/confirm-email/page.tsx` (or whatever the
  actual confirm-email route file is named — check before writing).

## Tests

- `get-current-user.spec.ts` / `logout.spec.ts` — skip; these are thin
  `apiFetch` wrappers with no branching logic, consistent with how
  `login.ts` has no dedicated spec either.
- `profile-page.tsx` — no dedicated spec (hook-heavy container calling
  `useRequireAuth`/`useRouter`-adjacent code — same reasoning already
  applied to `lesson-player-page.tsx`, `confirm-email-page.tsx`).
- `app-nav.spec.ts` — extend: "Editar perfil" now renders as a link to
  `/profile`.

## Docs

- `README.md` — add a short "Profile (`/profile`)" entry alongside the
  other screens.
- `Docs/specs/auth/profile.md` already written; no further spec changes
  expected during implementation unless something here turns out wrong.
