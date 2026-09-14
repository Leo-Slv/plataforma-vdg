# Lesson Player Page — Implementation Plan

Implements [`lesson-player.md`](lesson-player.md).

## Still the `catalog` feature

Same reasoning `course-detail-implementation-plan.md` already applied: this
is the backend's Courses (+ Progress) modules, not a new business feature.
Everything here extends `src/features/catalog/`.

## Route

`src/app/courses/[slug]/lessons/[lessonId]/page.tsx` (new — this repo's
first two-segment dynamic route):

```tsx
export default async function LessonPlayer({
	params,
}: PageProps<'/courses/[slug]/lessons/[lessonId]'>) {
	const { slug, lessonId } = await params;
	return <LessonPlayerPage slug={slug} lessonId={lessonId} />;
}
```

Same thin-wrapper convention as `courses/[slug]/page.tsx`. `PageProps<...>`
for a two-segment route only exists in `.next/types` once the route has
been compiled at least once — same fix as last time: start `npm run dev`,
hit the route once, stop, then `npm run typecheck`.

## `appRoutes` / `queryKeys` additions

```ts
// app-routes.ts
courses: {
	detail: (slug: string) => `/courses/${slug}`,
	lesson: (slug: string, lessonId: string) =>
		`/courses/${slug}/lessons/${lessonId}`,
},
```

```ts
// query-keys.ts
progress: {
	course: (courseId: string) => ['progress', 'course', courseId] as const,
},
```

## Extending `src/features/catalog/`

```text
src/features/catalog/
├── model/
│   └── course-progress.ts          # LessonProgress, CourseProgress
├── schemas/
│   └── course-progress.schema.ts   # mirrors GET /api/progress/courses/{id}
├── api/
│   ├── get-course-progress.ts
│   └── register-lesson-progress.ts
├── hooks/
│   └── catalog.queries.ts          # add useCourseProgressQuery(),
│                                    # useRegisterLessonProgressMutation()
├── lib/
│   ├── lesson-sequence.ts          # findLessonById(), findNextLessonId()
│   └── lesson-sequence.spec.ts
└── components/
    ├── lesson-player-page.tsx      # 'use client': gate + catalog lookup +
    │                                # access redirect + details/progress
    │                                # queries + lesson resolution + mark-
    │                                # as-watched + branching
    ├── lesson-video-placeholder.tsx
    ├── lesson-video-placeholder.spec.ts
    ├── lesson-sidebar.tsx
    ├── lesson-sidebar.spec.ts
    ├── module-card.tsx             # changed: links to its first lesson
    ├── module-card.spec.ts         # changed: covers the new link
    └── course-detail-owned.tsx     # changed: passes `slug` down
```

### `model/course-progress.ts`

Trimmed to what this page actually reads — same precedent
`course-details.ts` set (dropping `id`, `userId`, `courseId`,
`startedAt`, `completedAt`, `watchedSeconds`, `lastWatchedAt` off both
DTOs; nothing here needs a timestamp or a raw seconds count, only the
percent and the per-lesson done/not-done flag):

```ts
type LessonProgress = {
	lessonId: string;
	completed: boolean;
};

type CourseProgress = {
	progressPercent: number;
	lessons: LessonProgress[];
};

export type { LessonProgress, CourseProgress };
```

### `schemas/course-progress.schema.ts`

```ts
import { z } from 'zod';

const lessonProgressSchema = z.object({
	lessonId: z.string(),
	completed: z.boolean(),
});

const courseProgressSchema = z.object({
	progressPercent: z.number(),
	lessons: z.array(lessonProgressSchema),
});

export { lessonProgressSchema, courseProgressSchema };
```

`z.object()` silently drops the response fields not declared here
(`id`, `userId`, `courseId`, `startedAt`, `completedAt`,
`watchedSeconds`, `lastWatchedAt`) — same behavior the existing
`course-details.schema.ts` already relies on for its own trimmed fields,
not something new to this file.

### `api/get-course-progress.ts`

```ts
import { apiFetch } from '@/lib/http/api-client';
import { courseProgressSchema } from '@/features/catalog/schemas/course-progress.schema';
import type { CourseProgress } from '@/features/catalog/model/course-progress';

async function getCourseProgress(courseId: string): Promise<CourseProgress> {
	const data = await apiFetch(`/api/progress/courses/${courseId}`);
	return courseProgressSchema.parse(data);
}

export { getCourseProgress };
```

### `api/register-lesson-progress.ts`

```ts
import { apiFetch } from '@/lib/http/api-client';

type RegisterLessonProgressInput = {
	lessonId: string;
	watchedSeconds: number;
};

async function registerLessonProgress(
	input: RegisterLessonProgressInput,
): Promise<void> {
	await apiFetch('/api/progress/lessons', {
		method: 'POST',
		body: { lessonId: input.lessonId, watchedSeconds: input.watchedSeconds },
	});
}

export { registerLessonProgress };
```

The response body (`LessonProgressResponse`, `200`) is intentionally not
parsed or used — per the spec, the source of truth after this call is a
refetch of `GET /api/progress/courses/{courseId}`, not this response.
`markAsCompleted` is deliberately never sent — see
`Docs/backend-pendencies/catalog/lesson-player.md`, it's a dead field on
the backend.

### `hooks/catalog.queries.ts` (add)

```ts
function useCourseProgressQuery(courseId: string, options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.progress.course(courseId),
		queryFn: () => getCourseProgress(courseId),
		enabled: options.enabled && courseId.length > 0,
	});
}

function useRegisterLessonProgressMutation() {
	return useMutation({
		mutationFn: registerLessonProgress,
	});
}
```

This is the first mutation in the app that invalidates a query on
success (register/login/confirm-email's mutations never do — they redirect
instead). That invalidation call (`queryClient.invalidateQueries`) lives in
`lesson-player-page.tsx`, not the hook itself, matching how every other
`onSuccess`/`onError` branch in this codebase is handled at the call site
(`confirm-email-form.tsx`), not baked into the hook.

### `lib/lesson-sequence.ts`

```ts
import type {
	CourseDetails,
	CourseModule,
	Lesson,
} from '@/features/catalog/model/course-details';

type LessonLocation = {
	module: CourseModule;
	modulePosition: number; // 1-based, by array order — same simplification
	lesson: Lesson; // ModuleCard already makes (render order, not displayOrder value)
	lessonPosition: number; // 1-based, within the module
};

function findLessonById(
	details: CourseDetails,
	lessonId: string,
): LessonLocation | undefined {
	for (let index = 0; index < details.modules.length; index += 1) {
		const module = details.modules[index]!;
		const lessonIndex = module.lessons.findIndex(
			(lesson) => lesson.id === lessonId,
		);

		if (lessonIndex !== -1) {
			return {
				module,
				modulePosition: index + 1,
				lesson: module.lessons[lessonIndex]!,
				lessonPosition: lessonIndex + 1,
			};
		}
	}

	return undefined;
}

function flattenLessons(details: CourseDetails): Lesson[] {
	return details.modules.flatMap((module) => module.lessons);
}

function findNextLessonId(
	details: CourseDetails,
	currentLessonId: string,
): string | undefined {
	const flat = flattenLessons(details);
	const index = flat.findIndex((lesson) => lesson.id === currentLessonId);

	if (index === -1 || index === flat.length - 1) {
		return undefined;
	}

	return flat[index + 1]!.id;
}

export { findLessonById, findNextLessonId };
```

### Components

- **`lesson-player-page.tsx`**: `useRequireAuth()`; once ready,
  `useCourseCatalogQuery({ enabled: ready })` → `findCourseBySlug` (reused
  from `lib/find-course.ts`, same as `course-detail-page.tsx`). Branches:
  1. Not ready / catalog pending → same placeholder/"Carregando…" states
     already used by `course-detail-page.tsx`.
  2. Catalog error → `401` redirects (effect); otherwise the same
     retry-button error state.
  3. No course matches the slug → not-found state, link back to
     `appRoutes.catalog.index` (same copy as `course-detail-page.tsx`).
  4. Course found, `course.hasAccess === false` → **effect**-driven
     redirect to `appRoutes.courses.detail(slug)` (mirrors the existing
     `401`-redirect effect pattern — a render-time redirect would violate
     the same rule that pattern already works around). Render the blank
     `min-h-screen` placeholder while the effect fires.
  5. Course found, `hasAccess: true` →
     `useCourseDetailsQuery(course.id, { enabled: true })` and
     `useCourseProgressQuery(course.id, { enabled: true })`, in parallel.
     - `detailsQuery` pending → the same "Carregando…" state.
     - `detailsQuery` error → **not covered by the spec** (which only
       specs this for `course-detail-page.tsx`); this plan's call: treat
       it the same as `hasAccess: false` (redirect to
       `appRoutes.courses.detail(slug)`) since this page has no locked
       view of its own to fall back to, and the course detail page already
       knows how to present that state. Noted here explicitly since it's
       an inference, not a literal spec line.
     - `detailsQuery` success, `findLessonById(details, lessonId)` returns
       `undefined` → not-found state ("Aula não encontrada", link back to
       `appRoutes.courses.detail(slug)`).
     - Found → render the page (see layout below). `progressQuery`'s own
       pending/error state is handled locally by what it feeds (see
       "Progress-fetch failure handling" below), not by blocking the whole
       page — the lesson content itself doesn't depend on progress data.
- **Page layout** (top to bottom):
  - Top bar: `← {course.title}` linking to
    `appRoutes.courses.detail(slug)`; on the right, the course-level
    percent + thin bar — see "Progress-fetch failure handling" for what
    renders when `progressQuery` isn't in a success state.
  - Two-column body (`grid-cols-[1fr_360px]`, matching the mockup):
    - Left: `<LessonVideoPlaceholder />`, then directly below it the
      "Marcar aula como assistida" button (lives in the page component
      itself, not extracted — it owns the mutation + elapsed-time ref, the
      same reasoning that's kept `course-detail-page.tsx`'s branching
      un-extracted). Below that: eyebrow "Módulo 0{modulePosition} · Aula
      0{lessonPosition}", `<h1>{lesson.title}</h1>`,
      `<p>{lesson.description}</p>`, and — if a next lesson exists — a
      "Próxima aula →" pill linking to
      `appRoutes.courses.lesson(slug, nextLessonId)`. Below that, the
      `<LessonTabs>` row (Material / Anotações / Perguntas) — see "Notes
      & Questions tabs" below.
  - Right: `<LessonSidebar>` — every module/lesson, real progress, no
    duration, current lesson highlighted; footer line "A aula é marcada
    como concluída quando você assiste 90% do vídeo." (static copy, real
    number — matches `ProgressOptions.LessonCompletionThresholdPercent`'s
    default, same fact already called out in the spec).
- **`lesson-video-placeholder.tsx`**: purely presentational, no hooks —
  the same striped-background treatment already used for course/module
  cover placeholders (`repeating-linear-gradient`), `aspect-video`, and a
  centered, static, non-interactive label (e.g. a muted film-strip glyph +
  "Player em breve" caption) — no play icon, no scrubber, no timestamp,
  nothing that implies a control that does something. This is what makes
  the acceptance criterion ("no button that looks like it plays something
  it can't") checkable in a unit test.
- **`lesson-sidebar.tsx`**: props `{ details: CourseDetails; progress:
  CourseProgress | undefined; currentLessonId: string; slug: string }`.
  Renders "Conteúdo" eyebrow, then per module: "0{position} · {module
  .title}", then each lesson as a `<Link href={appRoutes.courses.lesson
  (slug, lesson.id)}>` row with a leading status glyph:
  - `lesson.id === currentLessonId` → outlined accent-blue circle with a
    small "▶" glyph, highlighted row background (mirrors the mockup's
    current-lesson treatment).
  - else, `progress?.lessons.find((l) => l.lessonId === lesson.id)
    ?.completed` → filled accent-blue circle with "✓".
  - else → plain outlined circle, empty.
  No duration anywhere in this component — the mockup's "14:20" per row
  has nothing behind it (see the pendency file).
- **`module-card.tsx`** (changed): gains a `slug: string` prop. Wrapped in
  `<Link href={appRoutes.courses.lesson(slug, module.lessons[0].id)}>`
  when `module.lessons.length > 0`; renders exactly as before (a plain
  `<div>`, no link) when it's empty — a module with zero lessons has
  nowhere to send the visitor, same "don't invent a destination" principle
  used everywhere else in this app.
- **`course-detail-owned.tsx`** (changed): gains a `slug: string` prop
  (the caller already has `course.slug` — no new data fetch), passes it
  through to each `<ModuleCard>`.

## Notes & Questions tabs

Two independent read/write resources, both keyed by `lessonId` alone (not
`courseId`) — matching the routes themselves
(`/api/notes/lessons/{lessonId}`, `/api/questions/lessons/{lessonId}`).
Still `src/features/catalog/`, same reasoning as progress above.

### `model/lesson-note.ts`

```ts
type LessonNote = {
	content: string;
};

export type { LessonNote };
```

Trimmed the same way `course-progress.ts` was: `LessonNoteResponse` also
carries `id`, `userId`, `lessonId`, `createdAt`, `updatedAt` — none of them
render anywhere on this tab.

### `model/lesson-question.ts`

```ts
type LessonQuestion = {
	id: string;
	askedByName: string;
	questionText: string;
	answerText: string | null;
	answeredByName: string | null;
	createdAt: string;
};

export type { LessonQuestion };
```

Drops `lessonId`, `askedByUserId`, `answeredByUserId`, `answeredAt`,
`updatedAt` — this screen never answers/deletes, so there's nothing to key
off those ids, and `createdAt` alone is enough for the "oldest first" order
(already the server's own order — see below).

### `schemas/lesson-note.schema.ts` / `schemas/lesson-question.schema.ts`

```ts
const lessonNoteSchema = z.object({ content: z.string() });

const lessonQuestionSchema = z.object({
	id: z.string(),
	askedByName: z.string(),
	questionText: z.string(),
	answerText: z.string().nullable(),
	answeredByName: z.string().nullable(),
	createdAt: z.string(),
});
```

### `api/`

```ts
// get-lesson-note.ts
async function getLessonNote(lessonId: string): Promise<LessonNote> {
	const data = await apiFetch(`/api/notes/lessons/${lessonId}`);
	return lessonNoteSchema.parse(data);
}

// save-lesson-note.ts
async function saveLessonNote(input: {
	lessonId: string;
	content: string;
}): Promise<LessonNote> {
	const data = await apiFetch(`/api/notes/lessons/${input.lessonId}`, {
		method: 'PUT',
		body: { content: input.content },
	});
	return lessonNoteSchema.parse(data);
}

// remove-lesson-note.ts
async function removeLessonNote(lessonId: string): Promise<void> {
	await apiFetch(`/api/notes/lessons/${lessonId}`, { method: 'DELETE' });
}

// get-lesson-questions.ts
async function getLessonQuestions(
	lessonId: string,
): Promise<LessonQuestion[]> {
	const data = await apiFetch(`/api/questions/lessons/${lessonId}`);
	return z.array(lessonQuestionSchema).parse(data);
}

// ask-lesson-question.ts
async function askLessonQuestion(input: {
	lessonId: string;
	questionText: string;
}): Promise<LessonQuestion> {
	const data = await apiFetch(`/api/questions/lessons/${input.lessonId}`, {
		method: 'POST',
		body: { questionText: input.questionText },
	});
	return lessonQuestionSchema.parse(data);
}
```

`getLessonNote`'s 404 is not caught here — same precedent as
`admin.queries.ts`'s lesson-video query (`lesson-editor-page.tsx` checks
`videoQuery.error.status === 404` at the call site, the query function
itself just lets `apiFetch` throw). `lesson-player-page.tsx` does the same:
`noteQuery.isError && isApiError(noteQuery.error) && noteQuery.error.status
=== 404` means "no note yet," anything else is a real error.

### `queryKeys` addition

```ts
lessons: {
	note: (lessonId: string) => ['lessons', lessonId, 'note'] as const,
	questions: (lessonId: string) =>
		['lessons', lessonId, 'questions'] as const,
},
```

New top-level namespace (not nested under `catalog` or `progress` — these
resources aren't keyed by course or tied to progress).

### `hooks/catalog.queries.ts` (add)

```ts
function useLessonNoteQuery(lessonId: string, options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.lessons.note(lessonId),
		queryFn: () => getLessonNote(lessonId),
		enabled: options.enabled && lessonId.length > 0,
	});
}

function useSaveLessonNoteMutation() {
	return useMutation({ mutationFn: saveLessonNote });
}

function useRemoveLessonNoteMutation() {
	return useMutation({ mutationFn: removeLessonNote });
}

function useLessonQuestionsQuery(
	lessonId: string,
	options: { enabled: boolean },
) {
	return useQuery({
		queryKey: queryKeys.lessons.questions(lessonId),
		queryFn: () => getLessonQuestions(lessonId),
		enabled: options.enabled && lessonId.length > 0,
	});
}

function useAskLessonQuestionMutation() {
	return useMutation({ mutationFn: askLessonQuestion });
}
```

### Components

- **`lesson-tabs.tsx`**: presentational tab-bar shell — props
  `{ active: 'material' | 'notes' | 'questions'; onSelect: (tab) => void }`,
  renders the three labels (Material / Anotações / Perguntas) with the
  active one underlined (same treatment `AppNav`'s catalog/my-courses links
  already use), and returns its `children` below the bar so the page picks
  which panel to render. Owns no data.
- **`lesson-material-panel.tsx`**: purely presentational, no props beyond
  nothing — a static "Em breve" message, same category as
  `lesson-video-placeholder.tsx` (an honest inert state, not a broken
  empty list). Exists as its own component only so its "no data, no
  fabricated cards" behavior is independently testable.
- **`lesson-note-panel.tsx`**: props
  `{ lessonId: string; enabled: boolean }`. Owns
  `useLessonNoteQuery`/`useSaveLessonNoteMutation`/
  `useRemoveLessonNoteMutation` itself (self-contained, unlike
  `lesson-sidebar.tsx` which receives data as props — there's nothing else
  on the page that needs this note, so there's no reason to lift the
  queries up into `lesson-player-page.tsx`). Local `useState` for the
  textarea value, seeded from the query once it resolves via a `useEffect`
  keyed on `noteQuery.data?.content` (runs once per lesson, since
  `noteQuery.data` is stable after that). Branches:
  - `noteQuery.isPending` → "Carregando…".
  - `noteQuery.isError`, not a 404 → the generic retry-button error state.
  - Otherwise (404 or success) → the textarea + "Salvar" button, plus
    "Limpar" only when `noteQuery.data` exists (a 404 means nothing to
    clear).
  "Salvar" calls `saveLessonNoteMutation.mutate({ lessonId, content })`,
  disabled while `content.trim().length === 0` or the mutation is
  in-flight; on success, `queryClient.setQueryData` with the response
  (cheaper than refetching — the response is already the full note) and
  `toast.success('Nota salva.')` — `sonner` is already a cross-feature
  convention (`profile-page.tsx`, `submit-testimonial-page.tsx`), not
  admin-only, so no new dependency. "Limpar" calls
  `removeLessonNoteMutation.mutate(lessonId)`, on success clears the
  textarea, `queryClient.removeQueries` for this note's key (so a future
  404 renders correctly instead of stale cached content), and
  `toast.success('Nota removida.')`.
- **`lesson-questions-panel.tsx`**: props `{ lessonId: string; enabled:
  boolean }`. Owns `useLessonQuestionsQuery`/`useAskLessonQuestionMutation`.
  Branches: pending → "Carregando…"; error → generic retry state; success
  with an empty array → "Nenhuma pergunta ainda — seja o primeiro.";
  success with items → maps in array order (already oldest-first from the
  backend, per the spec — no client sort) to `lesson-question-item.tsx`.
  Below the list, an ask form (a `<textarea>` + submit button, react-hook-
  form + zod matching every other form in this codebase — schema caps at
  2000 chars, mirroring `QuestionValidationLimits.QuestionTextMaxLength`
  server-side): on submit, `askLessonQuestionMutation.mutate(...)`,
  disables the button while pending, resets the field and
  `queryClient.invalidateQueries({ queryKey: queryKeys.lessons.questions(lessonId) })`
  on success (a refetch, not a cache patch — unlike the note, the new
  question needs to slot into an existing list the client doesn't own the
  ordering guarantees for).
- **`lesson-question-item.tsx`**: purely presentational, props
  `{ question: LessonQuestion }`. Renders the asker's name + question
  text + relative timestamp (`formatRelativeTime`, already shared from
  `@/features/admin/lib/format-relative-time` — reused as-is, not
  duplicated, since it's a generic date-diff formatter with nothing
  admin-specific about it), then, only when `question.answerText` is not
  `null`, an indented "reply" block with the answerer's name + answer text.
  No answer/delete controls — out of scope per the spec's non-goals.

`lesson-player-page.tsx` gains local state for which tab is active
(`const [activeTab, setActiveTab] = useState<'material' | 'notes' |
'questions'>('material')`) plus a second piece of state tracking which
tabs have ever been opened (`const [openedTabs, setOpenedTabs] =
useState<Set<typeof activeTab>>(new Set(['material']))`, adding the newly
selected tab in the `onSelect` handler passed to `<LessonTabs>`). Each
panel's `enabled` prop is `openedTabs.has('notes')` /
`openedTabs.has('questions')` respectively — so a query fires the first
time its tab is opened and, once fired, stays enabled (no refetch storm)
when switching back and forth, per the spec's "only on first mount of a
tab that needs data." Switching lessons resets both `activeTab` (back to
`'material'`) and `openedTabs` (back to `{'material'}`) via the same
`useEffect` keyed on `lessonId` that already resets the watched-seconds
ref below — per the spec, a new lesson has its own note/question state.

## Watched-seconds tracking

Per the spec's explicit non-goal (no background heartbeat), this is
intentionally simple: `lesson-player-page.tsx` keeps
`const enteredAtRef = useRef(Date.now())`, re-initialized whenever
`lessonId` changes (via a `useEffect` keyed on `lessonId` — needed because
"Próxima aula" navigates client-side without remounting the page). On
"Marcar aula como assistida":

```ts
const watchedSeconds = Math.max(
	1,
	Math.floor((Date.now() - enteredAtRef.current) / 1000),
);
registerProgressMutation.mutate(
	{ lessonId, watchedSeconds },
	{
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.progress.course(course.id),
			});
		},
	},
);
```

Button label: "Marcar aula como assistida" (idle) / "Marcando…"
(`registerProgressMutation.isPending`, also disabled then). No third
"done" label — the spec is explicit that a click doesn't get to claim
completion client-side; only the refetched sidebar checkmark does that,
and it might stay unchecked, which is correct.

## Progress-fetch failure handling (a call this plan has to make, beyond the spec)

The spec says the sidebar reflects "real progress data" but doesn't say
what to render if `GET /api/progress/courses/{courseId}` itself fails
(network/`500` — distinct from the documented empty-state, which the
backend already handles gracefully server-side). Inventing a fake 0% here
would misrepresent real state (the account might actually be at 66%).
Decision: on `progressQuery.isError`, omit the top-bar percent/bar
entirely (same conditional-render precedent `course-detail-owned.tsx`
already uses for its stats row — render nothing rather than a wrong
number) and render the sidebar with only the "current lesson" glyph
active (derivable from the route alone), no checkmarks. This degrades the
page instead of blocking it, since the lesson content itself doesn't
depend on progress data.

## Tests

- `lib/lesson-sequence.spec.ts`: `findLessonById` — found in the first
  module, found in a later module, unknown id returns `undefined`, and
  the returned `modulePosition`/`lessonPosition` are correct 1-based
  values. `findNextLessonId` — next lesson within the same module, next
  lesson crossing into the following module, `undefined` on the course's
  last lesson, `undefined` for an unknown current id.
- `components/lesson-sidebar.spec.ts`: renders every module/lesson from a
  fixture with real progress data; the current lesson's row carries the
  "current" marker; a lesson present in `progress.lessons` with
  `completed: true` renders the checkmark; everything else renders the
  plain circle; output contains no duration-shaped text (e.g. no
  `\d+:\d+` pattern) anywhere.
- `components/lesson-video-placeholder.spec.ts`: renders the static
  label; output contains no `<button` and no play-glyph — a regression
  test for the "no button that plays nothing" acceptance criterion.
- `components/module-card.spec.ts` (update, not new): existing "is not a
  link" test becomes "is not a link when the module has no lessons"; add
  a case asserting it **is** an `<a href="/courses/{slug}/lessons/{id}">`
  wrapping the card when `module.lessons.length > 0`, using the first
  lesson's id.
- No spec for `lesson-player-page.tsx` — same `useRouter()`/mutation
  constraint that already excludes `course-detail-page.tsx`,
  `catalog-page.tsx`, `confirm-email-page.tsx` from component tests in
  this repo.
- `components/lesson-material-panel.spec.ts`: renders the "Em breve"
  copy; output contains no file-card-shaped markup and no button — same
  regression-test shape as `lesson-video-placeholder.spec.ts`.
- `components/lesson-question-item.spec.ts`: renders asker name + question
  text + relative time; with `answerText: null` renders no reply block;
  with a non-null `answerText` renders the answerer's name + text.
- No spec for `lesson-tabs.tsx` — trivial prop-driven active-state styling
  with no branching logic worth a regression test.
- No spec for `lesson-note-panel.tsx` / `lesson-questions-panel.tsx` —
  both own queries/mutations directly (no props-only render path to
  test in isolation without mocking `@tanstack/react-query`, which this
  repo doesn't do anywhere else).

## Steps

Steps 1-12 shipped already (video playback, progress, sidebar, watched-
seconds tracking). What follows is the Notes & Questions tabs work added
2026-09-14, picking up from there:

1. Add `appRoutes.courses.lesson` and `queryKeys.progress.course`. — done
2. Add `model/course-progress.ts`, `schemas/course-progress.schema.ts`,
   `api/get-course-progress.ts`, `api/register-lesson-progress.ts`; extend
   `hooks/catalog.queries.ts` with the two new hooks. — done
3. Add `lib/lesson-sequence.ts` with its spec. — done
4. Build `lesson-video-placeholder.tsx` and its spec. — done
5. Build `lesson-sidebar.tsx` and its spec. — done
6. Update `module-card.tsx` (add `slug` prop + conditional link) and its
   spec; update `course-detail-owned.tsx` to pass `slug` through. — done
7. Build `lesson-player-page.tsx` (gate, queries, redirects, layout,
   watched-seconds tracking, mark-as-watched mutation). — done
8. Add `src/app/courses/[slug]/lessons/[lessonId]/page.tsx`. — done
9. **(new)** Add `queryKeys.lessons`; `model/lesson-note.ts`,
   `model/lesson-question.ts`; `schemas/lesson-note.schema.ts`,
   `schemas/lesson-question.schema.ts`; `api/get-lesson-note.ts`,
   `api/save-lesson-note.ts`, `api/remove-lesson-note.ts`,
   `api/get-lesson-questions.ts`, `api/ask-lesson-question.ts`; extend
   `hooks/catalog.queries.ts` with the five new hooks.
10. **(new)** Build `lesson-tabs.tsx`, `lesson-material-panel.tsx` (+
    spec), `lesson-question-item.tsx` (+ spec).
11. **(new)** Build `lesson-note-panel.tsx` and `lesson-questions-panel.tsx`
    (ask form via react-hook-form + zod).
12. **(new)** Wire `activeTab`/`openedTabs` state and `<LessonTabs>` into
    `lesson-player-page.tsx`, reset both on `lessonId` change alongside
    the existing watched-seconds ref reset.
13. Run `npm run test`, `npm run typecheck`, `npm run lint`; fix until
    green (typecheck needs the dev-server-compile-once step for the
    route's `PageProps` type, same as `courses/[slug]/page.tsx` needed).
14. Manually verify in the dev server against a local CourseCore backend,
    logged in as a real account:
    - No stored token → the lesson URL redirects to `/login`.
    - A locked course's lesson URL (typed directly, not clicked) →
      redirects to `/courses/[slug]`, and confirm in the Network tab that
      `GET /api/courses/{id}` is never called (mirrors the check already
      done for `course-detail.md`).
    - An unknown `lessonId` under a real, owned course → not-found state.
    - An owned course with real modules/lessons → click a module card on
      `/courses/[slug]`, land on its first lesson; sidebar shows every
      lesson with no duration; "Marcar aula como assistida" calls the
      real endpoint (confirm in the Network tab) and the sidebar
      checkmark stays unchecked afterward — expected, since none of the
      seeded lessons have an attached video, matching the pendency
      file's documented backend behavior, not a frontend bug.
    - "Próxima aula" navigates client-side to the next lesson in sequence
      and is absent on the course's last lesson.
    - Simulate a `progress` fetch failure (route interception) to verify
      the top-bar percent is omitted and the sidebar falls back to
      current-lesson-only highlighting, per "Progress-fetch failure
      handling" above.
    - **(new)** Open "Anotações" with no existing note → empty textarea,
      no error; type + "Salvar" → success toast, reload the page → the
      saved content is there (confirms `PUT` really persisted); "Limpar"
      → textarea empties, reload → still empty (confirms `DELETE`).
    - **(new)** Open "Perguntas" with none yet → empty-state copy; ask
      one → appears in the list with no answer; open the same lesson in
      a second account with course access → the question is visible
      there too (confirms it's public, not per-user like the note).
    - **(new)** Switch lessons, then back to the first — confirm (Network
      tab) the note/question queries for the first lesson don't refire,
      and the second lesson's tabs start empty/unopened again.
    - **(new)** Confirm the "Material" tab shows only the static "Em
      breve" copy — no empty grid, no broken card.
15. Update `src/features/README.md` and root `README.md`'s "Módulos
    ativos" to mention Notes/Questions.
16. Commit in small, conventional-commit chunks separated by context
    (query-key/model/schema/api/hooks; presentational panels + specs;
    stateful note/question panels; page wiring; docs).
