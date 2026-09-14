# Painel admin — Materiais da aula — backend pendencies

Spec (admin side only): `Docs/specs/admin/lesson-editor.md`'s "Materiais da
aula" panel. Evaluated after CourseCore added a full `LessonMaterial` CRUD
(`feat(media): add lesson material CRUD per aula`, commit `ce8a78d`)
alongside per-lesson notes and public Q&A. Of the three compounding gaps
found on 2026-09-14, pendency 1 closed the same day
(`feat(media): add real S3 presigned upload/download URLs`, commit
`3fac653`), unblocking the **admin** side. Pendencies 2-3 are still open, so
the **student-facing "Material" tab stays "Em breve"** — see
`Docs/backend-pendencies/catalog/lesson-player.md` pendency 3.

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

## 2. No student-facing endpoint to list a lesson's materials — still Blocking

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
- **Severity**: **Blocking** — the "Material" tab has no viable data path
  for the audience it's built for (students), independent of pendency 1.

## 3. No download route — `GetDownloadUrlAsync` is dead code — still Blocking

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
- **Severity**: **Blocking** — even once pendencies 1-2 close, there's still
  no way to actually fetch a file's bytes.

## Status (updated 2026-09-14)

- **Admin materials management**: built — see `Docs/specs/admin/lesson-editor.md`'s
  "Materiais da aula" panel (list, upload-and-create, remove). No
  reorder/rename-file UI yet (`PATCH .../order` and `PUT /api/materials/{id}`
  are real but unused by the frontend so far — `UpdateLessonMaterialRequest`
  only covers title/order anyway, never the underlying file).
- **Student "Material" tab**: still "Em breve" — pendencies 2 and 3 above
  are both still open. Notes (`Docs/specs/catalog/lesson-player.md`) and
  Questions — the other two tabs on the same `1h` tab bar — have no such
  gaps and shipped independently already.
