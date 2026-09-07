# Admin — Areas list

## Why

Areas are the top-level grouping every course, area-access grant, and the
public landing page's "Áreas de ensino" section depend on (see
`Docs/backend-pendencies/landing/landing-page.md`). Today they can only be
inspected or changed directly against the API (curl/Postman) — there is no
UI for staff to see what areas exist, how many courses sit under each, or
whether an area is active. This is the first screen of the admin panel to
be built (mockup group "Painel admin — CRUDs de entidades"), establishing
the admin shell (sidebar nav) and the access-gating pattern every later
admin screen (courses, users, videos, audit log) will reuse.

## Source

Design reference: artboard `1l` ("Áreas — lista") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same visual system as the rest of the app (near-black/near-white, Jost
headings, DM Sans body), applied to a dense admin table layout instead of
the public-facing marketing sections.

## Goals

- Give staff with the `ManageAreas` permission a read view of every area:
  name, slug, course count, display order, and active/inactive status.
- Establish the admin section's shell: a persistent sidebar (brand +
  Cursos/Áreas/Usuários/Vídeos/Auditoria nav, this screen highlighting
  "Áreas") that later admin screens reuse, per
  `src/features/README.md`'s pattern of one shared nav component per
  section (mirrors `AppNav`, already `active`-aware for `catalog`/
  `my-courses`).
- Establish the access-gating pattern for `/admin/**`: only users whose
  access token carries the `ManageAreas` permission claim may reach the
  screen (see "Open decisions").

## Non-goals

- Creating or editing an area (mockup artboard `1m`) — separate spec, own
  implementation pass. The "Nova área" button and any per-row edit action
  are drawn but inert in this iteration (see "Open decisions").
- The other four sidebar destinations (Cursos, Usuários, Vídeos,
  Auditoria) — rendered as inert labels in the shared sidebar, not
  navigable until each gets its own spec.
- Deactivating/reactivating an area from this screen — read-only for this
  pass; `Area.Active` is only ever changed via the (not yet built) edit
  screen.

## Page content

### Sidebar (shared admin shell)

- Brand block: avatar image + "Admin" / "Viver da Graça" (small caps,
  two lines).
- Nav: "Cursos", "Áreas" (active — highlighted background on this
  screen), "Usuários", "Vídeos", "Auditoria". Only "Áreas" is a real,
  navigable destination right now.

### Header

- Title "Áreas".
- Subtitle: "`{n}` áreas ativas" — count of areas where `Active` is true,
  computed from the live list, not hardcoded like the mockup's "6 áreas
  ativas".
- "Nova área" pill button (inert this pass — see "Open decisions").

### Table

Columns, in order: Área (name), Slug, Cursos (course count), Ordem
(display order), Status (Ativa/Inativa with a colored dot — green/blue
accent for active, muted for inactive).

One row per area returned by `GET /api/areas`, sorted by `DisplayOrder`
ascending (matches the mockup's 1–6 ordering). Every field maps directly
to `AreaResponse`: `Name`, `Slug`, `CourseCount`, `DisplayOrder`, `Active`.

### States

- **Loading**: a lightweight loading state while the areas query is
  in flight (same tone as `CatalogPage`'s "Carregando catálogo…").
- **Error**: a retry affordance on failure, following the same pattern as
  `CatalogPage` (message + "Tentar novamente" button that calls
  `query.refetch()`), with the existing 401 → redirect-to-login handling.
- **Forbidden (403)**: a user who reaches this route without the
  `ManageAreas` permission is redirected before the query ever fires (see
  "Open decisions") — the API-level 403 is a defense-in-depth backstop,
  not the primary UX.
- **Empty**: if the API ever returns zero areas, show a plain "Nenhuma
  área cadastrada." message instead of an empty table.

## Responsive behavior

The mockup only documents a desktop layout (`1280px` card, two-column
grid: fixed sidebar + content) for this screen — no mobile artboard exists
for the admin panel yet. Ship desktop-first; defer a dedicated mobile
layout until a mobile admin artboard is designed (same posture the
landing-page spec took before its mobile artboard existed).

## Open decisions

Resolved with the user on 2026-09-07:

- **Access gating for `/admin/**`.** The CourseCore access token already
  carries a `permission` claim per granted permission — the value backing
  the `ManageAreas` *policy* is the claim string `"areas.manage"`
  (`AuthPermissionNames.ManageAreas` in the backend; confirmed against a
  real token from the seeded admin login, not just the source — the claim
  value is the dot-case permission name, not the PascalCase policy name).
  **Decision: decode the JWT client-side and require the `"areas.manage"`
  permission claim to enter this route**, redirecting anyone missing it to
  `/catalog`. This extends the existing client-only auth-gating pattern
  documented in `CLAUDE.md` ("Auth" — "read the stored access token /
  decoded JWT claims, redirect if missing or invalid") rather than
  inventing a new one, and is the piece every later admin screen will
  reuse. The backend's own `ManageAreas` policy remains the actual
  authorization boundary — this is UX, not security.
- **"Nova área" button and row-edit links, with no destination screen
  built yet.** **Decision: render inert this pass** (visible, styled, not
  clickable/navigating) — the same posture already taken for the landing
  page's not-yet-built nav/footer links (`Docs/specs/landing/landing-page.md`).
  Revisit once artboard `1m` gets its own spec and implementation.
  **Superseded 2026-09-07**: `1m` is now specced and implemented
  (`Docs/specs/admin/area-form.md`) — both are wired to real routes
  (`appRoutes.admin.areaNew`, `appRoutes.admin.areaEdit(id)`) instead of
  being inert.

## Acceptance criteria

- `/admin/areas` renders the sidebar shell and the areas table described
  above for a user whose access token carries the `ManageAreas` permission
  claim.
- A user without that claim is redirected to `/catalog` before any areas
  data loads; a user with no access token at all is redirected to
  `/login` (existing `useRequireAuth` behavior).
- The table's row count, values, and "`{n}` áreas ativas" subtitle come
  from `GET /api/areas` — no hardcoded area data.
- Loading, error (with retry), and empty states are handled as described
  above.
- ~~"Nova área" and any per-row edit affordance are visibly present but do
  not navigate anywhere.~~ Superseded: both now navigate to the create/edit
  screen (`Docs/specs/admin/area-form.md`).
- No write call (`POST`/`PUT /api/areas`) is made from this screen.
