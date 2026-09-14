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
- View, register, replace, or remove the lesson's video — either as a
  YouTube link (by video id) or by uploading a file straight to the
  internal S3 bucket (2026-09-14, once `POST /api/videos/upload-url`
  shipped a real presigned-upload flow — see "Open decisions").
- Delete the lesson, returning to the modules screen.
- View every question students have asked on this lesson (public Q&A,
  `feat(questions): add public per-lesson Q&A` on the CourseCore side —
  see `Docs/specs/catalog/lesson-player.md` for the student-facing half),
  answer an unanswered one, or remove any question.
- Upload a supporting file (PDF, Office doc, zip, image) to the lesson,
  straight to the internal S3 bucket, and remove one (2026-09-14, once
  `POST /api/materials/upload-url` shipped — see "Open decisions").

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
  - **Video registered**: shows duration (`Xmin`, from `DurationSeconds`),
    status (`Processing`/`Ready`/`Failed` → "Processando" / "Pronto" /
    "Falhou"), and which storage the video is on ("YouTube" /
    "Armazenamento interno"), plus "Substituir vídeo" and "Remover vídeo"
    actions.
  - "Adicionar vídeo" / "Substituir vídeo" open the same video form modal,
    which now (2026-09-14) starts with an origin toggle:
    - **YouTube**: video id field + "Buscar duração pelo ID" (unchanged).
    - **Armazenamento interno**: a file picker (accepts
      `video/mp4`/`quicktime`/`webm`/`x-matroska`, matching
      `MediaValidationLimits.AllowedVideoContentTypes`); duration is read
      client-side from the file's own metadata the moment it's selected
      (no round trip needed), editable manually if that read fails.
      Submitting requests a presigned URL
      (`POST /api/videos/upload-url`), PUTs the file straight to it with a
      progress bar, then registers the video with the returned storage
      key — same `PUT .../videos/lessons/{lessonId}` call the YouTube path
      already used, just with `storageProvider: "S3"`. No thumbnail for
      this path (see "Open decisions").
  - "Remover vídeo" asks for confirmation, then calls
    `DELETE .../videos/lessons/{lessonId}`.

### Below the two columns

- **Materiais da aula** — every file attached to this lesson
  (`GET /api/materials/lessons/{lessonId}`), each showing title, file name,
  and size. "Adicionar material" opens a modal: title + file picker
  (accepts the types `MediaValidationLimits.AllowedMaterialContentTypes`
  allows — PDF, Word, PowerPoint, Excel, zip, PNG/JPEG; 50 MB cap per
  `MaxMaterialSizeBytes`). Submitting requests a presigned URL
  (`POST /api/materials/upload-url`), PUTs the file to it with a progress
  bar, then registers the material with the returned storage key
  (`POST /api/materials/lessons/{lessonId}`). "Remover" calls
  `DELETE /api/materials/{id}`. **Gated on `videos.manage`, same as the
  video panel above and independent of the page's own `courses.manage`
  gate** — every route on `LessonMaterialsController` requires
  `ManageVideos`, not `ManageCourses`. An admin with `courses.manage` but
  not `videos.manage` sees the same disabled state + explanatory note the
  video panel already shows in that situation, reusing `canManageVideos`.
  Empty state: "Nenhum material cadastrado ainda."
- **Perguntas dos alunos** — every question asked on this lesson
  (`GET /api/questions/lessons/{lessonId}`, oldest first, same order the
  student-facing tab uses — no re-sorting), each showing the asker's name,
  question text, and a relative timestamp. An unanswered question gets a
  "Responder" action (opens an inline textarea, submits via
  `POST /api/questions/{id}/answer`, capped at 2000 chars matching
  `QuestionValidationLimits.AnswerTextMaxLength`) and a "Remover" action
  (`DELETE /api/questions/{id}`); an answered one shows the reply plus the
  answerer's name instead of the form, with "Remover" still available
  (answering doesn't lock a question against deletion on the backend, and
  there's no reason this screen should invent that restriction). No
  separate permission gate — this panel only renders once the page's own
  `courses.manage` check has already passed, and both endpoints require
  exactly that same claim (`AuthPolicyNames.ManageCourses`).
- Empty state: "Nenhuma pergunta ainda." — no fabricated example rows.

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

- **Video registration ships as either a YouTube link or a real upload —
  no other provider is offered (2026-09-14).** Originally
  (`course-modules-lessons.md` pendency 3) only `YouTube` had a concrete
  workflow, since no upload endpoint existed — the mockup's drop-zone
  affordance became a plain link field instead. CourseCore later shipped
  `POST /api/videos/upload-url` (a real S3 presigned-upload flow,
  `feat(media): add real S3 presigned upload/download URLs`), so the form
  now offers a second origin, "Armazenamento interno" (`storageProvider:
  "S3"`): pick a file, it uploads straight to the bucket via the presigned
  URL, then registers with the returned storage key. The other
  `VideoStorageProvider` values (`Local`, `AzureBlob`, `CloudflareR2`,
  `Vimeo`, `Mux`) still have no admin-facing flow and aren't offered.
  **Config note, not a code gap**: the backend only allows a storage
  provider CourseCore's own config lists — `S3` must be added to
  `Media__Playback__AllowedStorageProviders` (see that repo's
  `.env.example`) and `Media__S3__BucketName`/`Region`/`AccessKeyId`/
  `SecretAccessKey` must be set, or `POST /api/videos/upload-url` 400s
  with "Storage provider is not allowed."
- **No thumbnail field for the internal-storage path** — YouTube gets one
  derived from the video id (`buildYouTubeThumbnailUrl`); there's no
  equivalent auto-derivation for an arbitrary uploaded file, and adding a
  manual thumbnail-upload flow wasn't asked for.
- **Duration is read client-side from the file itself for uploads**
  (a throwaway `<video>` element's `loadedmetadata` event), rather than
  requiring the admin to know it upfront the way the YouTube path's
  "Buscar duração pelo ID" call does server-side. Falls back to manual
  entry if the browser can't read it (e.g. an unsupported codec).
- **`SizeBytes` defaults to `0`** for the YouTube path — required by
  `ReplaceLessonVideoRequest` but meaningless for a YouTube-hosted video
  (CourseCore never stores the bytes). The internal-storage path sends the
  real `file.size` instead, since that number is actually meaningful
  there.
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
- A lesson with no video shows the empty state; registering one via
  YouTube calls `PUT /api/videos/lessons/{lessonId}` with
  `storageProvider: "YouTube"` followed by `POST /api/videos/{videoId}/ready`,
  then shows it as "Pronto".
- Registering one via upload calls `POST /api/videos/upload-url`, `PUT`s
  the selected file to the returned presigned URL, then the same
  `PUT /api/videos/lessons/{lessonId}` with `storageProvider: "S3"` and the
  returned storage key, followed by the same `/ready` call — the panel
  labels it "Armazenamento interno".
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
- The "Perguntas dos alunos" panel lists every real question for this
  lesson via `GET /api/questions/lessons/{lessonId}` — no mock data.
  Answering calls `POST /api/questions/{id}/answer` and the question
  immediately shows the reply; removing calls `DELETE /api/questions/{id}`
  and the question disappears from the list.
- The "Materiais da aula" panel lists every real material via
  `GET /api/materials/lessons/{lessonId}`. Adding one requests a real
  presigned URL, uploads to it, and registers the material — the new file
  appears in the list without a page refresh. Removing calls
  `DELETE /api/materials/{id}`. Both the list and "Adicionar material" are
  hidden behind `videos.manage`, independent of the page's own
  `courses.manage` gate — same treatment as the video panel.
