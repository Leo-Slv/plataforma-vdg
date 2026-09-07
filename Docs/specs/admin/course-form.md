# Admin — Course create/edit

## Why

The courses panel (`/admin/courses`, see `Docs/specs/admin/courses-panel.md`)
is read-only — "Novo curso" and clicking a row were shipped inert
because this screen didn't exist yet. This closes that gap: staff with
`courses.manage` can create a new course or edit an existing one,
including its pricing model, certificate policy, and publish status.

## Source

Design reference: artboard `1n` ("Curso — criar/editar") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Only the **edit** state is drawn (breadcrumb "Cursos / Editar", a
populated "Conteúdo" panel, "Excluir curso") — same situation
`area-form.md` was in relative to its own mockup artboard. The
**create** state is the same layout with those edit-only pieces removed
and empty defaults, following the same reasoning applied there.

## Goals

- Create a new course: title, description, cover image (URL), pricing
  model + price, area, display order, certificate policy.
- Edit an existing course, including all of the above plus its
  published/draft status and (new field, not in the mockup — see "Open
  decisions") whether it's featured on the landing page.
- Show a "Conteúdo" summary and a link toward module/lesson management
  (artboard `1o`) — inert for now, since neither `1o` nor a backend read
  path for it exists yet (see "Open decisions").
- Provide "Excluir curso", per the resolved decision in
  `Docs/backend-pendencies/admin/course-crud.md` (pendency 5): since
  there's no real `DELETE /api/courses/{id}`, this unpublishes the
  course and returns to the list.

## Non-goals

- Managing modules/lessons — separate spec (artboard `1o`), and
  currently has no admin read endpoint to build against at all (see
  `Docs/backend-pendencies/admin/course-modules-lessons.md` pendency 4).
- Attaching more than one area to a course — the mockup draws a single
  "Área" dropdown with one selected value, not a multi-select; ship
  single-area selection (`AreaIds` becomes a one-element array) even
  though the backend's data model technically allows more.
- Uploading a cover image file — per the already-resolved
  `course-crud.md` pendency 4, this ships as a plain URL input.
- A real permanent delete — see "Excluir curso" above.

## Page content

Shared shell: same `AdminSidebar` (`active="courses"`) as the courses
panel — no `areasSummary` on this screen (that block is specific to the
panel, per `area-form.md`'s precedent of only passing shell props a
given screen actually needs).

### Header

- Breadcrumb: "Cursos / Editar" (edit) or "Cursos / Novo curso" (create).
- Title: the course's current title (edit) or "Novo curso" (create).
- "Pré-visualizar" (edit mode only, real link — opens
  `/courses/{slug}` in a new tab, the already-built public course page;
  not in scope for create mode since there's no persisted course to
  preview yet), "Cancelar" (→ `/admin/courses`), "Salvar curso" / "Criar
  curso".

### Form — left column

- **Título do curso**: required text, matches `Course.Title` (no
  documented max length constraint found on the backend beyond
  non-empty — validated loosely client-side, real limit enforced
  server-side).
- **Slug**: read-only, computed from the title via the same
  `slugify()` used by `area-form.md` (same backend `Slug` value object
  pattern) — no separate slug input, consistent with that precedent.
- **Descrição curta**: textarea, matches `Course.Description`.
- **Capa do curso**: a plain URL text input (not a drop zone — see
  "Non-goals"), matches `Course.ThumbnailUrl` (optional).
- **Modelo de cobrança**: three radio options — "Gratuito para a área"
  (`Free`), "Pago" (`Paid`, reveals a price input in BRL when selected),
  "Por inscrição (turma controlada)" (`EnrollmentControlled`, no price
  field). Selecting `Free` clears any entered price before submit
  (mirrors the backend's own rule — `Course.ValidatePriceAmount` throws
  if `PriceAmount` is set on a `Free` course).

### Form — right column

- **Área**: single-select dropdown of active areas (from the same
  `GET /api/areas` call the courses panel already makes) — see
  "Non-goals" on why this is single-select despite `AreaIds` being an
  array.
- **Status** (edit mode only): "Publicado" / "Rascunho" dropdown. Since
  `UpdateCourseRequest` carries no `Published` field, changing this
  calls the dedicated `POST .../publish` or `POST .../unpublish`
  endpoint after the main field update succeeds — see "Open decisions."
  New courses always start as drafts (`Course.Create` — no "publish
  immediately on create" option in the domain), matching the mockup's
  own implication that "Novo curso" doesn't ask for a status up front.
- **Ordem de exibição**: required integer, matches `DisplayOrder`.
- **Emitir certificado**: toggle, matches the now-real
  `Course.IssuesCertificate` (defaults to `true`, same as the backend
  default for existing courses).
- **Curso em destaque** (new field, not in the mockup — see "Open
  decisions"): toggle, matches `Course.IsFeatured`, the flag the landing
  page's featured-course section reads.
- **Conteúdo**: "Gerenciar módulos →" (inert — see "Non-goals"), no
  live module/lesson count (per the same non-goal — there's no backend
  read path to compute it from without risking a 403 for an admin who
  isn't personally enrolled in the course).
- **Excluir curso** (edit mode only): confirm, then
  `POST /api/courses/{id}/unpublish`, then redirect to `/admin/courses`.

### States

- **Loading** (edit mode only): while the course is being located (see
  "Open decisions" — there's no single-course admin fetch, so this
  reads from the already-fetched admin course list).
- **Not found**: no course with the given id in the admin list → "Curso
  não encontrado." with a link back to `/admin/courses`.
- **Submit error**: a slug conflict (`409`) is shown as a field-adjacent
  error the same way `area-form.md` handles it; any other failure shows
  a generic retry-safe banner, form stays populated.
- **Forbidden**: gated on `courses.manage`, same posture as the courses
  panel — missing it redirects to `/catalog` before the form renders.

## Open decisions

Resolved with the user on 2026-09-07:

- **`IsFeatured` isn't in the mockup, but it's a real, meaningful field**
  (the landing page's featured-course section reads it, added resolving
  `Docs/backend-pendencies/landing/landing-page.md`'s featured-course
  pendency). **Decision: add a "Curso em destaque" toggle** on the right
  column near Status/Ordem, even though it's not drawn in `1n` — the
  alternative (leaving it settable only via direct API calls) strands a
  real feature behind no UI at all.

Carried over from `Docs/backend-pendencies/admin/course-crud.md` and
`course-modules-lessons.md` (not re-litigated, just applied here):

- **Cover image is a URL field, not an upload** (course-crud.md
  pendency 4).
- **"Excluir curso" unpublishes** rather than deleting (course-crud.md
  pendency 5).
- **No module/lesson count or management here** — no backend read path
  exists yet for either (course-modules-lessons.md pendency 4, newly
  recorded while speccing this screen).

Derived without needing to ask (mechanical, low-stakes):

- **No single-course admin fetch endpoint exists** (`GET
  /api/courses/{id}` is the student-facing `GetCourseDetailsUseCase`,
  which 403s an admin with no personal access to the course — confirmed
  by reading it, not assumed). **Decision: reuse the admin course list**
  (`GET /api/courses`, already fetched by the courses panel) and find
  the course by id client-side for the edit form, the same way the
  courses panel already resolves area names from the areas list it has
  in memory. A direct navigation to the edit URL (not arriving via a
  panel row click) still works — it just fetches the full list first.
- **Publish status isn't part of `PUT /api/courses/{id}`** — changing
  it calls `POST .../publish` or `POST .../unpublish` as a second step
  after a successful field update, only when the status actually
  changed.
- **Slug is read-only, computed from the title** — same precedent as
  `area-form.md`.
- **Single-area selection** — see "Non-goals".

## Acceptance criteria

- `/admin/courses/new` renders an empty form; submitting calls
  `POST /api/courses` (with an empty `Modules` array) and, if "Status"
  were ever exposed at creation (it isn't — see above), never publishes
  immediately; redirects to `/admin/courses` on success.
- `/admin/courses/{id}/edit` locates the course in the admin course
  list, pre-fills the form, and submitting calls `PUT
  /api/courses/{id}` followed by `.../publish` or `.../unpublish` only
  when the status actually changed; redirects to `/admin/courses` on
  success.
- The slug shown always matches `slugify(title)` live.
- "Pré-visualizar" opens the real public course page in a new tab (edit
  mode only).
- "Excluir curso" unpublishes and returns to the list.
- A slug conflict on submit is shown as a form error, not a silent
  failure.
- Both routes redirect to `/catalog` for a user missing `courses.manage`.
- No module/lesson data is fetched or displayed on this screen.
