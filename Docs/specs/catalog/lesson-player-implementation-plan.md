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
      `appRoutes.courses.lesson(slug, nextLessonId)`. No "Material" /
      "Anotações" / "Perguntas" tab row — that's the materials/notes/Q&A
      gap, out of scope per the spec's non-goals.
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

## Steps

1. Add `appRoutes.courses.lesson` and `queryKeys.progress.course`.
2. Add `model/course-progress.ts`, `schemas/course-progress.schema.ts`,
   `api/get-course-progress.ts`, `api/register-lesson-progress.ts`; extend
   `hooks/catalog.queries.ts` with the two new hooks.
3. Add `lib/lesson-sequence.ts` with its spec.
4. Build `lesson-video-placeholder.tsx` and its spec.
5. Build `lesson-sidebar.tsx` and its spec.
6. Update `module-card.tsx` (add `slug` prop + conditional link) and its
   spec; update `course-detail-owned.tsx` to pass `slug` through.
7. Build `lesson-player-page.tsx` (gate, queries, redirects, layout,
   watched-seconds tracking, mark-as-watched mutation).
8. Add `src/app/courses/[slug]/lessons/[lessonId]/page.tsx`.
9. Run `npm run test`, `npm run typecheck`, `npm run lint`; fix until
   green (typecheck needs the dev-server-compile-once step for the new
   route's `PageProps` type, same as `courses/[slug]/page.tsx` needed).
10. Manually verify in the dev server against a local CourseCore backend,
    logged in as a real account:
    - No stored token → the lesson URL redirects to `/login`.
    - A locked course's lesson URL (typed directly, not clicked) →
      redirects to `/courses/[slug]`, and confirm in the Network tab that
      `GET /api/courses/{id}` is never called (mirrors the check already
      done for `course-detail.md`).
    - An unknown `lessonId` under a real, owned course → not-found state.
    - An owned course with real modules/lessons (the seeded "Escola de
      Líderes"/"Amar & Servir" courses from the catalog/detail work) →
      click a module card on `/courses/[slug]`, land on its first lesson;
      sidebar shows every lesson with no duration; "Marcar aula como
      assistida" calls the real endpoint (confirm in the Network tab) and
      the sidebar checkmark stays unchecked afterward — expected, since
      none of the seeded lessons have an attached video, matching the
      pendency file's documented backend behavior, not a frontend bug.
    - "Próxima aula" navigates client-side to the next lesson in sequence
      and is absent on the course's last lesson.
    - Simulate a `progress` fetch failure (route interception) to verify
      the top-bar percent is omitted and the sidebar falls back to
      current-lesson-only highlighting, per "Progress-fetch failure
      handling" above.
11. Update `src/features/README.md` and root `README.md`'s "Módulos
    ativos".
12. Commit in small, conventional-commit chunks separated by context
    (route/query-key constants; model/schema/api/hooks/lib; video
    placeholder + sidebar; module-card/course-detail-owned link change;
    lesson-player-page + app wiring; tests; docs).
