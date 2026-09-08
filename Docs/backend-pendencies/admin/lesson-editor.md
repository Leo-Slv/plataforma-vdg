# Backend Pendencies — Admin Panel: Lesson editor (artboard `1p`)

Most of `1p`'s backing API was already resolved while speccing
[`course-modules-lessons.md`](course-modules-lessons.md) (pendencies 1-3:
lesson CRUD, per-lesson video GET/PUT/DELETE, and the YouTube-link video
hosting decision). This file covers the gaps left once `1p` itself
(`Docs/specs/admin/lesson-editor.md`) got specced in detail.

## 1. No endpoint to move a lesson to a different module

- **Mockup expects**: `1p`'s "Módulo" field is drawn as a dropdown
  (`▾` affordance), implying a lesson can be reassigned to another module
  from its own edit screen.
- **Backend today**: `LessonsController`'s update route is
  `PUT /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}` —
  `moduleId` is part of the route itself, not a body field, and
  `UpdateLessonRequest` (`Title`, `Description`, `FreePreview`, `Published`)
  has no module reference at all. There is no "move lesson" operation
  anywhere in `Modules/Courses`.
- **What's needed**: either a dedicated
  `PUT .../lessons/{lessonId}/move` (target module id, likely appended to
  the target module's `DisplayOrder` sequence the same way create does) or
  adding a settable `ModuleId` to the update path — the latter would need
  care around the unique `(ModuleId, DisplayOrder)` index the same way
  `course-modules-lessons.md` pendency 1's reorder logic already handles.
- **Workaround shipped**: `lesson-editor.md` renders "Módulo" read-only,
  no dropdown.
- **Severity**: Feature gap.

## 2. No endpoint to set a lesson's display order directly

- **Mockup expects**: `1p`'s "Ordem no módulo" field is drawn as a plain
  value (just "2"), which reads as editable alongside the rest of the form.
- **Backend today**: the only way to change a lesson's `DisplayOrder` is
  `PUT .../lessons/reorder` with the *entire* module's lesson-id list in
  the desired order (`ReorderLessonsRequest`) — there's no "set this one
  lesson's order to N" call.
- **What's needed**: either a dedicated set-order endpoint, or accept that
  reordering only ever happens list-at-a-time (arguably the safer design,
  given the unique-index rewrite dance `course-modules-lessons.md`
  pendency 1 already describes for the list-based reorder).
- **Workaround shipped**: `lesson-editor.md` renders "Ordem no módulo"
  read-only (the lesson's current 1-based position); reordering stays on
  `course-modules.md`'s up/down buttons.
- **Severity**: Cosmetic — the mockup's field reads as informational once
  you can't submit a bare number without also specifying the rest of the
  module's order.

## 3. Registered (YouTube-hosted) videos never leave "Processing" on their own

- **Mockup expects**: `1p`'s video panel shows "processado" as soon as a
  video is attached — no separate "waiting for processing" step is drawn.
- **Backend today**: `Video.Create` always starts a new video in
  `VideoStatus.Processing` (`Modules/Media/Domain/Entities/Video.cs`), and
  `ReplaceLessonVideoUseCase` calls `existingVideo.MarkAsProcessing()` again
  on every update. Nothing transitions a video to `Ready` except
  `POST /api/videos/{id}/ready` (`MarkVideoReadyUseCase`) — a route that
  exists to let some external transcoding pipeline report completion, which
  doesn't apply to YouTube-hosted videos at all.
- **What's needed**: nothing backend-side — this is a real gap only in the
  sense that admin-registered YouTube videos have no transcoding step to
  wait for, so the existing "mark ready" call needs to be triggered by
  *something*.
- **Workaround shipped**: `lesson-editor.md` has the frontend call
  `POST /api/videos/{videoId}/ready` immediately after every successful
  `PUT /api/videos/lessons/{lessonId}`, using the id from that response —
  a client-side orchestration choice, not a new backend capability.
  Revisit if a real transcoding-backed provider (`S3`/`Mux`/etc.) is ever
  wired up, since that path *should* wait for an external "ready" signal
  instead of firing it eagerly.
- **Severity**: Cosmetic, given the workaround — would become a real gap
  the moment a non-instant provider is added.

## What's already real

Everything else `1p` needs was already closed while speccing
`course-modules-lessons.md`:

- `PUT /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}` —
  title/description/freePreview/published (pendency 1 there).
- `GET/PUT/DELETE /api/videos/lessons/{lessonId}` — view, register/replace,
  remove a lesson's video (pendency 2 there).
- `YouTube` as a `VideoStorageProvider`, with `StorageKey` = the YouTube
  video id (pendency 3 there, decision).
- `DELETE .../lessons/{lessonId}` already returns `409` when the lesson has
  recorded student progress (pendency 1 there) — reused as-is for this
  screen's "Excluir aula".
