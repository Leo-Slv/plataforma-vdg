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
- `src/features/admin/schemas/video-form.schema.ts`:
  ```ts
  const videoFormSchema = z.object({
    title: z.string().trim().min(1, 'Informe o título do vídeo.'),
    description: z.string().trim(),
    youtubeVideoId: z.string().trim().min(1, 'Informe o ID do vídeo do YouTube.'),
    durationMinutes: z.coerce.number().int().min(1, 'Informe a duração em minutos.'),
    thumbnailUrl: z.string().trim(),
  });
  ```
  Convert `durationMinutes * 60` → `durationSeconds` at the API-call
  boundary (component/mutation call site), not inside the schema — same
  separation of concerns as the rest of this codebase (schemas validate
  shape, callers map to request payloads).

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
  `react-hook-form` + `videoFormSchema`, mirroring `lesson-form-modal.tsx`'s
  structure (fields: título, descrição, ID do vídeo do YouTube, duração em
  minutos, thumbnail URL opcional); `mode: 'add' | 'replace'` only changes
  the modal title text.

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
