# Admin — Courses panel — Implementation plan

Spec: [`courses-panel.md`](courses-panel.md)

## Backend contracts used

- `GET /api/courses` (`ManageCourses` policy) → `CourseResponse[]`:
  `id, title, slug, description, thumbnailUrl, published, displayOrder,
  publishedAt, pricingModel ('Free'|'Paid'|'EnrollmentControlled'),
  priceAmount, issuesCertificate, isFeatured, areaIds[], createdAt,
  updatedAt`.
- `GET /api/areas` (`ManageAreas` policy) — already consumed by
  `areas-list.md`; reused here for both the sidebar summary and the
  course table's Áreas column. **Note**: this screen needs `ManageAreas`
  in addition to `ManageCourses`/`ReadAudit` — see "Open decisions"
  below on how that's handled if a course-manager lacks it.
- `GET /api/audit-logs?page=&pageSize=` (`ReadAudit` policy) →
  `PagedResponse<AuditLogResponse>`: `items[]` of `{ id, userId,
  action, entityName, entityId, metadata: Record<string,string>,
  createdAt }`, plus `page, pageSize, totalItems, totalPages`.

## Permission gating nuance

Unlike the areas screens (single permission), this page's three sections
need different permissions (`courses.manage`, `areas.manage`,
`audit.read`). **Decision**: gate the route itself on `courses.manage`
only (the page's primary purpose) via the existing
`useRequirePermission`. The areas-summary fetch and the audit-log fetch
each check their own permission client-side (decoded once via
`decodeAccessTokenClaims`) and render their own "sem permissão" message
instead of fetching and getting a 403 — since a `courses.manage`-only
admin realistically exists (course editors who aren't full admins) and
shouldn't be locked out of the whole screen over the areas/audit
sections.

## New modules

- **`src/features/admin/schemas/course.schema.ts`** — `courseSchema`
  (full `CourseResponse` shape, `pricingModel` as
  `z.enum(['Free','Paid','EnrollmentControlled'])`).
- **`src/features/admin/schemas/audit-log.schema.ts`** —
  `auditLogSchema` + `pagedAuditLogSchema` (`items`, `page`, `pageSize`,
  `totalItems`, `totalPages`).
- **`src/features/admin/model/{course,audit-log}.ts`** — inferred types.
- **`src/features/admin/api/get-courses.ts`** — `GET /api/courses`.
- **`src/features/admin/api/get-audit-logs.ts`** —
  `GET /api/audit-logs?page=1&pageSize=3` (page/pageSize as params, but
  this screen always calls it with page 1 / size 3 per the spec's fixed
  3-row panel).
- **`src/features/admin/hooks/admin.queries.ts`** — add
  `useCoursesQuery`, `useAuditLogsQuery(page, pageSize, options)`.
- **`src/features/admin/lib/format-currency-brl.ts`** —
  `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL',
  maximumFractionDigits: 0 })` wrapper — whole-number BRL, matching the
  mockup's "R$ 149" (no cents shown for any sample value).
- **`src/features/admin/lib/format-relative-time.ts`** — pure
  `formatRelativeTime(iso: string, now: Date): string` — `< 1h` → "há
  Xmin", `< 24h` → "há Xh", `< 48h` → "ontem", else a short absolute
  date. Takes `now` as a parameter (not `Date.now()` internally) so it's
  testable without faking the clock.
- **`src/features/admin/lib/resolve-audit-label.ts`** — pure
  `resolveAuditLabel(entry, courses, areas): string` implementing the
  spec's Course/Area-lookup-else-fallback rule. Kept separate from the
  component so the resolution logic (the part with actual behavior to
  get wrong) is unit-testable without rendering anything.
- **`src/features/admin/lib/sort-courses.ts`** — `sortCoursesByDisplayOrder`,
  mirrors `sort-areas.ts`.
- **Components** (`src/features/admin/components/`):
  - `admin-sidebar.tsx` — **extended**, not replaced: `active` widens to
    `'areas' | 'courses'`, and a new optional `areasSummary?: {
    name: string; courseCount: number }[]` prop renders the "Áreas
    ativas" block when given (only the courses screen passes it — `1l`/
    `1m` don't draw this block, so they simply omit the prop).
  - `courses-table.tsx` — presentational, mirrors `areas-table.tsx`'s
    shape (sort, columns, empty state) but rows are plain `<div>`s, not
    `<Link>`s (inert this pass, per the spec).
  - `audit-log-panel.tsx` — presentational: given the 3 log entries (already
    resolved to label + relative time by the page), or a permission-denied
    flag, or an error flag.
  - `courses-panel-page.tsx` — page-level composition: gates on
    `courses.manage`, fires all three queries (areas query reused from
    the existing `useAreasQuery`), computes the audit labels via
    `resolveAuditLabel`, and lays out sidebar + header + table + panel
    with three independent loading/error states per the spec.
- **Route**: `src/app/admin/courses/page.tsx`.
- **`app-routes.ts`**: `admin.courses: '/admin/courses'`.
- **`query-keys.ts`**: `admin.courses`, `admin.auditLogs(page, pageSize)`.

## Tests

- `format-currency-brl.spec.ts` — whole numbers render without cents;
  matches the mockup's sample values (`149` → `"R$ 149"`).
- `format-relative-time.spec.ts` — boundary cases at 1h/24h/48h, using
  fixed `now`/`iso` pairs (no real clock involved).
- `resolve-audit-label.spec.ts` — Course hit, Area hit, unresolvable
  fallback (`{EntityName} #{short id}`), and the `EntityId: null` case
  (no id suffix at all).
- `sort-courses.spec.ts` — mirrors `sort-areas.spec.ts`.
- `courses-table.spec.ts` — empty state; sort order; Cobrança rendering
  for all three pricing models; Publicado/Rascunho.
- `audit-log-panel.spec.ts` — renders given labels + relative times;
  permission-denied message; error state.
- No page-level spec for `courses-panel-page.tsx`, same precedent as
  `areas-list-page.tsx`/`area-form-page.tsx`.

## Manual verification

Same approach as the two previous admin screens: real backend (seed
admin, temporary env override) + real frontend, driven headless —
confirm the course table, areas-ativas sidebar block, and audit panel
all render live data with no console errors, and that a
`courses.manage`-only token (no `audit.read`) shows the permission
message on the audit panel without breaking the rest of the page.

## Docs

- `README.md` / `src/features/README.md` — extend the admin bullet.
