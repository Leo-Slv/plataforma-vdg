# Admin — Courses panel

## Why

This screen was originally evaluated on 2026-09-04 and deliberately
skipped (`Docs/backend-pendencies/admin/courses-panel.md`) because a
draft course created here would become permanently unreachable (no
admin list endpoint existed) and there was no audit trail to show. Both
gaps closed on 2026-09-07. This spec picks the screen back up: a course
list covering every status (published + draft), with real per-area
context and a recent-activity panel — the first screen in the admin
panel with two independent data sources composed on one page.

## Source

Design reference: artboard `1k` ("Painel admin — cursos e áreas") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same admin shell as `areas-list.md`/`area-form.md` (sidebar,
near-black/white, Jost/DM Sans).

## Goals

- List every course (published and draft) with its primary area,
  pricing, status, and display order — the thing the original skip
  decision said couldn't be shipped safely; now it can, since
  `GET /api/courses` returns everything.
- Show a live "Áreas ativas" summary in the sidebar (name + course
  count per active area), reusing the same `GET /api/areas` call the
  areas screens already depend on.
- Show a "Últimas ações auditadas" panel — the 3 most recent entries
  from `GET /api/audit-logs`, enriched with a human-readable label where
  the data to do so is already on this page (see "Open decisions").

## Non-goals

- Creating or editing a course (mockup artboard `1n`) — separate spec.
  "Novo curso" and clicking a row render inert this pass, same posture
  `areas-list.md` took before `area-form.md` existed.
- A full audit-log browsing UI (filters, pagination, an "Auditoria"
  page) — this panel is a fixed 3-row recent-activity glance, matching
  the mockup. The sidebar's "Auditoria" nav item stays inert.
- Resolving every possible audit-log entity type to a display name (user
  emails, lesson/video titles) — see "Open decisions".

## Page content

### Sidebar (shared admin shell)

Same as `areas-list.md`/`area-form.md`'s `AdminSidebar`, `active="courses"`,
plus a new bottom block below the nav:

- **"Áreas ativas"**: one row per *active* area (`GET /api/areas`,
  filtered to `active: true`, sorted by `displayOrder`) — name + course
  count. Real data, not the mockup's fixed 4-row sample.

### Header

- Title "Cursos".
- Subtitle: "`{n}` cursos · `{m}` publicados" — computed from the live
  course list (`courses.length` / `courses.filter(published).length`),
  not hardcoded like the mockup's "18 cursos · 15 publicados".
- "Novo curso" pill button (inert this pass — see "Non-goals").

### Table

Columns, in order: Curso (title + slug), Áreas, Cobrança, Status, Ordem.

One row per course from `GET /api/courses`, sorted by `DisplayOrder`
ascending:

- **Curso**: `Title` and, beneath it, `/${Slug}` in monospace.
- **Áreas**: course.`AreaIds` resolved to area names via the same
  `GET /api/areas` call used for the sidebar summary — joined with `, `
  when a course has more than one area (the mockup only ever shows one
  area per row, but nothing about `AreaIds` — plural — guarantees that
  in general).
- **Cobrança**: `PricingModel === 'Free'` → "Gratuito";
  `'Paid'` → `PriceAmount` formatted as BRL (`R$ 149`, no decimals when
  whole, matching the mockup); `'EnrollmentControlled'` → "Por
  inscrição" (not in the mockup, since that pricing model didn't exist
  yet when `1k` was designed — see
  `Docs/backend-pendencies/admin/course-crud.md` pendency 1). A `Paid`
  course with no `PriceAmount` set (seen in real seed data during manual
  verification — "Escola de Líderes" is `Paid` with `priceAmount: null`,
  a data-quality gap in that seed, not a frontend bug) renders `—`
  rather than crashing or showing a literal "null".
- **Status**: "Publicado" (accent color) or "Rascunho" (muted), from
  `Published`.
- **Ordem**: `DisplayOrder`.

Rows are inert this pass (no click-through to an edit screen — that's
`1n`, not yet specced).

### "Últimas ações auditadas" panel

Below the table: the 3 most recent entries from
`GET /api/audit-logs?page=1&pageSize=3`, each rendered as
`{label} · {relative time}` (e.g. "há 2h", "ontem" — see "Open
decisions" for the exact thresholds).

`{label}` is built as `{Action}{ · display-name}`, where the display-name
suffix is included only when resolvable (see "Open decisions"):

- `EntityName === 'Course'`: look up `EntityId` in the course list
  already fetched for this page; if found, append `· {course.Title}`.
- `EntityName === 'Area'`: look up `EntityId` in the areas list already
  fetched for the sidebar; if found, append `· {area.Name}`.
- Anything else (`User`, `UserAreaAccess`, `RoleAreaAccess`,
  `AccessRequest`, `Video`, `Lesson`, `CourseModule`, ...): no lookup
  attempted; render as `{Action} · {EntityName} #{first 8 chars of
  EntityId}` (or no id suffix at all if `EntityId` is null).

### States

- **Loading**: the sidebar, header, and page shell render immediately
  once the route's own permission gate passes; each of the three data
  sections (course table, areas-ativas sidebar block, audit panel) shows
  its own "Carregando…" independently while its own call is in flight —
  no waiting on the slowest of the three before showing anything.
- **Error**: any of the three failing shows a retry-safe error state for
  that section specifically — a courses-fetch failure shouldn't hide an
  otherwise-successful audit panel, and vice versa. Each section gets
  its own inline retry.
- **Forbidden**: the route itself is gated on `courses.manage`
  (`AuthPermissionNames.ManageCourses`) — a user without it is
  redirected to `/catalog` before anything loads (same posture as
  `areas-list.md`), same as a user with no access token being sent to
  `/login`. Once past that gate, the areas-ativas sidebar block and the
  audit panel each check their *own* permission independently
  (`areas.manage` / `audit.read`, since they call `GET /api/areas` /
  `GET /api/audit-logs` respectively) — a `courses.manage`-only admin
  sees the course table (with the Áreas column showing `—` since it has
  no area names to resolve), no areas-ativas block in the sidebar, and
  the audit panel showing "Sem permissão para ver auditoria." instead of
  a 403.

## Open decisions

Resolved with the user on 2026-09-07:

- **Audit log entries carry no display name anywhere in the backend**
  (see `Docs/backend-pendencies/admin/courses-panel.md` pendency 4 —
  confirmed by reading every `RecordAsync` call site in the codebase,
  not just the two entries the mockup happens to show). **Decision:
  best-effort partial enrichment** — resolve a display name only when
  the referenced entity is already loaded elsewhere on this same page
  (courses, areas), and fall back to `{EntityName} #{short id}` for
  everything else (users, videos, lessons, modules, access grants).
  Rejected alternatives: fabricating an N+1 lookup per audit row (slow,
  and still incomplete since no endpoint resolves a user id to an
  email), or showing raw ids for every entry regardless of whether a
  name is available for free (would make an already-half-decorated
  screen worse for no reason).

Derived without needing to ask (low-stakes, reversible):

- **Relative-time formatting** ("há 2h", "ontem"): a small pure
  formatter, no library — `< 1h` → "há Xmin", `< 24h` → "há Xh",
  `< 48h` → "ontem", else the absolute date. No existing relative-time
  utility or library in this codebase to reuse.
- **"Novo curso" and row clicks are inert**, mirroring the exact
  precedent `areas-list.md` set for "Nova área" before `area-form.md`
  existed.

## Acceptance criteria

- `/admin/courses` renders the sidebar (with a real "Áreas ativas"
  summary), the course table, and the audit panel for a user with both
  `courses.manage` and `audit.read`.
- A user with `courses.manage` but not `audit.read` sees everything
  except the audit panel, which shows a permission message instead of
  erroring the page.
- A user with neither permission is redirected to `/catalog`; a user
  with no access token is redirected to `/login`.
- The header subtitle, table rows, sidebar area summary, and audit
  panel all come from live API calls — no hardcoded course, area, or
  audit data.
- Each of the three sections (courses, areas summary, audit panel) has
  its own loading/error/retry handling, independent of the other two.
- "Novo curso" and course rows are visibly present but do not navigate
  anywhere.
- No write call (`POST`/`PUT`/`.../publish`/`.../unpublish`) is made
  from this screen.
