# Admin — Lesson editor (with video)

## Why

`Docs/specs/admin/course-modules.md` ships module/lesson management, but
explicitly punts on a full lesson editor: its per-lesson "Editar" opens a
lightweight modal (title, description, free preview, published) with no
video, because attaching/replacing a lesson's video had no backing API at
the time (`course-modules.md`, "Non-goals"). The backend now supports it
(`GET/PUT/DELETE /api/videos/lessons/{lessonId}`, resolved in
`Docs/backend-pendencies/admin/course-modules-lessons.md` pendency 2) — this
spec builds the dedicated screen that closes that gap: a richer, single-lesson
editor with its own route, including video registration.

## Source

Design reference: artboard `1p` ("Aula — criar/editar") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).

## Goals

- Edit a single lesson's title, description/transcript, and free-preview
  flag.
- View, register, replace, or remove the lesson's video.
- Delete the lesson, returning to the modules screen.

## Non-goals

- **Reassigning a lesson to a different module.** The mockup draws a
  "Módulo" dropdown, but no backend endpoint moves a lesson between modules
  (`UpdateLessonRequest` has no module field, and the route itself is scoped
  to a fixed `{moduleId}` — see "Open decisions"). The module is shown
  read-only.
- **Editing display order directly.** The mockup shows an "Ordem no módulo"
  field as if it were a free-form input, but the backend only exposes
  reordering as a full reorder of a module's lesson-id list
  (`PUT .../lessons/reorder`, already used by `course-modules.md`'s up/down
  buttons) — there's no "set this lesson's order to N" endpoint. Order is
  shown read-only (the lesson's current 1-based position within its
  module); reordering stays on the modules screen.
- **Raw video file upload.** Per the standing decision in
  `course-modules-lessons.md` pendency 3, there's no upload endpoint —
  video hosting is "via link" (private/unlisted YouTube). This screen's
  video form is a plain link-registration form, not a drop zone, mirroring
  the same workaround already shipped for course cover images
  (`course-crud.md` pendency 4).
- **Creating a lesson.** This screen is edit-only, matching the mockup's own
  breadcrumb ("Editar aula"); lesson creation stays on the modules screen's
  existing create-lesson modal.

## Page content

Route: `/admin/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/edit`.
Shared shell: `AdminSidebar` (`active="courses"`).

### Header

- Breadcrumb: "Cursos / {course title} / {module title} / Editar aula".
- Title: the lesson's title.
- "Cancelar" — returns to `/admin/courses/{courseId}/modules`.
- "Salvar aula" — submits title/description/free-preview changes.

### Left column

- **Título da aula** — text field.
- **Módulo** — read-only, shows "Módulo `{n}` — `{title}`" (no dropdown; see
  "Non-goals").
- **Descrição / transcrição** — textarea.
- **Vídeo da aula** — video panel:
  - **No video registered** (`GET .../videos/lessons/{lessonId}` 404):
    "Nenhum vídeo cadastrado ainda." + "Adicionar vídeo" button.
  - **Video registered**: shows duration (`Xmin`, from `DurationSeconds`)
    and status (`Processing`/`Ready`/`Failed` → "Processando" / "Pronto" /
    "Falhou"), plus "Substituir vídeo" and "Remover vídeo" actions.
  - "Adicionar vídeo" / "Substituir vídeo" open the same video form modal
    (title, description, YouTube video ID, duration in minutes, optional
    thumbnail URL — see "Open decisions" for why only YouTube).
  - "Remover vídeo" asks for confirmation, then calls
    `DELETE .../videos/lessons/{lessonId}`.

### Right column

- **Aula gratuita (freePreview)** toggle, with the same helper text as the
  modules-screen modal ("Visível sem inscrição no curso pago.").
- **Publicada** toggle — not drawn in the `1p` mockup, but included for the
  same reason `course-modules.md`'s edit-lesson modal already surfaces it:
  `UpdateLessonRequest.Published` is a required field with real product
  meaning (whether the lesson shows to students at all), so it's exposed
  rather than silently resubmitted unchanged.
- **Ordem no módulo** — read-only number (see "Non-goals").
- **Excluir aula** — same confirm-then-delete flow as the modules screen;
  on success, navigates back to `/admin/courses/{courseId}/modules`. A
  `409` (recorded student progress) shows an inline error instead.

### States

- **Loading**: while the module tree (for title/breadcrumb/order context)
  and the lesson's video load.
- **Lesson/module/course not found**: reuses the modules screen's
  "Curso não encontrado." pattern — if the course, module, or lesson id
  doesn't resolve from the loaded data, show a not-found message with a
  "Voltar para módulos" (or "Voltar para cursos") action instead of
  rendering a broken form.
- **Video fetch 404**: not an error state — it's the normal "no video yet"
  case (see "Vídeo da aula" above).
- **Mutation errors**: a generic retry-safe banner for lesson-field saves
  and video register/replace/remove; lesson delete's `409` is a dedicated
  inline message (see above).
- **Forbidden**: gated on `courses.manage` for the page as a whole
  (consistent with every other admin course screen); the video panel's
  register/replace/remove actions additionally require `videos.manage` —
  shown disabled with an explanatory note when the signed-in admin has
  `courses.manage` but not `videos.manage` (see "Open decisions").

## Open decisions

Resolved with the user on 2026-09-08:

- **What "Editar" on the modules screen (`course-modules.md`) should do
  once this screen exists.** **Decision: navigate here instead of opening
  the lightweight edit-lesson modal.** The modal stops being used for
  editing; it's removed from `course-modules.md`'s scope (create-lesson
  keeps its own separate modal, unaffected). `course-modules.md` is updated
  alongside this spec to reflect the new "Editar" behavior.

Derived without needing to ask (mechanical, consistent with prior
screens' precedent):

- **Video registration form ships as a link field, not a drop zone** —
  same reasoning as the course cover-image workaround in `course-crud.md`
  pendency 4: no upload endpoint exists, so the mockup's affordance becomes
  a plain text input instead.
- **Only `YouTube` is offered as a storage provider** — the only one with a
  concrete workflow decided for this product
  (`course-modules-lessons.md` pendency 3); the other `VideoStorageProvider`
  values (`Local`, `S3`, `AzureBlob`, `CloudflareR2`, `Vimeo`, `Mux`) have no
  admin-facing flow to populate their required fields (signed upload URLs,
  API keys, etc.) and aren't offered.
- **`SizeBytes` defaults to `0`** — required by `ReplaceLessonVideoRequest`
  but meaningless for a YouTube-hosted video (CourseCore never stores the
  bytes); not exposed as a form field, same treatment as other
  backend-required-but-UI-irrelevant fields elsewhere in this codebase.
- **The video is marked `Ready` immediately after registration** — a
  YouTube-hosted video has no CourseCore-side transcoding step, so after
  `PUT .../videos/lessons/{lessonId}` succeeds the client also calls
  `POST /api/videos/{videoId}/ready` (using the id from the `PUT` response)
  so the video doesn't sit in "Processing" forever. This is a client-side
  orchestration choice, not a new backend capability — `MarkVideoReadyUseCase`
  already exists and is already gated by the same `ManageVideos` policy.
- **Video panel gated on a second permission (`videos.manage`), independent
  of the page's own `courses.manage` gate** — mirrors the backend exactly:
  `LessonsController` requires `ManageCourses`, `VideosController`'s lesson
  routes require `ManageVideos`. These are two different claims
  (`authPermissions.manageCourses` / `authPermissions.manageVideos`); an
  admin can plausibly hold one without the other.
- **Module/order shown read-only rather than omitted** — the mockup draws
  them, and the data is already available from the loaded module tree; only
  the *editing* affordance is removed, not the information.

## Acceptance criteria

- `/admin/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/edit`
  renders the lesson's current title, description, free preview, published,
  module, and order.
- Saving title/description/freePreview/published calls
  `PUT /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}` and
  reflects the update.
- A lesson with no video shows the empty state; registering one calls
  `PUT /api/videos/lessons/{lessonId}` with `storageProvider: "YouTube"`
  followed by `POST /api/videos/{videoId}/ready`, then shows it as
  "Pronto".
- Replacing an existing video reuses the same `PUT` (upsert) and re-marks
  it ready; removing one calls `DELETE /api/videos/lessons/{lessonId}` and
  reverts to the empty state.
- Video actions are disabled (with an explanatory note) for an admin
  lacking `videos.manage`, independent of the page's own `courses.manage`
  gate.
- Deleting the lesson calls the existing lesson-delete endpoint and
  navigates back to `/admin/courses/{courseId}/modules`; a `409` shows an
  inline error instead.
- The modules screen's per-lesson "Editar" navigates here instead of
  opening the old edit-lesson modal.
- Gated on `courses.manage` for the page; forbidden otherwise, same as
  every other admin screen.
