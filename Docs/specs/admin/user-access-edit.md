# Admin — User access edit

## Why

`Docs/specs/admin/users-list.md` (`1q`) deliberately left every row inert,
deferring "edit a user's access" to `1r`, not specced at the time. Most of
what `1r` needs is real: role read (`RoleNames`), area-grant read/revoke
(`GET/DELETE /api/access/user-area/...`), account status
(`User.Active`), and paid-course grants (`POST /api/access/requests/grant`,
`GET /api/access/requests/users/{userId}/granted`) — all closed in
`Docs/backend-pendencies/admin/users-panel.md`. One piece isn't: there's no
way to *list* roles or discover a role's id (see "Non-goals" and pendency 9
in that file), so role assignment stays out of scope for this pass.

## Source

Design reference: artboard `1r` ("Usuário — editar acesso") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same admin shell as `users-list.md`.

## Goals

- Show a single user's role(s), granted areas, granted paid courses, and
  account status.
- Grant/revoke individual area access.
- Grant paid-course access (reusing the existing request→approve flow).
- Activate/block the account.
- Navigate here from `users-list.md`'s (previously inert) table rows.

## Non-goals

- **Assigning or removing a role.** The mockup draws "Papel" as a
  dropdown, but there is no way to enumerate roles or discover a role's
  id anywhere in the API — `POST/DELETE /api/users/{id}/roles/{roleId}`
  exist (per `users-panel.md` pendency 1) but take a `roleId` the frontend
  has no way to ever obtain; `RoleNames` on `UserResponse` returns names
  only. "Papel" renders read-only (see `users-panel.md` pendency 9, added
  alongside this spec).
- **Editing name or email.** Not drawn in the mockup — the header shows
  them as plain text, not inputs. `PUT /api/users/{id}` still requires
  both fields; this screen resubmits the loaded values unchanged whenever
  it needs to PUT for the status toggle (see "Open decisions").
- **Course grant revocation.** The mockup's "Cursos pagos concedidos"
  panel only draws a grant action ("+ Conceder acesso..."); there's no
  revoke-course-access endpoint anywhere in `AccessRequestsController`
  (only grant/approve/reject), matching the same conservative,
  no-easy-undo posture already chosen for module/course deletion
  elsewhere in this codebase.
- **View/manage granularity on area access.** `AreaAccessResponse` has
  both `CanView` and `CanManage`, but the mockup draws one on/off toggle
  per area. Granting sets `canView: true, canManage: false` (same default
  `GrantCourseAccessUseCase` itself uses when auto-granting areas for a
  course); `canManage` isn't exposed here.

## Page content

Route: `/admin/users/{userId}/edit`. Shared shell: `AdminSidebar`
(`active="users"`).

### Header

- Breadcrumb: "Usuários / {user name}".
- Avatar (shared brand mark placeholder — `UserResponse` has no per-user
  avatar field, same treatment as every other user-image placeholder in
  this codebase) + `Name` + `Email`.
- "Salvar alterações" — reconciles every pending local change (area
  toggles, account status) against the loaded state in one action; see
  "Open decisions".

### Left column

- **Papel**: read-only, `RoleNames.join(', ')` or "Sem papel" (see
  "Non-goals").
- **Áreas liberadas**: one toggle per *every* area from `GET /api/areas`
  (not just currently-granted ones — the mockup shows both on and off
  rows), pre-checked for areas already present in
  `GET /api/access/user-area/{userId}`. Toggling flips local pending
  state only; "Salvar alterações" diffs against the loaded grant list and
  fires a grant (`POST /api/access/user-area`) or revoke
  (`DELETE /api/access/user-area/{userId}/{areaId}`) per changed area.

### Right column

- **Cursos pagos concedidos**: list of the user's `Approved` requests
  from `GET /api/access/requests/users/{userId}/granted`, each resolved
  to a course title via the already-loaded admin course list (same
  "resolve id from a list already on the page" pattern as
  `courses-table.tsx`'s area names) — "`{course.title}` — Comprado".
  "+ Conceder acesso a um curso pago" opens a course picker (a plain
  `<select>`, not a search-driven combobox — the option set is bounded to
  "published, non-Free, not-already-granted" courses, realistically
  small) and grants immediately via `POST /api/access/requests/grant`
  (not batched into "Salvar alterações" — see "Open decisions"), then
  refetches the granted list.
- **Status da conta**: a toggle (Ativa/Bloqueada), not the dropdown the
  mockup draws — per the standing decision in `users-panel.md` pendency 7.
  This is the *only* control for `User.Active`; the mockup's separate
  "Bloquear usuário" header button is dropped as a redundant second
  editor of the same field (resolved with the user — see "Open
  decisions"). Toggling is local pending state, included in "Salvar
  alterações" alongside the area grants.

### States

- **Loading**: while the user (`GET /api/users/{userId}`), areas, area
  access, granted courses, and course list all load — each independently,
  same "don't block the whole page on the slowest section" posture as
  `courses-panel.md`.
- **User not found**: `GET /api/users/{userId}` 404s → "Usuário não
  encontrado." with a "Voltar para usuários" action, same pattern as
  every other admin detail screen's not-found state.
- **Save errors**: "Salvar alterações" fires its batch of grant/revoke/PUT
  calls and reports a generic retry-safe banner if any fail, without
  losing the pending local toggle state (a failed save shouldn't force
  re-toggling everything from scratch) — see "Open decisions" for exactly
  how partial failure is surfaced.
- **Course grant errors**: a `409` (already has access / course has no
  active linked areas) or `404` (course not found) shows a dedicated
  inline message under the picker instead of the generic banner.
- **Forbidden**: gated on `users.manage` for the page as a whole. Every
  backend route this screen calls — `UsersController` (`ManageUsers`),
  `AreasController`'s user-area routes and `AccessRequestsController`'s
  grant route (both `ManageUserAreaAccess`) — resolves to the exact same
  `"users.manage"` claim (see "Open decisions"), so there's no secondary
  permission check needed anywhere on this page.

## Open decisions

Resolved with the user on 2026-09-08:

- **No batch endpoint for area grants; the mockup draws one "Salvar
  alterações" button.** **Decision: local pending state, reconciled on
  save.** Every area toggle only updates local component state; "Salvar
  alterações" diffs that state against what was loaded and fires the
  necessary `POST`/`DELETE` calls (and the status `PUT`) together. This
  matches the mockup's single-button intent without needing a batch
  endpoint that doesn't exist.
- **"Bloquear usuário" (header) and "Status da conta" (body) both edit
  `Active`.** **Decision: keep only "Status da conta"** as a toggle,
  included in the batched save; the header button is dropped rather than
  wired as a redundant second, immediately-firing editor of the same
  field.

Derived without needing to ask (mechanical, consistent with prior
screens' precedent):

- **Paid-course grant fires immediately, not batched** — unlike area
  toggles (binary, cheap to represent as pending "on/off" state), a
  course grant is a one-shot action with real side effects server-side
  (per `GrantCourseAccessUseCase`, it can also grant area access for the
  course's linked areas) and the mockup itself draws it as its own
  "+ Conceder acesso" action, not a form field — same posture as
  `lesson-editor.md`'s video-registration action firing immediately
  rather than joining the lesson-field save.
- **Permission gating is a single check, not the two-claim split
  `lesson-editor.md` needed.** Checked `AuthDependencyInjection.cs` in the
  backend before assuming otherwise: the `ManageUserAreaAccess` *policy*
  (guarding `AreasController`'s user-area routes and
  `AccessRequestsController`'s grant route) is itself backed by the
  `ManageUsers` *claim* (`AddPermissionPolicy(options,
  AuthPolicyNames.ManageUserAreaAccess, AuthPermissionNames.ManageUsers)`)
  — there is no distinct `"access.manage-user-area"`-style claim anywhere.
  So unlike `lesson-editor.md` (where `courses.manage` and
  `videos.manage` really are two different claims), every route this
  screen touches resolves to the same `authPermissions.manageUsers`
  already gating the page — no second permission constant, no disabled-
  with-a-note sub-state needed.
- **User fetched via `GET /api/users/{userId}`** (the real per-user
  detail route added resolving `users-panel.md` pendency 1) rather than
  finding it in an already-loaded list — `users-list.md`'s list is
  paginated/searched, so the specific user being edited isn't guaranteed
  to be in whatever page/search happens to be cached client-side.
- **Course picker is a plain `<select>`**, not a search input — the
  eligible-course set (published, non-`Free`, not already granted) is
  realistically small for a church's course catalog; no existing combobox
  primitive in this codebase to justify introducing one for this.

## Acceptance criteria

- `/admin/users/{userId}/edit` renders the user's name/email, role(s)
  read-only, every area with its current grant state, granted paid
  courses, and account status.
- Toggling areas and the account status only changes local state until
  "Salvar alterações" is pressed, which then calls exactly the
  grant/revoke/PUT operations needed to match the new state.
- "+ Conceder acesso a um curso pago" grants immediately (not gated on
  "Salvar alterações") and the granted list refreshes to include it; a
  `409`/`404` shows an inline message instead of the generic banner.
- `users-list.md`'s table rows navigate here instead of being inert.
- A user id that doesn't resolve shows "Usuário não encontrado." instead
  of a broken form.
- Gated on `users.manage` for the whole page — no second permission
  constant needed, since every route this screen calls resolves to that
  same claim.
