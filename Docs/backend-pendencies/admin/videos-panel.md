# Painel admin — vídeos (`1zc`) — backend pendencies

No spec exists for this screen — it's skipped outright (see
`Docs/backend-pendencies/README.md`, "Skipped screens"), the same
treatment given to checkout (`1i`): the gap is severe enough that
building it now would mean either fabricating data or a screen that
can't show what it claims to show.

## 1. No "list all videos" endpoint — Blocking

- **Mockup expects**: a single table listing every video in the system
  (62 rows in the mockup), independent of which lesson each belongs to.
- **Backend has today**: `Modules/Media/Presentation/Controllers/VideosController.cs`
  exposes exactly six routes, all either lesson-scoped or id-scoped —
  `POST /api/videos`, `POST /api/videos/{id}/ready`,
  `GET /api/videos/{videoId}/playback`, `GET /api/videos/lessons/{lessonId}`,
  `PUT /api/videos/lessons/{lessonId}`, `DELETE /api/videos/lessons/{lessonId}`.
  `IVideoRepository` (`Modules/Media/Domain/Repositories/IVideoRepository.cs`)
  only exposes `FindByIdAsync`, `FindByLessonIdAsync`,
  `ListDurationSecondsByLessonIdsAsync`, `ListByLessonIdsAsync` — every
  query is keyed by a lesson id (or id list); there's no unkeyed "get
  all" query to back a collection endpoint.
- **What closing the gap would need**: a new `GET /api/videos`
  (paginated, `ManageVideos`-gated) endpoint and a matching repository
  query with no lesson-id filter.
- **Workaround shipped**: none. An N+1 client-side reconstruction
  (walk `GET /api/courses` → modules → lessons → `GET /api/videos/lessons/{lessonId}`
  per lesson) is technically possible but was rejected: one HTTP request
  per lesson system-wide just to paint a table is the kind of thing this
  codebase avoids elsewhere (see the users-list pendency for a similar
  per-row-request tradeoff that was accepted only because the row count
  is small; here it's system-wide, not one admin screen's own rows).
- **Severity**: Blocking.

## 2. No YouTube-ID field on `Video` — Feature gap

- **Mockup expects**: a `Video` identified by a YouTube video id
  (`dQw4w9WgXcQ`), with a derived `youtube.com/watch?v=...` URL shown
  underneath.
- **Backend has today**: `Modules/Media/Domain/Entities/Video.cs` has no
  YouTube-specific field. Storage is generic: `StorageProvider` (enum:
  `Local`, `S3`, `AzureBlob`, `CloudflareR2`, `YouTube`, `Vimeo`, `Mux`)
  plus an opaque `StorageKey` string. A YouTube video's id would live in
  `StorageKey` when `StorageProvider == YouTube`, but there's no
  dedicated, typed field the frontend can rely on being a YouTube id
  specifically (the admin lesson-editor's existing "register video" form
  already works this way — a plain `StorageKey` string treated as a
  YouTube id by convention, not by schema).
- **Severity**: Feature gap (workable via convention, not a hard block on
  its own — only listed because it compounds with pendency 1).

## 3. No "unlinked" video state — Feature gap

- **Mockup expects**: a "Sem vínculo" (unlinked) row — a video that
  exists but isn't attached to any lesson.
- **Backend has today**: `Video`'s constructor validates
  `lessonId != Guid.Empty` (`Video.cs`, `ValidateId`) — a `Video` cannot
  be created without a lesson. `CreateVideoUseCase` additionally enforces
  one video per lesson (409 if the lesson already has one). An unlinked
  video is not a representable state in the domain model today.
- **Severity**: Feature gap (this is a domain invariant, not a missing
  read — closing it would mean relaxing a constraint the backend
  currently enforces on purpose).

## 4. No "Ativo / Não listado" visibility status — Feature gap

- **Mockup expects**: a per-video visibility status distinct from
  processing state.
- **Backend has today**: `Modules/Media/Domain/Enums/VideoStatus.cs` has
  exactly three values — `Processing`, `Ready`, `Failed` — a processing
  pipeline state, not a visibility/publish concept. There's no
  `Unlisted`/"não listado" member and no separate visibility flag
  anywhere on `Video`.
- **Severity**: Feature gap.

## Verdict

Four gaps, one of them (pendency 1) Blocking on its own and the other
three compounding it — this isn't "hide one field," it's "the screen's
core listing has no data path and its per-row columns don't map to real
backend concepts." Skipped for now, same as checkout (`1i`); revisit once
CourseCore adds a real videos-list endpoint.
