# Admin — Course modules & lessons — Implementation plan

Spec: [`course-modules.md`](course-modules.md)

## Backend contracts used

- `GET /api/courses/{courseId}/modules` → `CourseModuleResponse[]`
  (`id, courseId, title, description, displayOrder, published, lessons:
  LessonResponse[]`), `LessonResponse`: `id, moduleId, title,
  description, displayOrder, freePreview, published, videoId,
  durationSeconds`. `ManageCourses`, no access-check on the caller
  (confirmed by reading `ListCourseModulesUseCase` — no
  `CourseAccessService` call).
- `POST/PUT/DELETE /api/courses/{courseId}/modules[/{moduleId}]`,
  `PUT .../modules/reorder` (`{ moduleIds: Guid[] }`).
- `POST/PUT/DELETE
  /api/courses/{courseId}/modules/{moduleId}/lessons[/{lessonId}]`,
  `PUT .../lessons/reorder` (`{ lessonIds: Guid[] }`).
- Module delete 409s if it still has lessons; lesson delete 409s if it
  has recorded student progress (both confirmed in
  `course-modules-lessons.md` pendency 1).

## New modules

- **`src/features/admin/model/{course-module,lesson}.ts`** +
  **`schemas/{course-module,lesson}.schema.ts`** — parse the list
  endpoint's response shape.
- **`src/features/admin/schemas/{module-form,lesson-form}.schema.ts`**
  — `moduleFormSchema` (title, description, published), `lessonFormSchema`
  (title, description, freePreview, published) — `published` only
  matters/renders for edit (create always starts unpublished, mirroring
  how `Course.Create`/`Area.Create` work elsewhere in this codebase; not
  independently confirmed against `CreateCourseModuleUseCase`/
  `CreateLessonUseCase` source but consistent with every other "create"
  use case read so far).
- **`src/features/admin/api/`**: `get-course-modules.ts`,
  `create-course-module.ts`, `update-course-module.ts`,
  `delete-course-module.ts`, `reorder-course-modules.ts`,
  `create-lesson.ts`, `update-lesson.ts`, `delete-lesson.ts`,
  `reorder-lessons.ts`.
- **`src/features/admin/hooks/admin.queries.ts`** — add
  `useCourseModulesQuery(courseId)` and one mutation hook per API
  function above.
- **`src/features/admin/lib/format-duration-minutes.ts`** — pure
  `formatDurationMinutes(seconds: number | null): string` → "sem
  vídeo" | "`{n}`min" (rounds down; matches the mockup's "12min"/"18min"
  style, no seconds shown).
- **Presentational**:
  - `admin-modal.tsx` — a small custom overlay+panel (not the shadcn
    `Dialog` primitive — that one's styled for the light `popover`
    token set used nowhere else in this admin section; every other
    admin control here is bespoke-styled to match the dark mockup
    instead of reusing shadcn defaults, so this follows the same
    precedent). Click-outside and Escape both close it.
  - `module-form-modal.tsx` / `lesson-form-modal.tsx` — thin forms
    inside `AdminModal`, reusing `AdminField`/`AdminTextareaField`/
    `StatusToggle`.
  - `reorder-buttons.tsx` — a small up/down pair, disabled at the
    boundary position; takes `onMoveUp`/`onMoveDown` rather than
    knowing about modules/lessons itself, so it's shared by both.
  - `admin-module-card.tsx` (named to avoid clashing with the
    unrelated, catalog-facing `module-card.tsx`) — one module: header
    row (title, lesson count, reorder, edit, delete — delete disabled
    via `title` attribute + `disabled` when `lessons.length > 0`),
    nested lesson rows, "+ Nova aula" trigger.
  - `admin-lesson-row.tsx` — one lesson: title, duration/video-status,
    Paga/Gratuita badge, reorder, edit, delete (delete's 409 shown as
    an inline error under that specific row, not a page-level banner —
    see spec).
  - `course-modules-page.tsx` — gates on `courses.manage`, resolves
    the course title via the already-fetched admin course list (same
    pattern as `course-form-page.tsx`), loads
    `useCourseModulesQuery`, wires every mutation, manages which modal
    (if any) is open and for which module/lesson.
- **Route**: `src/app/admin/courses/[courseId]/modules/page.tsx`.
- **`app-routes.ts`**: `admin.courseModules(courseId)`.
- **`query-keys.ts`**: `admin.courseModules(courseId)`.

## Wiring up the course form

`course-form.tsx`'s "Gerenciar módulos →" becomes a real `Link` to
`appRoutes.admin.courseModules(courseId)` (edit mode only — matches
`course-form.md`'s own note that this was inert pending this screen).

## Reordering mechanics

Both reorder endpoints take the full ordered id list, not a from/to
pair. `onMoveUp`/`onMoveDown` compute the swapped array locally (swap
the item with its neighbor) and send the whole `moduleIds`/`lessonIds`
array in the new order — simplest correct implementation given the
API shape, no partial-reorder endpoint to prefer instead.

## Tests

- `format-duration-minutes.spec.ts` — `null` → "sem vídeo"; various
  second counts → correct minute rounding.
- `admin-module-card.spec.ts` — delete button disabled with lessons
  present, enabled when empty; renders lesson count; renders nested
  lessons.
- `admin-lesson-row.spec.ts` — Paga/Gratuita badge from `freePreview`;
  video status text for both with/without a video.
- `reorder-buttons.spec.ts` — up disabled at position 0, down disabled
  at the last position, both call their handler otherwise.
- No page-level spec for `course-modules-page.tsx`, same precedent as
  every other admin page component in this codebase.

## Manual verification (2026-09-08)

Same real-backend approach as the previous three admin screens, run
against "Escola de Líderes" (a real seeded course with 3 existing
modules):

- **Create module**: "Módulo Teste Playwright" created via the modal,
  confirmed via a follow-up `GET .../modules` call (module count went
  from 3 to 4).
- **Create lesson**: "Aula Teste Playwright" added to the new module,
  confirmed lesson count `1`.
- **Edit lesson**: renamed to "Aula Teste Playwright (editada)",
  confirmed the rename persisted via the API, not just the modal
  closing.
- **Delete guardrail**: confirmed the module's "Excluir" button is
  actually `disabled` in the DOM while it still has a lesson — not
  just discouraged, genuinely unclickable.
- **Delete lesson, then delete the now-empty module**: both confirmed
  via the API afterward (lesson count `0`, then the module itself gone
  from the list).
- Zero console errors across the whole run. A screenshot of the loaded
  screen (3 real modules + the test one, each with real lessons,
  Gratuita/Paga badges, "sem vídeo" status) confirmed the layout
  matches the mockup closely.

## Docs

- `README.md` / `src/features/README.md` — extend the admin bullet.
