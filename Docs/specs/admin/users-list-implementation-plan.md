# Admin — Users list: implementation plan

Spec: `Docs/specs/admin/users-list.md`.

## Route

- `src/app/admin/users/page.tsx` — thin, no params:
  ```tsx
  export default function AdminUsers() {
    return <UsersListPage />;
  }
  ```
  (No `courseId`-style dynamic segment here, so no `PageProps` generic or
  `async`/`params` needed — matches `src/app/admin/areas/page.tsx`.)
- `src/lib/routes/app-routes.ts`: add `users: '/admin/users'` under `admin`.
- `src/features/admin/components/admin-sidebar.tsx`: widen
  `AdminSidebarProps['active']` to `'areas' | 'courses' | 'users'`.

## Data layer

- `src/features/admin/schemas/user.schema.ts`:
  ```ts
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    active: z.boolean(),
    emailVerifiedAt: z.string().nullable(),
    roleNames: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

  const pagedUsersSchema = z.object({
    page: z.object({
      items: z.array(userSchema),
      page: z.number(),
      pageSize: z.number(),
      totalItems: z.number(),
      totalPages: z.number(),
    }),
    totalRegistered: z.number(),
    totalConfirmed: z.number(),
  });
  ```
  (`page` nested inside `page` mirrors the backend's own
  `UserListResponse { Page: PagedResponse<UserResponse>, ... }` shape —
  don't flatten it away, callers destructure `data.page.items` etc.)
- `src/features/admin/schemas/area-access.schema.ts`:
  ```ts
  const areaAccessSchema = z.object({
    areaId: z.string(),
    canView: z.boolean(),
    canManage: z.boolean(),
  });
  ```
- `src/features/admin/model/user.ts`: `User`, `PagedUsers` (`z.infer`).
- `src/features/admin/model/area-access.ts`: `AreaAccess`.
- `src/features/admin/api/get-users.ts`:
  ```ts
  async function getUsers(
    page: number,
    pageSize: number,
    search: string,
  ): Promise<PagedUsers> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search.trim().length > 0) params.set('search', search.trim());
    const data = await apiFetch(`/api/users?${params.toString()}`);
    return pagedUsersSchema.parse(data);
  }
  ```
- `src/features/admin/api/create-user.ts`: `POST /api/users` with
  `{ name, email, password }`, parses `userSchema`.
- `src/features/admin/api/get-user-area-access.ts`: `GET
  /api/access/user-area/{userId}`, parses `z.array(areaAccessSchema)`.

## Query keys & hooks

- `src/lib/constants/query-keys.ts`, under `admin`:
  ```ts
  users: (page: number, pageSize: number, search: string) =>
    ['admin', 'users', page, pageSize, search] as const,
  userAreaAccess: (userId: string) =>
    ['admin', 'users', userId, 'area-access'] as const,
  ```
- `src/features/admin/hooks/admin.queries.ts`:
  - `useUsersQuery(page, pageSize, search, { enabled })`.
  - `useCreateUserMutation()`.
  - `useUserAreaAccessQuery(userId, { enabled })` — `retry: false` isn't
    needed here (no meaningful 404 case, unlike the lesson-video query);
    a real error just shows the row's chip cell in its error state.

## Form schema

- `src/features/admin/schemas/create-user-form.schema.ts`:
  ```ts
  const createUserFormSchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome.').max(200, 'Nome muito longo.'),
    email: z.string().trim().min(1, 'Informe o e-mail.').max(320, 'E-mail muito longo.').email('E-mail inválido.'),
    password: z.string().min(12, 'Mínimo de 12 caracteres.'),
  });
  ```
  (Mirrors `src/features/auth/schemas/register-form.schema.ts` minus
  `captchaToken`.)

## Components

- `src/features/admin/lib/format-date-br.ts` (+ `.spec.ts`): `(iso:
  string) => new Date(iso).toLocaleDateString('pt-BR')` — small pure
  helper, matches the existing one-function-per-file convention
  (`format-currency-brl.ts`, `format-relative-time.ts`).
- `src/features/admin/components/user-area-chips.tsx` — presentational +
  its own data fetch (the per-row query from the spec's "Open
  decisions"): props `{ userId: string; roleNames: string[]; areas: Area[] }`.
  - If `roleNames.includes('Admin')`: render a single "Todas" chip, no
    query fired.
  - Else: `useUserAreaAccessQuery(userId, { enabled: true })`, resolve
    each `areaId` to a name via the `areas` prop (same `areas.find(...)`
    pattern `courses-table.tsx` already uses), render one chip per
    resolved name, "Nenhuma" when the resolved list is empty, a small
    "…" while pending, and a muted "—" on error (no per-row retry button —
    keep the row simple, a full-table refresh covers it).
- `src/features/admin/components/users-table.tsx` — presentational,
  takes `{ users: User[]; areas: Area[] }`, renders the column header row
  and one row per user (name+email, role join, `<UserAreaChips>`,
  status, formatted date). Grid layout matching `courses-table.tsx`'s
  `COLUMNS` constant pattern. Not a `Link` — plain `div` rows (inert,
  per spec).
- `src/features/admin/components/create-user-modal.tsx` — `AdminModal` +
  `react-hook-form` + `createUserFormSchema`, three fields (Nome, E-mail,
  Senha — `type="password"`), same submit/cancel button styling as
  `lesson-form-modal.tsx`/`video-form-modal.tsx`.
- `src/features/admin/components/pagination-controls.tsx` — new, small,
  generic: props `{ page: number; totalPages: number; onPrevious: () =>
  void; onNext: () => void }`, "Anterior"/"Próxima" buttons disabled at
  the bounds, "Página `{page}` de `{totalPages}`" label between them. No
  existing pager in the codebase to reuse or extend.
- `src/features/admin/components/users-list-page.tsx` — the page
  component (`'use client'`), structured like `courses-panel-page.tsx`:
  - `useRequirePermission(authPermissions.manageUsers)`.
  - Local `page`/`search` state (`useState`); a debounced setter for
    search (simple `setTimeout`/`useEffect` debounce, ~300ms — no
    existing debounce utility in this codebase to reuse, and pulling in a
    dependency for one field isn't warranted).
  - `useUsersQuery(page, pageSize, debouncedSearch, { enabled: ready })`.
  - `useAreasQuery({ enabled: ready })` (already exists) — needed for
    `<UserAreaChips>`'s name resolution, same as `courses-table.tsx`.
  - Header, search field, "Convidar usuário" button opening
    `create-user-modal.tsx` (`useCreateUserMutation`, invalidates
    `queryKeys.admin.users(...)` on success, 409 → dedicated message).
  - Loading/error/empty states per the spec.
  - `<UsersTable>` + `<PaginationControls>` wired to `page`/`setPage` and
    `usersQuery.data.page.totalPages`.

## Tests

- `format-date-br.spec.ts`.
- `user-area-chips.spec.ts`: Admin-role short-circuit renders "Todas" with
  no query; a non-admin renders resolved chip names from a given areas
  list.
- `users-table.spec.ts`: role join, "Sem papel" fallback, status
  color/label, date formatting — same `renderToStaticMarkup` style as
  `courses-table`-adjacent specs (check if one exists; if not, follow
  `admin-lesson-row.spec.ts`'s pattern).
- `pagination-controls.spec.ts`: bounds disable the right button.
- `create-user-form.schema.spec.ts` or a `create-user-modal.spec.ts` —
  check existing precedent first (no modal has its own spec today per
  `lesson-editor-implementation-plan.md`'s own note; if that's still true,
  skip a dedicated modal spec and rely on the schema/component tests
  above).

## Sequencing

1. Route constant, sidebar `active` union widening, schemas/model/api
   files.
2. Query keys + hooks.
3. `format-date-br.ts`, `pagination-controls.tsx`, `user-area-chips.tsx`
   (small, independently testable pieces).
4. `users-table.tsx`, `create-user-modal.tsx`.
5. `users-list-page.tsx` + route file.
6. Tests, then `npm run test`, `npm run typecheck`, `npm run lint`.
7. Update `README.md` feature list.
