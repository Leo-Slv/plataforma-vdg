# Painel admin — Materiais da aula — backend pendencies

Spec: `Docs/specs/admin/lesson-editor.md`'s "Materiais da aula" panel (admin
side) and `Docs/specs/catalog/lesson-player.md`'s "Material" tab (student
side). Evaluated after CourseCore added a full `LessonMaterial` CRUD
(`feat(media): add lesson material CRUD per aula`, commit `ce8a78d`)
alongside per-lesson notes and public Q&A. All three gaps found on
2026-09-14 are now closed, the last two same-day as this file's own
frontend work: pendency 1 by `feat(media): add real S3 presigned
upload/download URLs` (commit `3fac653`), pendencies 2-3 by
`feat(media): let students list and download a lesson's materials`
(commit `99a3790`) — both admin and student sides are fully built.

Design reference: the mockup has **no artboard for admin material
management** — `1p` ("Aula — criar/editar", `Docs/specs/admin/lesson-editor.md`)
doesn't show a materials section. The only mockup reference to materials at
all is the student-facing "Material / Anotações / Perguntas" tab bar on `1h`
("Player de aula + progresso"), which shows file cards (title + "PDF · 1.2 MB")
but nothing about how an admin attaches them.

## 1. No real upload path — a valid `StorageKey` cannot be obtained today — CLOSED

- **Backend today**: `LessonMaterial.ValidateStorageKey`
  (`Modules/Media/Domain/Entities/LessonMaterial.cs`) explicitly **rejects**
  any value that parses as an absolute URL (`Uri.TryCreate(...) → throw`),
  requiring a bare relative storage key instead (e.g. `videos/abc/apostila.pdf`).
  Unlike video registration — where the "key" is simply a YouTube video id,
  because YouTube is the external host — materials have no equivalent
  external hosting service. The only way to get a real key is uploading the
  file somewhere first, and the endpoint that should hand out an upload
  destination, `MaterialStorageService.GetUploadUrlAsync`
  (`Modules/Media/Infrastructure/Storage/MaterialStorageService.cs`), returns
  a placeholder path (`/media/uploads/{storageKey}`) with **no controller
  route behind it anywhere in the codebase** — confirmed by grepping every
  controller for an upload/media route; none exists. `CreateLessonMaterialRequest`
  takes `StorageKey` as a plain field the caller must already know, same as
  `CreateVideoUseCase`, but videos have YouTube to fall back on and materials
  don't.
- **What's needed**: a real file-upload endpoint (direct multipart upload, or
  a presigned-URL flow for whichever `MaterialStorageProvider` — `Local` or
  `S3` — is configured) that returns a `StorageKey` the admin can then pass
  to `POST /api/materials/lessons/{lessonId}`.
- **Severity**: was **Blocking** — this stopped the admin CRUD itself, not
  just the student-facing view.
- **Resolved, 2026-09-14**: `POST /api/materials/upload-url`
  (`RequestLessonMaterialUploadUseCase`, same commit that added the video
  equivalent) generates a real presigned `S3` upload URL via
  `IS3PresignedUrlProvider`, keyed by `StorageKeyGenerator.Generate("materials",
  lessonId, fileName)`. The admin panel now uploads straight to the bucket
  with that URL, then registers the material with the returned key via the
  existing `POST /api/materials/lessons/{lessonId}` — see
  `Docs/specs/admin/lesson-editor.md`. Same config caveat as the video path:
  `S3` must be in `Media__Playback__AllowedStorageProviders` and
  `Media__S3__*` credentials set, or the upload-url call 400s.

## 2. No student-facing endpoint to list a lesson's materials — CLOSED

- **Mockup expects**: the "Material" tab on `1h` (lesson player, selected by
  default in the mockup) shows a grid of file cards for the lesson currently
  being watched.
- **Backend today**: the only read route, `GET /api/materials/lessons/{lessonId}`
  (`LessonMaterialsController.ListLessonMaterialsAsync`), is gated by
  `[Authorize(Policy = AuthPolicyNames.ManageVideos)]` — admin-only. A
  student with course access has no route to call. `LessonResponse`
  (`Modules/Courses/Presentation/Responses/LessonResponse.cs`) also has no
  `Materials`/`MaterialCount` field, unlike `VideoId`/`DurationSeconds`,
  which were added there specifically so the lesson player could resolve a
  lesson's video without an admin-only call
  (`Docs/backend-pendencies/catalog/lesson-player.md` pendency 1).
- **What's needed**: same shape as the video-id precedent — either a
  student-reachable `GET` (own policy or none, gated by the same
  `CourseAccessService` check `ListLessonQuestionsUseCase`/
  `GetLessonNoteUseCase` already use) or a `Materials` collection folded into
  `LessonResponse`/`CourseDetailsResponse`.
- **Severity**: was **Blocking** — the "Material" tab had no viable data
  path for the audience it's built for (students), independent of
  pendency 1.
- **Resolved, 2026-09-14**: `GET /api/materials/lessons/{lessonId}` is now
  a plain `[Authorize]` route. `ListLessonMaterialsUseCase` gained
  `userId`/`bypassAccessCheck` params, checking
  `CourseAccessService.CanUserAccessCourseAsync` (with a free-preview
  allowance matching `RequestVideoPlaybackUseCase`'s own) unless the
  caller holds `ManageVideos` — the same controller-computed-claim bypass
  pattern already used for `LessonQuestionsController` (pendency in
  `Docs/backend-pendencies/catalog/lesson-player.md`, resolved earlier the
  same day). `LessonResponse` did **not** need a new field — the
  video-id-precedent's "own reachable GET" option was the one implemented,
  not the "fold into LessonResponse" alternative.

## 3. No download route — `GetDownloadUrlAsync` is dead code — CLOSED

- **Mockup expects**: tapping a material card on `1h` opens/downloads the
  file.
- **Backend today (updated 2026-09-14)**: `MaterialStorageService.GetDownloadUrlAsync`
  (`Modules/Media/Infrastructure/Storage/MaterialStorageService.cs`) now
  calls the real `IS3PresignedUrlProvider.GeneratePresignedDownloadUrlAsync`
  for `S3`-backed materials (same real presigned-GET flow the video path's
  playback URL uses) — the signing logic is no longer the old fake scheme,
  it's genuinely functional. But it is still **never called** by any use
  case, and no controller exposes `GET /materials/{materialId}/download`
  (confirmed by grepping every controller). `LessonMaterialResponse` also
  has no `DownloadUrl` field to carry it even if it were generated. Same
  gap as before, just with real plumbing sitting behind it now instead of
  dead placeholder code.
- **What's needed**: a `GetLessonMaterialDownloadUrlUseCase` (mirroring
  `RequestVideoPlaybackUseCase`) plus the controller route it's missing, and
  a `DownloadUrl` field on `LessonMaterialResponse` — or fold the URL
  directly into whatever response pendency 2 ends up shipping.
- **Severity**: was **Blocking** — even once pendencies 1-2 closed, there
  was still no way to actually fetch a file's bytes.
- **Resolved, 2026-09-14**: `GetLessonMaterialDownloadUrlUseCase` (new,
  mirroring `RequestVideoPlaybackUseCase`'s shape) finally calls
  `GetDownloadUrlAsync`, behind a new `GET /api/materials/{materialId}/download`
  route with the same access check (and `ManageVideos` bypass) as pendency
  2. Returns a new `MaterialDownloadResponse` (`materialId`, `title`,
  `fileName`, `downloadUrl`, `expiresAt`) rather than folding a
  `DownloadUrl` field into `LessonMaterialResponse` — the list response
  and the download response serve different moments (browsing vs. the
  instant before opening a file) and a URL that expires in
  `S3StorageOptions.DownloadUrlExpirationMinutes` (10 by default) has no
  business sitting in a cached list response anyway.

## Status (updated 2026-09-14)

Both sides fully built:

- **Admin materials management** — `Docs/specs/admin/lesson-editor.md`'s
  "Materiais da aula" panel (list, upload-and-create, remove). No
  reorder/rename-file UI yet (`PATCH .../order` and `PUT /api/materials/{id}`
  are real but unused by the frontend so far — `UpdateLessonMaterialRequest`
  only covers title/order anyway, never the underlying file).
- **Student "Material" tab** — `Docs/specs/catalog/lesson-player.md`'s
  tab lists real materials and downloads them via a real signed URL,
  gated by the same course-access/free-preview rule as video playback.
  Joins Notes and Questions — the other two tabs on the same `1h` tab
  bar — as fully real.
