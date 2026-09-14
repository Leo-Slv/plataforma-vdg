# Admin — Lesson editor: implementation plan

Spec: `Docs/specs/admin/lesson-editor.md`.

## Route

- `src/app/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/edit/page.tsx`
  — thin, mirrors `.../modules/page.tsx`:
  ```tsx
  export default async function LessonEdit({
    params,
  }: PageProps<'/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/edit'>) {
    const { courseId, moduleId, lessonId } = await params;
    return <LessonEditorPage courseId={courseId} moduleId={moduleId} lessonId={lessonId} />;
  }
  ```
- `src/lib/routes/app-routes.ts`: add
  `lessonEdit: (courseId: string, moduleId: string, lessonId: string) =>
    \`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit\`,`
  under `admin`.

## Data layer (video)

New model/schema/api, following the existing `lesson.ts` / `lesson.schema.ts`
/ `get-course-modules.ts` pattern exactly.

- `src/features/admin/schemas/video.schema.ts`:
  ```ts
  const videoSchema = z.object({
    id: z.string(),
    lessonId: z.string(),
    title: z.string(),
    description: z.string(),
    storageProvider: z.string(),
    storageKey: z.string(),
    playbackUrl: z.string().nullable(),
    thumbnailUrl: z.string().nullable(),
    durationSeconds: z.number(),
    sizeBytes: z.number(),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });
  ```
- `src/features/admin/model/video.ts`: `type Video = z.infer<typeof videoSchema>`.
- `src/features/admin/api/get-lesson-video.ts`: `GET /api/videos/lessons/{lessonId}`.
  A `404` must surface as the normal "no video" case, not swallowed — let
  `apiFetch`'s `ApiError` propagate; the query hook below treats status 404
  specially (see below), everything else is a real error.
- `src/features/admin/api/replace-lesson-video.ts`:
  `PUT /api/videos/lessons/{lessonId}` with payload
  `{ title, description, storageProvider: 'YouTube', storageKey, thumbnailUrl, durationSeconds, sizeBytes: 0 }`.
- `src/features/admin/api/mark-video-ready.ts`: `POST /api/videos/{videoId}/ready`.
- `src/features/admin/api/delete-lesson-video.ts`: `DELETE /api/videos/lessons/{lessonId}`.

Check `src/lib/http/api-client.ts` / `api-error.ts` for the exact `ApiError`
shape (status field name) before wiring the 404-as-empty-state handling —
match whatever `isApiError`/`error.status` convention `course-modules-page.tsx`
already uses for its own 401/409 checks.

## Query keys & hooks

- `src/lib/constants/query-keys.ts`: add
  `lessonVideo: (lessonId: string) => ['admin', 'lessons', lessonId, 'video'] as const,`
  under `admin`.
- `src/features/admin/hooks/admin.queries.ts`: add
  - `useLessonVideoQuery(lessonId, { enabled })` — `useQuery` with
    `retry: false` (don't retry a 404) and `queryFn: () => getLessonVideo(lessonId)`;
    consumers read `query.isError && isApiError(query.error) && query.error.status === 404`
    as "no video" vs. any other error as a real failure.
  - `useReplaceLessonVideoMutation()` — mutationFn takes `{ lessonId, payload }`.
  - `useMarkVideoReadyMutation()` — mutationFn takes `{ videoId }`.
  - `useDeleteLessonVideoMutation()` — mutationFn takes `{ lessonId }`.

No new hook is needed to fetch the lesson itself — reuse
`useCourseModulesQuery(courseId, { enabled })` (already fetches the full
module/lesson tree) and `useCoursesQuery` (for the course title in the
breadcrumb), exactly like `course-modules-page.tsx` already does for the
course. Find the target module/lesson client-side from that tree.

## Perguntas dos alunos panel (added 2026-09-14)

Data layer, mirroring the trimmed-model convention already used for
`Video`/`LessonNote` elsewhere:

- `src/features/admin/schemas/lesson-question.schema.ts`:
  ```ts
  const lessonQuestionSchema = z.object({
  	id: z.string(),
  	askedByName: z.string(),
  	questionText: z.string(),
  	answerText: z.string().nullable(),
  	answeredByName: z.string().nullable(),
  	answeredAt: z.string().nullable(),
  	createdAt: z.string(),
  });
  ```
  Drops `lessonId` (already scoped by the route), `askedByUserId`,
  `answeredByUserId`, `updatedAt` — none render here.
- `src/features/admin/model/lesson-question.ts`: `type LessonQuestion =
  z.infer<typeof lessonQuestionSchema>` — same schema-first convention
  `model/video.ts` already uses (unlike catalog's hand-written models).
- `src/features/admin/api/get-lesson-questions.ts`,
  `answer-lesson-question.ts`, `remove-lesson-question.ts` — plain
  `apiFetch` wrappers against `GET/POST /api/questions/lessons/{id}`,
  `POST /api/questions/{id}/answer`, `DELETE /api/questions/{id}`.
- `queryKeys.admin.lessonQuestions(lessonId)` →
  `['admin', 'lessons', lessonId, 'questions']`.
- `admin.queries.ts`: `useLessonQuestionsQuery(lessonId, { enabled })`,
  `useAnswerLessonQuestionMutation()`, `useRemoveLessonQuestionMutation()`.

Component: `src/features/admin/components/lesson-questions-panel.tsx`
(`LessonQuestionsPanel({ lessonId })`) — self-contained (owns its own
query/mutations, like `LessonNotePanel` on the catalog side, unlike the
prop-driven `LessonVideoPanel`), because there's no second permission gate
to thread through here (see "Open decisions" below) and no sibling state
on the page needs this data. Local state: `replyingId` (which question's
reply textarea is open, one at a time), `replyText`, `pendingId` (which
question has a mutation in flight, for per-row disabled state — same
pattern `testimonials-table.tsx` already uses for publish/unpublish).
Renders below the existing two-column grid, full-width
(`max-w-[720px]`, matching the left column's typical content width),
inside the same `!isLoading` branch.

**Open decision, resolved without asking (mechanical, same reasoning
already used for the video panel's permission gate)**: no second
`useRequirePermission`/`hasPermission` check for this panel, unlike
`LessonVideoPanel`'s `videos.manage` gate. The video panel needs one
because `VideosController` requires `ManageVideos`, a *different* claim
from the page's own `ManageCourses` gate — an admin could plausibly hold
one without the other. `LessonQuestionsController`'s answer/remove routes
require exactly `ManageCourses`, the same claim `useRequirePermission`
already checked before this page renders anything at all; a second check
here would be redundant, not defensive.

## Form schema

- `src/features/admin/schemas/lesson-editor-form.schema.ts`:
  ```ts
  const lessonEditorFormSchema = z.object({
    title: z.string().trim().min(1, 'Informe o título da aula.'),
    description: z.string().trim(),
    freePreview: z.boolean(),
    published: z.boolean(),
  });
  ```
  (Same shape as `lessonFormSchema` — kept as a separate file/type since this
  screen owns its own form independent of the modal's lifecycle, avoiding a
  shared-schema coupling between a page and a modal that now serve different
  purposes.)
- `src/features/admin/schemas/video-form.schema.ts` (updated 2026-09-14
  for the S3 upload path): a `z.discriminatedUnion('storageProvider', [...])`
  over two branches — `{ storageProvider: 'YouTube', title, description,
  youtubeVideoId, durationMinutes }` and `{ storageProvider: 'S3', title,
  description, file: z.instanceof(File).nullable(), durationMinutes }` —
  plus a `.superRefine` on the union requiring `file` when
  `storageProvider === 'S3'` (can't express "required in this branch" via
  `discriminatedUnion` member schemas alone, since those must stay plain
  `ZodObject`s for the discriminator to work). `durationMinutes` stays a
  shared `z.string()` + `superRefine` (not `z.coerce.number()` — an empty
  input needs to render as an empty field, not `0`), converted to seconds
  at the API-call boundary. No `thumbnailUrl` form field — YouTube derives
  it (`buildYouTubeThumbnailUrl`), S3 has none.
- `src/features/admin/schemas/upload-url.schema.ts` /
  `model/upload-url.ts`: mirrors `POST /api/videos/upload-url`'s response
  (`storageProvider`, `storageKey`, `uploadUrl`, `expiresAt`).
- `src/features/admin/api/request-video-upload-url.ts`: `apiFetch` POST to
  `/api/videos/upload-url` with `storageProvider: 'S3'` hardcoded (the only
  provider this flow ever requests an upload URL for).
- `src/features/admin/lib/upload-file-to-storage.ts`: **not** `apiFetch`
  — a raw `XMLHttpRequest` PUT straight to the presigned URL (a different
  origin, no auth header, the signed URL itself is the authorization),
  using `xhr.upload.onprogress` to report percent complete.
- `src/features/admin/lib/read-video-file-duration.ts`: a throwaway
  `<video>` + `URL.createObjectURL` to read `duration` from the local file
  before any upload happens.
- `src/features/admin/api/replace-lesson-video.ts` (changed): the payload
  gained `storageProvider: 'YouTube' | 'S3'` and a real `sizeBytes` field
  — both used to be hardcoded (`'YouTube'`, `0`) since only YouTube
  existed.

## Components

- `src/features/admin/components/lesson-editor-page.tsx` — the main
  `'use client'` page component (`LessonEditorPage({ courseId, moduleId,
  lessonId })`), structured like `course-modules-page.tsx`:
  - `useRequirePermission(authPermissions.manageCourses)` for the page gate.
  - Separately compute `canManageVideos = hasPermission(decodeAccessTokenClaims(), authPermissions.manageVideos)`
    for the video panel (no redirect — just disables/hides those actions
    with an explanatory note, per the spec).
  - Resolve `course`, `courseModule`, `lesson` from `useCoursesQuery` /
    `useCourseModulesQuery(courseId)`'s data; render the not-found state
    (mirroring `course-modules-page.tsx`'s "Curso não encontrado.") when any
    of them can't be found once loading has settled.
  - Two-column layout (`grid-template-columns: 1.5fr 1fr`, matching the
    mockup) inside the same `AdminSidebar` shell used by
    `course-modules-page.tsx`.
  - Left column: title field (`AdminField`), read-only module display (a
    plain label, not `AdminField`, since it's not editable), description
    (`AdminTextareaField`), video panel.
  - Right column: freePreview `StatusToggle`, published `StatusToggle`,
    read-only order display, "Excluir aula" button.
  - "Salvar aula" submits via `useUpdateLessonMutation` (already exists,
    unchanged) with `{ title, description, freePreview, published }`, then
    invalidates `queryKeys.admin.courseModules(courseId)`.
  - "Excluir aula" reuses `useDeleteLessonMutation`, same 409-vs-generic
    error handling as `course-modules-page.tsx`'s `handleDeleteLesson`, and
    on success does `router.push(appRoutes.admin.courseModules(courseId))`.
  - "Cancelar" does the same `router.push`.
- `src/features/admin/components/lesson-video-panel.tsx` — presentational:
  props for the video (or `null`), loading/error state, `canManage`, and
  `onAdd` / `onReplace` / `onRemove` callbacks; renders the three states
  described in the spec ("Vídeo da aula" section).
- `src/features/admin/components/video-form-modal.tsx` — `AdminModal` +
  `react-hook-form` + `videoFormSchema`; `mode: 'add' | 'replace'` only
  changes the modal title text. **Updated 2026-09-14**: gained an origin
  toggle (two buttons, "YouTube" / "Armazenamento interno") that calls
  `form.reset(...)` with the other branch's shape — switching providers
  mid-edit means starting that branch's fields fresh, not trying to carry
  a YouTube id into a file field or vice versa. The S3 branch's file
  `<input>` (`accept="video/mp4,video/quicktime,video/webm,video/x-matroska"`,
  matching `MediaValidationLimits.AllowedVideoContentTypes`) reads the
  duration via `readVideoFileDuration` on change and pre-fills
  `durationMinutes` the same way the YouTube branch's "Buscar duração pelo
  ID" button does. Submission for S3 is a 3-step async sequence before
  calling the parent's `onSubmit` at all:
  `requestVideoUploadUrl` → `uploadFileToStorage` (with a progress bar
  driven by its `onProgress` callback) → call `onSubmit` with the unified
  `VideoSubmitValues` shape (`storageProvider`, `storageKey`,
  `durationSeconds`, `sizeBytes`, `thumbnailUrl`) so
  `lesson-editor-page.tsx`'s `handleVideoSubmit` doesn't need to know which
  branch produced it. A local `uploadError` state (distinct from the
  parent's `videoError`) covers failures in that 3-step sequence
  specifically. Because `form.formState.errors` isn't a discriminated type
  matching the union the way `form.watch()`'s return value is, field-level
  error lookups go through a small `Partial<Record<...>>` cast rather than
  `errors.file`/`errors.youtubeVideoId` directly (TypeScript can't narrow
  `FieldErrors<A | B>` by a sibling `watch()` value).

## Wiring the "Editar" change on the modules screen

In `src/features/admin/components/course-modules-page.tsx`:

- Remove the `'edit-lesson'` variant from `ModalState`.
- Remove the `handleLessonSubmit` branch and the
  `modal?.type === 'edit-lesson'` render block for `LessonFormModal`.
- Change the `onEditLesson` callback passed to `AdminModuleCard` from
  `setModal({ type: 'edit-lesson', ... })` to
  `router.push(appRoutes.admin.lessonEdit(courseId, courseModule.id, lessonId))`.
- `LessonFormModal`'s `mode` prop effectively becomes `'create'`-only from
  this call site; leave the component's `mode` prop as-is (still a valid,
  reusable component shape) rather than stripping the `'edit'` branch out of
  a shared component — no other call site references it, so this is a
  documentation note, not a required code change. If `npm run lint`'s
  unused-code checks flag the now-dead `'edit'` branch, remove it then.

## Tests

- `lesson-editor-page.spec.ts` (or split across smaller component specs,
  matching how `admin-lesson-row.spec.ts` / `admin-module-card.spec.ts` are
  already split): cover the not-found states, save flow, video empty/present
  states, and the 409-on-delete inline error — same style as existing admin
  feature specs.
- `video-form-modal.spec.ts`: validation errors, minutes→seconds mapping at
  submit.
- Update/remove any existing test coverage for `course-modules-page.tsx`'s
  removed `'edit-lesson'` modal path; add a test asserting "Editar" now
  navigates instead of opening a modal.
- No spec for `lesson-questions-panel.tsx` (added 2026-09-14) — same
  self-contained-queries constraint that already excludes
  `lesson-note-panel.tsx`/`lesson-questions-panel.tsx` on the catalog side
  from component tests.

## Sequencing

1. Route constant + video model/schema/api files (no UI yet) —
   confirm against the running backend (`Docs/specs` step 2 workflow: use
   `https://localhost:7165/scalar` if available, else trust the controller
   source already read for this plan).
2. Query keys + hooks.
3. `lesson-video-panel.tsx` + `video-form-modal.tsx` (presentational, easy
   to unit test in isolation).
4. `lesson-editor-page.tsx` + route file.
5. Wire `course-modules-page.tsx`'s `onEditLesson` to navigate; remove the
   dead modal branch.
6. Tests, then `npm run test`, `npm run typecheck`, `npm run lint`.
7. Update `README.md` feature list / architecture notes if needed.
