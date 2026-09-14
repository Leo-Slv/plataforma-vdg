# Painel admin — Materiais da aula — backend pendencies

No spec exists for this screen yet. Evaluated after CourseCore added a full
`LessonMaterial` CRUD (`feat(media): add lesson material CRUD per aula`,
commit `ce8a78d`) alongside per-lesson notes and public Q&A. Unlike those two
(both fully usable end-to-end today), materials have three compounding gaps —
one of them blocking even the admin side, not just the student side — so
building either screen is skipped for now.

Design reference: the mockup has **no artboard for admin material
management** — `1p` ("Aula — criar/editar", `Docs/specs/admin/lesson-editor.md`)
doesn't show a materials section. The only mockup reference to materials at
all is the student-facing "Material / Anotações / Perguntas" tab bar on `1h`
("Player de aula + progresso"), which shows file cards (title + "PDF · 1.2 MB")
but nothing about how an admin attaches them.

## 1. No real upload path — a valid `StorageKey` cannot be obtained today — Blocking

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
- **Severity**: **Blocking** — this stops the admin CRUD itself, not just the
  student-facing view. An admin has no legitimate way to produce a valid
  `StorageKey` for a new file through this API today.

## 2. No student-facing endpoint to list a lesson's materials — Blocking

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

## 3. No download route — `GetDownloadUrlAsync` is dead code — Blocking

- **Mockup expects**: tapping a material card on `1h` opens/downloads the
  file.
- **Backend today**: `MaterialStorageService.GetDownloadUrlAsync`
  (`Modules/Media/Infrastructure/Storage/MaterialStorageService.cs`) already
  builds a signed URL — `{baseUrl}/materials/{materialId}/download?expires=...&signature=...`,
  same signing pattern as `VideoStorageService.GeneratePlaybackUrlAsync` — but
  it is **never called** by any use case, and no controller exposes
  `GET /materials/{materialId}/download` (confirmed by grepping every
  controller). `LessonMaterialResponse` also has no `DownloadUrl` field to
  carry it even if it were generated. This is effectively half-built: the
  signing logic exists, the route serving it doesn't.
- **What's needed**: a `GetLessonMaterialDownloadUrlUseCase` (mirroring
  `RequestVideoPlaybackUseCase`) plus the controller route it's missing, and
  a `DownloadUrl` field on `LessonMaterialResponse` — or fold the URL
  directly into whatever response pendency 2 ends up shipping.
- **Severity**: **Blocking** — even once pendencies 1-2 close, there's still
  no way to actually fetch a file's bytes.

## Decision (2026-09-14)

Skip building both the admin materials-management screen and the student
"Material" tab for now — all three gaps compound (nothing works end-to-end:
admins can't create real materials, students can't list them, and nothing
can download them regardless). Revisit once CourseCore ships a real upload
endpoint (pendency 1) and the two read-side gaps (pendencies 2-3). Notes
(`Docs/specs/catalog/lesson-notes.md`) and Questions
(`Docs/specs/catalog/lesson-questions.md`) — the other two tabs on the same
`1h` tab bar — have no such gaps and are specced/built independently.
