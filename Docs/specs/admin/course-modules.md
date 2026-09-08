# Admin — Course modules & lessons

## Why

The course create/edit screen (`/admin/courses/[courseId]/edit`, see
`Docs/specs/admin/course-form.md`) ships "Gerenciar módulos →" as an
inert link, since neither this screen nor a backend read path existed
yet. Both now do (`GET /api/courses/{courseId}/modules`, added
resolving `Docs/backend-pendencies/admin/course-modules-lessons.md`
pendency 4) — this spec builds the screen that link should point to:
full module and lesson management for one course.

## Source

Design reference: artboard `1o` ("Curso → Módulos e aulas") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).

## Goals

- List every module in a course, each with its lessons, in display
  order.
- Create, edit, delete, and reorder modules.
- Create, edit, delete, and reorder lessons within a module.
- Show each lesson's video status (has one / duration) read-only —
  attaching or replacing a lesson's video is out of scope (see
  "Non-goals").

## Non-goals

- **Video attachment/replacement.** The mockup's per-lesson "Editar"
  in artboard `1p` implies a richer lesson editor including a video
  panel; that's a separate, not-yet-specced screen. This screen's own
  lesson create/edit only covers the fields `AddLessonRequest`/
  `UpdateLessonRequest` actually take (title, description, free
  preview, published) — no video upload/replace here. A lesson's
  existing video status still renders (from `LessonResponse.VideoId`/
  `DurationSeconds`, already returned by the new list endpoint), just
  not editable.
- **Drag-and-drop reordering.** The mockup draws drag handles (`⋮⋮`);
  this ships as up/down buttons calling the same
  `PUT .../reorder` endpoints instead — see "Open decisions".
- **A full lesson editor screen (artboard `1p`).** Not specced here;
  this screen's lesson create/edit is a lightweight modal, not a
  dedicated route.

## Page content

Shared shell: `AdminSidebar` (`active="courses"`).

### Header

- Breadcrumb: "Cursos / {course title} / Módulos".
- Title: "Módulos e aulas".
- "Novo módulo" — opens a create-module modal (title + description;
  `DisplayOrder` is server-assigned, matching
  `course-modules-lessons.md` pendency 1's resolution — no manual order
  input at creation).

### Module list

One card per module, ordered by `DisplayOrder`:

- Title ("Módulo `{n}` — `{title}`" — the "`{n}`" is the module's
  1-based position, computed client-side, not a stored field),
  "`{lessons.length}` aulas" subtitle.
- Up/down reorder buttons (disabled at the first/last position).
- "Editar módulo" — opens an edit-module modal (title, description,
  published toggle).
- Delete — per the backend's own conservative rule
  (`course-modules-lessons.md` pendency 1: "removing a module requires
  it have no lessons first, 409 otherwise"), this button is disabled
  with an explanatory title attribute when the module still has
  lessons, rather than firing a request that's guaranteed to fail.

Nested under each module, its lessons in `DisplayOrder`:

- Title ("Aula `{n}` — `{title}}`"), "`{duration}` · `{vídeo pronto |
  sem vídeo}`" subtitle (`DurationSeconds` formatted as `Xmin`;
  no video → "sem vídeo" instead of the mockup's implied-always-present
  status).
- "Paga"/"Gratuita" badge from `FreePreview` (mirrors the mockup
  exactly — `FreePreview: true` → "Gratuita").
- Up/down reorder buttons, scoped within the module (disabled at the
  first/last position within that module).
- "Editar" — opens an edit-lesson modal (title, description, free
  preview, published).
- Delete — always enabled (unlike module delete, below): whether a
  lesson has recorded student progress isn't part of
  `LessonResponse`, so there's nothing to pre-check client-side. A
  `409` from the backend's own conservative rule is shown as an inline
  error on that lesson instead of prevented up front.
- "+ Nova aula neste módulo" — opens a create-lesson modal for that
  module (title, description, free preview; `DisplayOrder`
  server-assigned, same reasoning as module creation).

### States

- **Loading**: while the module list loads.
- **Empty**: a course with no modules yet shows "Nenhum módulo
  cadastrado ainda." instead of an empty list.
- **Course not found**: same "Curso não encontrado." treatment as
  `course-form.md`, resolved the same way (find-in-admin-list, no
  single-course fetch).
- **Mutation errors**: a generic retry-safe banner. Module delete's
  409 is prevented client-side (disabled button, since lesson count is
  known); lesson delete's 409 (recorded progress — not knowable
  ahead of time) surfaces as an inline error on that lesson instead.
- **Forbidden**: gated on `courses.manage`, same as every other admin
  screen.

## Open decisions

Resolved with the user on 2026-09-08:

- **Reordering interaction.** The mockup draws drag handles. **Decision:
  ship up/down buttons instead** — no new dependency, fully accessible,
  same backend reorder call either way. Revisit if a real drag-and-drop
  library becomes worth adding for other admin screens too.

Derived without needing to ask (mechanical, consistent with prior
screens' precedent):

- **Module/lesson create & edit are modals on this page, not separate
  routes** — the backend fields involved (title, description, a couple
  of booleans) don't warrant a dedicated screen the way area/course
  create-edit did, and the mockup itself never draws one for either.
- **Destructive actions are prevented client-side, not just
  error-handled** — disabling "Excluir" when the backend would 409
  anyway is more honest than letting the admin click it and see a
  generic failure.

## Acceptance criteria

- `/admin/courses/{courseId}/modules` renders the module/lesson tree
  from `GET /api/courses/{courseId}/modules`, in order.
- Creating, editing, deleting, and reordering a module all work and
  refresh the list.
- Creating, editing, deleting, and reordering a lesson within a module
  all work and refresh the list.
- Delete is disabled (not just error-handled) for a module with
  lessons; a lesson delete that 409s (recorded progress) shows an
  inline error instead of failing silently.
- A lesson's video status renders read-only; nothing on this screen
  can attach, replace, or remove a video.
- Gated on `courses.manage`, same as every other admin screen.
