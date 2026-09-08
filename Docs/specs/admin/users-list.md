# Admin — Users list

## Why

`Docs/backend-pendencies/admin/users-panel.md` (originally written
2026-09-04, covering both `1q` and `1r`) flagged this screen as blocked
on role data, area-grant visibility, aggregate counts, and search — all
closed on 2026-09-07. This spec picks up `1q` specifically: a paginated,
searchable list of every registered user with role, area access, and
confirmation status. `1r` ("Usuário — editar acesso") stays unspecced —
see "Non-goals".

## Source

Design reference: artboard `1q` ("Usuários — lista") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same admin shell as `courses-panel.md`/`course-modules.md`.

## Goals

- List every registered user, paginated, with name, email, role(s),
  granted areas, confirmation status, and registration date.
- Show the aggregate header subtitle ("`{n}` cadastrados · `{m}`
  confirmados") from real counts, not the mockup's fixed sample.
- Search by name or email.
- Create a new user account (mockup's "Convidar usuário" action — see
  "Open decisions" for what it actually does).

## Non-goals

- **Editing an existing user** — role assignment/removal, area grant/
  revoke, blocking an account, granting paid-course access. All of that
  is `1r` ("Usuário — editar acesso"), not specced yet. Rows in this
  screen's table are inert (no click-through), the same posture
  `courses-panel.md` took for course rows before `course-form.md`
  existed.
- **A real invite-by-email flow.** Per the standing decision in
  `users-panel.md` pendency 5: "Convidar usuário" is shipped as direct
  account creation with an admin-set password (`POST /api/users`), not an
  email-based invite. The created account starts unconfirmed (`Pendente`)
  until the new user goes through the normal email-confirmation flow
  themselves — nothing here can mark `EmailVerifiedAt` directly
  (`UpdateUserRequest` doesn't expose it).
- **Assigning a role at creation time.** `CreateUserRequest` has no role
  field — a freshly created user has no role until `1r` assigns one
  (`POST /api/users/{id}/roles/{roleId}`). This screen's create form is
  name/email/password only.

## Page content

Route: `/admin/users`. Shared shell: `AdminSidebar` (`active="users"`).

### Header

- Title: "Usuários".
- Subtitle: "`{totalRegistered}` cadastrados · `{totalConfirmed}`
  confirmados" (`GET /api/users`'s `totalRegistered`/`totalConfirmed`,
  both whole-table counts, not scoped by the current search — see "Open
  decisions" in `users-panel.md` pendency 3).
- Search field (name or email, `?search=`) — debounced, resets to page 1
  on change. Not drawn in the mockup, but the same "an admin-scale list
  needs a filter" reasoning `users-panel.md` pendency 4 already used to
  justify building `Search` into the backend at all.
- "Convidar usuário" — opens the create-user modal (name, email,
  password; 12-character minimum, same rule as self-registration in
  `Docs/specs/auth/register.md`).

### Table

Columns, in order: Usuário, Papel, Áreas liberadas, Status, Cadastro.

One row per user from `GET /api/users?page=&pageSize=&search=`:

- **Usuário**: `Name`, and beneath it — smaller, muted — `Email`. The
  mockup's own "E-mail" header actually shows confirmation status values
  ("Confirmado"/"Pendente") in its column, not addresses; treated as a
  mockup labeling slip (resolved with the user — see "Open decisions"),
  so the real email moves here instead of getting its own column.
- **Papel**: `RoleNames.join(', ')`, or "Sem papel" when the array is
  empty (a user with no role assigned yet — realistic for a just-created
  account, since role assignment only happens on `1r`).
- **Áreas liberadas**: chips, one per granted area name. See "Open
  decisions" for how this is fetched (a per-row call, since there's no
  batch endpoint) and the `RoleNames` special case for admins.
- **Status**: "Confirmado" (accent color) when `EmailVerifiedAt` is set,
  else "Pendente" (muted) — the mislabeled column from the mockup,
  correctly titled here.
- **Cadastro**: `CreatedAt` formatted `DD/MM/AAAA` (`toLocaleDateString('pt-BR')`,
  matching the mockup's own date format).

Pagination: page/page-size from `GET /api/users`'s paged response
(`totalPages`), simple "Anterior"/"Próxima" controls — no existing
pagination UI in this codebase to reuse (`audit-log-panel.tsx` only ever
renders a fixed 3-row slice, no pager).

### Create-user modal

Fields: Nome, E-mail, Senha (min. 12 caracteres, same rule as
`Docs/specs/auth/register.md` — no confirmation field, matching that
screen's own form). On success: closes, invalidates the users list, no
role assigned (see "Non-goals").

### States

- **Loading**: table shows "Carregando usuários…" while the current
  page's request is in flight; each row's area-chips cell independently
  shows a small "…" placeholder until its own request resolves (see
  "Open decisions") — a slow area lookup for one row never blocks the
  rest of the table from rendering.
- **Empty**: "Nenhum usuário encontrado." when a search yields zero rows
  (as opposed to zero users ever existing, which isn't realistic once an
  admin account exists to view this screen at all).
- **Mutation errors**: create-user shows a generic retry-safe message
  inside the modal; a `409` (email already registered) shows "Já existe
  um usuário com este e-mail." instead.
- **Forbidden**: gated on `users.manage`, same posture as every other
  admin screen.

## Open decisions

Resolved with the user on 2026-09-08:

- **The mockup's "E-mail" column actually draws confirmation-status
  values.** **Decision: treat it as a mislabeled column** — rename to
  "Status" and show `Confirmado`/`Pendente` there (matching what's
  literally drawn), moving the real email address to a secondary line
  under the user's name in the "Usuário" column instead of inventing a
  sixth column.
- **"Áreas liberadas" has no batch read endpoint** (`GET
  /api/access/user-area/{userId}` is per-user only —
  `Docs/backend-pendencies/admin/users-panel.md` pendency 2 only ever
  closed the single-user case). **Decision: fetch per row anyway**,
  scoped to the current page's users (typically ≤20), each as its own
  React Query call fired in parallel. This differs from
  `courses-panel.md`'s explicit rejection of N+1 for audit-log
  enrichment — that case was an open-ended lookup across arbitrary
  historical entities for a "nice to have" label; this one is bounded to
  exactly the rows already on screen and is the literal reason the
  column exists. A new backend pendency documents the missing batch
  endpoint for whenever page sizes grow enough to matter (see
  `users-panel.md` pendency 8).
  - **Admin-role special case**: a user whose `RoleNames` includes
    `"Admin"` skips the area-access fetch entirely and shows "Todas" —
    admins bypass area gating by role, not by having every area
    individually granted in `AreaAccess`, so querying their grants would
    realistically come back empty and render misleadingly as "Nenhuma."

Derived without needing to ask (mechanical, consistent with prior
screens' precedent):

- **Rows are inert** (no click-through to `1r`) — same posture
  `courses-panel.md` took for course rows before `course-form.md`
  existed.
- **Search debounced client-side, resets to page 1** — same UX pattern
  as every other filterable list in this codebase (catalog).
- **Create-user password rule mirrors self-registration exactly** (12
  characters minimum, no complexity regex, no confirm field) — same
  backend `IPasswordPolicy`, no reason to diverge.

## Acceptance criteria

- `/admin/users` renders the header counts, search, table, and pagination
  from `GET /api/users`.
- Search narrows the list by name or email substring and resets to page 1.
- Table shows name+email, role(s) or "Sem papel", granted-area chips (or
  "Todas" for Admins), confirmation status, and registration date for
  every row.
- "Convidar usuário" creates a real account via `POST /api/users`
  (name/email/password, 12-char minimum); a duplicate email shows a
  dedicated inline message instead of the generic error.
- Rows do not navigate anywhere.
- Gated on `users.manage`; forbidden otherwise, same as every other admin
  screen.
