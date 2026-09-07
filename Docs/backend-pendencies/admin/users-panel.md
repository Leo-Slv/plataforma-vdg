# Backend Pendencies — Admin Panel: Users

No spec was written for these screens yet — same status as
[`courses-panel.md`](courses-panel.md). Covers mockup artboards `1q`
("Usuários — lista") and `1r` ("Usuário — editar acesso"), added under the
new "Painel admin — CRUDs de entidades" mockup group.

## 1. No role data anywhere in the users list or user record — BLOCKING for the "Papel" column/field

- **Mockup expects**: a "Papel" column in the users list (`1q`, values
  "Aluna"/"Admin") and a "Papel" dropdown on the user edit screen (`1r`).
- **Backend today**: `User`
  (`Modules/Users/Domain/Entities/User.cs`) has no role field at all —
  `Name`, `Email`, `PasswordHash`, `Active`, `EmailVerifiedAt`,
  `TokenVersion` only. `UserOutput`/`UserResponse`
  (`Modules/Users/Application/DTOs/UserOutput.cs`,
  `Modules/Users/Presentation/Responses/UserResponse.cs`) mirror that —
  no role in the payload `GET /api/users` returns. A `Role` entity *does*
  exist (`Modules/Access/Domain/Entities/Role.cs`, backed by
  `UserRolePersistenceModel`/`UserRoleConfiguration`), so role assignment
  is modeled at the persistence layer, but there is no
  `RolesController`/`UserRolesController` anywhere — no endpoint to read
  or change which role(s) a given user has.
- **What's needed**: at minimum a read endpoint (e.g.
  `GET /api/users/{id}/roles` or include role in `UserResponse`) and a way
  to assign/change a user's role from the admin UI.
- **Severity**: Blocking for this specific column/field — it's the
  identity of the row shown at a glance in the mockup's table, not a
  secondary detail.

## 2. No way to read (or revoke) a user's area grants — BLOCKING for "Áreas liberadas"

- **Mockup expects**: a "Áreas liberadas" column in the list (tag chips per
  user) and, on the edit screen, a per-area on/off toggle grid the admin
  can flip directly.
- **Backend today**: `AreasController`
  (`Modules/Access/Presentation/Controllers/AreasController.cs`) only
  exposes `POST /api/access/user-area` (grant) and
  `POST /api/access/role-area` (grant to a role) — there is no `GET` to
  list which areas a specific user currently has, and no `DELETE`/revoke
  route for either grant type. The only read-shaped route under that
  controller is `GET /api/areas/courses/{courseId}` and
  `GET /api/areas/users/{userId}/courses/{courseId}` — both are course-
  access *checks* for one course at a time, not "list all areas granted to
  this user."
- **What's needed**: `GET /api/access/user-area?userId=...` (or similar) to
  read current grants, and a revoke endpoint so the mockup's toggle-off
  interaction has something to call.
- **Severity**: Blocking for this part of the screen — same shape of gap
  as pendency 1: the admin can currently write grants blind (no way to see
  what's already there) and can't undo them at all through the API.

## 3. No aggregate user counts ("312 cadastrados · 298 confirmados")

- **Mockup expects**: a header subtitle on the users list with total
  registered and total confirmed counts.
- **Backend today**: `ListUsersRequest`
  (`Modules/Users/Presentation/Requests/ListUsersRequest.cs`) only takes
  `Page`/`PageSize`; `GET /api/users` returns a `PagedResponse<UserResponse>`
  (page of results + presumably a total count for pagination, but nothing
  scoped by confirmation status). There is no endpoint that returns a
  confirmed-vs-total breakdown directly.
- **What's needed**: either compute both counts client-side from a full
  listing (impractical once the user base grows past one page) or add the
  breakdown to a stats-shaped response.
- **Severity**: Cosmetic — the table itself would work; only the summary
  line would be wrong or unbuildable as drawn.

## 4. No search/filter on the users list

- **Mockup implies** (consistent with every other admin list screen in
  this mockup, e.g. the catalog's area/search filters) that an admin-scale
  list of "312 cadastrados" needs filtering, even though `1q` itself
  doesn't draw a search box explicitly.
- **Backend today**: `ListUsersRequest` has no filter parameters at all —
  paging only.
- **Severity**: Feature gap — not strictly required to ship the screen as
  literally drawn, but a 312-row table with no filter is not a workable
  admin tool.

## 5. No invite-by-email flow — "Convidar usuário" has no matching endpoint

- **Mockup expects**: a "Convidar usuário" action, implying the admin
  triggers an invitation (presumably an email with a way for the invitee
  to set their own password) rather than setting credentials directly.
- **Backend today**: `CreateUserRequest`
  (`Modules/Users/Presentation/Requests/CreateUserRequest.cs`) requires
  `Name`, `Email`, and a plaintext `Password` set by the caller — there is
  no invite/magic-link flow, no auto-generated temporary password, and no
  outbound email tied to user creation in the `Users` module.
- **What's needed**: either accept "admin sets the password directly" as
  the shipped behavior (relabel the action, drop the "invite" framing), or
  build an actual invite flow (token + email + self-service password set,
  likely reusing patterns from the existing email-confirmation flow in
  `Auth`).
- **Severity**: Feature gap.

## 6. "Cursos pagos concedidos" (paid-course access grants) has no admin-facing read/grant/revoke endpoint

- **Mockup expects** (`1r`): a panel listing paid courses the user already
  has ("Escola de Líderes — Comprado") plus a "+ Conceder acesso a um
  curso pago" action.
- **Backend today**: nothing in `AreasController` or elsewhere grants
  course-level (as opposed to area-level) access directly — the closest
  concept is `AccessRequestsController`'s request/approve/reject flow
  (`Modules/Access/Presentation/Controllers/AccessRequestsController.cs`),
  which is student-initiated (`POST /api/access/requests`) and admin-
  approved, not an admin-initiated direct grant. There's also no read
  endpoint listing a specific user's already-granted paid courses (only
  the single-course check at
  `GET /api/areas/users/{userId}/courses/{courseId}`).
- **What's needed**: clarify whether "Conceder acesso" is meant to reuse
  the access-request approval flow (admin creates + immediately approves a
  request on the user's behalf) or needs its own direct-grant endpoint;
  either way, a read endpoint to list a user's current grants is still
  missing.
- **Severity**: Feature gap.

## 7. "Status da conta" is drawn as multi-state but the backend only has a boolean

- **Mockup expects**: a "Status da conta" dropdown showing "Ativa" with an
  implied set of other states (the surrounding "Bloquear usuário" button
  suggests at least Ativa/Bloqueada).
- **Backend today**: `User.Active` is a plain `bool`
  (`Modules/Users/Domain/Entities/User.cs`, `Activate()`/`Deactivate()`),
  and `UpdateUserRequest` exposes exactly that one boolean. "Bloquear
  usuário" maps cleanly to `Active = false`; anything beyond a two-state
  toggle (e.g. a distinct "suspended pending review" state) doesn't exist.
- **What's needed**: nothing, if a two-state Ativa/Bloqueada model is
  accepted — the dropdown should just be a toggle. Only relevant if a
  richer status model is intentional.
- **Severity**: Cosmetic.

## What's already real

- `POST /api/users` (create), `PUT /api/users/{id}` (update, including the
  `Active` toggle), `GET /api/users` (paged list) — all real, `ManageUsers`
  policy.
- `EmailVerifiedAt` is already present on `UserOutput`/`UserResponse`, so
  the list's "Confirmado"/"Pendente" column is buildable today without any
  backend change.
