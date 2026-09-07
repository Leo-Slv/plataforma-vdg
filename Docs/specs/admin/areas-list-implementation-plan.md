# Admin — Areas list — Implementation plan

Spec: [`areas-list.md`](areas-list.md)

## Backend contract used

`GET /api/areas` (`AreaManagementController`, `ManageAreas` policy),
confirmed against the current CourseCore source
(`Modules/Access/Presentation/Responses/AreaResponse.cs`,
`Modules/Access/Application/UseCases/ListAreasUseCase.cs`):

```jsonc
// GET /api/areas  ->  AreaResponse[]  (camelCase over the wire, ASP.NET default)
[
  {
    "id": "guid",
    "name": "Discipulado",
    "slug": "discipulado",
    "description": "...",
    "active": true,
    "displayOrder": 1,
    "accentColor": "Blue",
    "courseCount": 7,
    "courses": [],           // always empty on the list endpoint; only populated by GET /api/areas/{id}
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

Only `id`, `name`, `slug`, `active`, `displayOrder`, `courseCount` are
needed for this screen. `description`, `accentColor`, `courses`,
`createdAt`, `updatedAt` are parsed-through but unused until the edit
screen (`1m`) needs them — no need to synthesize a narrower response type
server-side.

## New infra: JWT permission-claim decoding

Nothing in `src/lib/auth` currently reads anything from the token besides
its raw string. Add one small, dependency-free util:

- **`src/lib/auth/jwt-claims.ts`**
  - `decodeAccessTokenClaims(): Record<string, unknown> | null` — splits
    the stored access token on `.`, base64url-decodes the payload segment
    (`atob` with `-`/`_` → `+`/`/` translation, no external package), and
    `JSON.parse`s it. Returns `null` if there's no token or decoding
    fails (malformed/expired-looking token — never throw from this util,
    callers treat `null` the same as "no claim").
  - `hasPermission(claims, permission: string): boolean` — the backend
    emits one `Claim(AuthClaimTypes.Permission, ...)` per permission, and
    `JwtSecurityToken` serializes repeated claim types as a JSON array
    (single occurrence stays a bare string) — the JWT payload key is the
    literal `"permission"` (`AuthClaimTypes.Permission = "permission"` in
    the backend, not the long `ClaimTypes` URI used for role/email/name).
    Handle both shapes: `claims.permission` as `string | string[] |
    undefined`.
  - This is presentation-layer gating only (redirect UX), not a security
    boundary — the actual enforcement is the backend's `ManageAreas`
    policy on every write/read call. No token signature verification is
    done or needed client-side for this purpose.
  - **Caught during manual verification**: the claim *value* is the
    dot-case permission name (`AuthPermissionNames.ManageAreas =
    "areas.manage"`), not the PascalCase policy name (`ManageAreas`) —
    confirmed by decoding a real token from the seeded admin login, which
    is exactly the kind of mismatch source-reading alone would have
    missed (both names live in the backend, a page apart, and read as
    interchangeable at a glance). Added
    `src/lib/auth/auth-permissions.ts` — a small constants object mirroring
    `AuthPermissionNames` — so call sites pass `authPermissions.manageAreas`
    instead of a bare string literal that could drift from the backend
    again.

- **`src/lib/auth/use-require-permission.ts`**
  - `useRequirePermission(permission: string, options?: { redirectTo?:
    string })` — mirrors `useRequireAuth`'s shape (same `ready` boolean,
    same "no token → /login" first check via `useRequireAuth` internally),
    then additionally checks `hasPermission` and redirects to
    `redirectTo` (default `appRoutes.catalog.index`) when the claim is
    missing. Returns `ready: boolean` the same way, so callers don't
    special-case two hooks.

## New route/feature

- **`src/app/admin/areas/page.tsx`** — thin, renders
  `<AreasListPage />`.
- **`src/features/admin/`** (new feature folder — first screen in it):
  - `api/get-areas.ts` — `getAreas(): Promise<Area[]>` over
    `GET /api/areas`.
  - `schemas/area.schema.ts` — `areaSchema` (zod) covering the full
    `AreaResponse` shape (parse the whole payload even though this screen
    only reads a subset — the edit screen will need the rest, and a
    schema mismatch should fail loudly regardless of which fields the
    current screen touches).
  - `model/area.ts` — `type Area = z.infer<typeof areaSchema>`.
  - `hooks/admin.queries.ts` — `useAreasQuery(options: { enabled: boolean
    })`, same shape as `useCourseCatalogQuery`.
  - `components/admin-sidebar.tsx` — the shared shell: brand block + nav
    list. Props: `active: 'areas'` for now (widen the union as later
    screens land, same pattern as `AppNav`'s `active` prop). Non-"areas"
    items render as inert `<span>`s (same technique already used for
    "Certificados" in `AppNav`).
  - `components/areas-table.tsx` — presentational table given `Area[]`;
    renders the Área/Slug/Cursos/Ordem/Status columns, sorted by
    `displayOrder` (sort happens in this component or a small
    `lib/sort-areas.ts` helper — either is fine, keep it pure/testable).
  - `components/areas-list-page.tsx` — page component wiring
    `useRequirePermission('ManageAreas')` + `useAreasQuery` +
    `AdminSidebar` + `AreasTable`, following `CatalogPage`'s existing
    loading/error/401-redirect structure verbatim (including the
    `query.isError && isApiError(...) && status === 401` → redirect
    branch).
- **`src/lib/routes/app-routes.ts`** — add `admin: { areas: '/admin/areas'
  }`.
- **`src/lib/constants/query-keys.ts`** — add `admin: { areas: ['admin',
  'areas'] as const }`.

## "Nova área" / inert links

`AdminSidebar`'s non-"areas" nav entries and the header's "Nova área"
button render as plain `<span>`/`<button disabled>` elements — no `href`,
no `onClick` navigation — matching the resolved open decision. No stub
route is created for `/admin/areas/new` or `/admin/areas/[id]/edit` in
this pass.

## Tests

- `jwt-claims.spec.ts` — `decodeJwtPayload` (a pure function taking a raw
  token string, factored out of `decodeAccessTokenClaims` specifically so
  it's testable without a DOM/`localStorage`) against a hand-built
  base64url token; malformed/wrong-segment-count token → `null` (no
  throw); `hasPermission` against single-string vs. array `permission`
  claim shapes and a missing/`null` claims object.
- `use-require-permission` / `useRequireAuth` are hooks wired to
  `next/navigation`'s router — no existing spec in this codebase covers
  `useRequireAuth` directly (nor does one exist for `CatalogPage`, the
  page that exercises it), and there's no DOM/testing-library
  infrastructure set up to render hook-wired page components in this
  test runner (`node:test` + `renderToStaticMarkup`, no jsdom). Following
  that established precedent, the hook itself is left uncovered by a
  dedicated test — the same gap already accepted for `useRequireAuth`.
- `areas-table.spec.ts` — empty state; sorts by `displayOrder`; renders
  Ativa/Inativa correctly; renders the course count and slug columns.
- `areas-list-page.spec.ts` — **not added**, matching the precedent above
  (no page-level spec exists for `CatalogPage`/`MyCoursesPage` either,
  the two structurally closest components). Verified instead by manual
  browser testing (see below).

## Manual verification (2026-09-07)

Ran both the CourseCore backend (seed admin temporarily enabled via an
env var override, not committed) and this frontend locally, driven with
a headless Chromium (Playwright) script — not just `npm run test`:

- A freshly registered student account (no permissions) hitting
  `/admin/areas` was redirected to `/catalog` before any areas data
  loaded, no console errors.
- The seeded admin account hitting `/admin/areas` rendered the sidebar
  (Cursos/Áreas/Usuários/Vídeos/Auditoria, "Áreas" highlighted), the
  "Áreas" heading with a real "7 áreas ativas" count, and the table with
  real rows from `GET /api/areas` (name, slug, course count, display
  order, Ativa/Inativa) — no console errors.
- **This caught a real bug before it shipped**: the plan above assumed
  the permission claim's value was the literal policy name
  (`"ManageAreas"`). A real token from the seeded admin login showed the
  claim value is actually `"areas.manage"`
  (`AuthPermissionNames.ManageAreas` — a different constant, a short
  distance away in the same backend file, from the policy name
  `AuthPolicyNames.ManageAreas`). Fixed by reading the actual permission
  string off a decoded token instead of assuming it matches the policy
  name, and adding `src/lib/auth/auth-permissions.ts` so this doesn't
  drift again. Source-reading alone would not have caught this — the two
  constants read as interchangeable without seeing a real token.

## Docs

- `README.md` — mention the admin section joining the app (first screen:
  areas list), same one-paragraph-per-feature style already used for
  `landing`/`auth`/`catalog`.
- `src/features/README.md` — add an `admin/` bullet describing scope and
  linking this spec, following the existing bullets' format.
