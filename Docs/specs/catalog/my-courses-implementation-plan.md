# My Courses Page — Implementation Plan

Implements [`my-courses.md`](my-courses.md).

## Still the `catalog` feature

Same reasoning every prior plan in this domain has already applied —
this extends `src/features/catalog/`, no new feature folder.

## Route

`src/app/my-courses/page.tsx` (new — a plain static route, no dynamic
segment, unlike every other authenticated page added so far):

```tsx
import { MyCoursesPage } from '@/features/catalog/components/my-courses-page';

export default function MyCourses() {
	return <MyCoursesPage />;
}
```

## `appRoutes` addition

```ts
myCourses: {
	index: '/my-courses',
},
```

## `AppNav` becomes state-aware

Per the spec, both "Catálogo" and "Meus cursos" become real `Link`s with
an `active` prop deciding which one is underlined:

```tsx
type AppNavProps = {
	displayName: string;
	initials: string;
	active: 'catalog' | 'my-courses';
};
```

```tsx
<nav className="hidden items-center gap-7 font-sans text-[13px] sm:flex">
	<Link
		href={appRoutes.catalog.index}
		className={cn(
			'pb-0.5',
			active === 'catalog'
				? 'border-b border-[#f2f2f0] text-[#f2f2f0]'
				: 'text-white/50',
		)}
	>
		Catálogo
	</Link>
	<Link
		href={appRoutes.myCourses.index}
		className={cn(
			'pb-0.5',
			active === 'my-courses'
				? 'border-b border-[#f2f2f0] text-[#f2f2f0]'
				: 'text-white/50',
		)}
	>
		Meus cursos
	</Link>
	<span className="text-white/50">Certificados</span>
</nav>
```

Every existing caller adds `active="catalog"`: `catalog-page.tsx`,
`course-detail-page.tsx`, `lesson-player-page.tsx` — matches current
behavior exactly (all three already render "Catálogo" underlined today),
so this is a mechanical prop addition, not a behavior change for them.
`my-courses-page.tsx` is the only caller passing `active="my-courses"`.

Add `src/components/app-nav.spec.ts`: renders both nav items as real
`<a href>`s; `active="catalog"` puts the underline class on "Catálogo"
only, `active="my-courses"` puts it on "Meus cursos" only — the first
test coverage `AppNav` has had, worth it now that it has a real branch.

## Extending the course-progress model

`LessonProgress` gains `lastWatchedAt` — needed here for hero selection
and sort order, not read by any current consumer
(`lesson-sidebar.tsx`/`lesson-player-page.tsx` only ever read
`completed`), so this is a pure addition, nothing else changes:

```ts
type LessonProgress = {
	lessonId: string;
	completed: boolean;
	lastWatchedAt: string;
};
```

Same one-line addition to `courseProgressSchema`'s
`lessonProgressSchema` (`lastWatchedAt: z.string()`).

## `lib/lesson-sequence.ts`: add `findCurrentLesson`

The "first lesson not yet completed" walk both the hero and every active
card need, reusing the same flattening `findNextLessonId` already does
internally:

```ts
function findCurrentLesson(
	details: CourseDetails,
	progress: CourseProgress,
): LessonLocation | undefined {
	const completedIds = new Set(
		progress.lessons.filter((entry) => entry.completed).map((entry) => entry.lessonId),
	);
	const flat = flattenLessons(details);
	const current = flat.find((lesson) => !completedIds.has(lesson.id));

	return current ? findLessonById(details, current.id) : undefined;
}
```

Returns `undefined` when every lesson is completed (the 100% case,
handled separately - see below) or the course has zero lessons at all
(an edge case no other screen has had to consider either, since course
creation with zero lessons is possible on the backend but never
seeded/tested against so far).

## `lib/my-courses.ts` (new)

The card-state, sort, and hero logic - kept as pure functions, not
inlined in the page component, so each is independently testable
against fixtures instead of through `useQueries` mocking.

```ts
type CourseCardState =
	| { kind: 'completed'; moduleCount: number; lessonId: string | undefined }
	| {
			kind: 'active';
			percent: number;
			modulePosition: number;
			lessonTitle: string;
			lessonId: string | undefined;
	  };

function computeCardState(
	details: CourseDetails,
	progress: CourseProgress,
): CourseCardState {
	if (progress.progressPercent === 100) {
		return {
			kind: 'completed',
			moduleCount: details.modules.length,
			lessonId: details.modules[0]?.lessons[0]?.id,
		};
	}

	const current = findCurrentLesson(details, progress);
	return {
		kind: 'active',
		percent: progress.progressPercent,
		modulePosition: current?.modulePosition ?? 1,
		lessonTitle: current?.lesson.title ?? '',
		lessonId: current?.lesson.id ?? details.modules[0]?.lessons[0]?.id,
	};
}

function latestWatchedAt(progress: CourseProgress): string | undefined {
	return progress.lessons.reduce<string | undefined>((latest, entry) => {
		return !latest || entry.lastWatchedAt > latest ? entry.lastWatchedAt : latest;
	}, undefined);
}

type OwnedCourseEntry = {
	course: CourseCatalogItem;
	areaName: string | null;
	details: CourseDetails;
	progress: CourseProgress;
};

function sortOwnedCourses(entries: OwnedCourseEntry[]): OwnedCourseEntry[] {
	return [...entries].sort((a, b) => {
		const aWatched = latestWatchedAt(a.progress);
		const bWatched = latestWatchedAt(b.progress);

		if (aWatched && bWatched) return bWatched.localeCompare(aWatched);
		if (aWatched) return -1;
		if (bWatched) return 1;
		return a.course.displayOrder - b.course.displayOrder;
	});
}

function pickHeroEntry(entries: OwnedCourseEntry[]): OwnedCourseEntry | undefined {
	const inProgress = entries.filter(
		(entry) =>
			entry.progress.progressPercent > 0 && entry.progress.progressPercent < 100,
	);

	if (inProgress.length === 0) {
		return undefined;
	}

	return inProgress.reduce((latest, entry) =>
		(latestWatchedAt(entry.progress) ?? '') > (latestWatchedAt(latest.progress) ?? '')
			? entry
			: latest,
	);
}
```

`latestWatchedAt`'s string comparison relies on the backend serializing
`DateTime` as round-trip ISO-8601 UTC (`2026-09-04T14:16:50.607946Z`) -
already true of every timestamp this app has seen from CourseCore so
far, confirmed again while reading `CourseProgressResponse`/
`LessonProgressResponse` for this plan; lexicographic order matches
chronological order for that format.

## A call this plan has to make, beyond the spec: the cover badge

The spec's "Card states" section doesn't dictate what (if anything)
renders as the small badge on a card's cover image - the mockup shows
"24 aulas · 7h" there for the completed card and a time-remaining figure
("12min restantes") for the two in-progress ones. Decision: the
completed card's cover shows "`{lessonCount}` aulas" (real - summed from
`details.modules`), dropping only the duration half; in-progress/
not-started cards show no cover badge at all rather than inventing a
replacement for the time-remaining figure - the percent is already
communicated by the cover's own progress bar and the status line below
it, so nothing is lost by not duplicating it there.

## `hooks/catalog.queries.ts` (add)

```ts
function useOwnedCourseDetailsQueries(
	courseIds: string[],
	options: { enabled: boolean },
) {
	return useQueries({
		queries: courseIds.map((courseId) => ({
			queryKey: queryKeys.catalog.detail(courseId),
			queryFn: () => getCourseDetails(courseId),
			enabled: options.enabled,
		})),
	});
}

function useOwnedCourseProgressQueries(
	courseIds: string[],
	options: { enabled: boolean },
) {
	return useQueries({
		queries: courseIds.map((courseId) => ({
			queryKey: queryKeys.progress.course(courseId),
			queryFn: () => getCourseProgress(courseId),
			enabled: options.enabled,
		})),
	});
}
```

No new API files - both reuse `getCourseDetails`/`getCourseProgress`,
already built for course-detail/lesson-player. `useQueries` (plural,
`@tanstack/react-query`) is new to this codebase - every prior screen
fetched a statically-known set of queries; this is the first one sized
by a previous response.

## Components

```text
src/features/catalog/components/
├── my-courses-page.tsx     # 'use client': gate + catalog query + owned
│                            # filter + the two useQueries arrays +
│                            # zipping/sorting/hero-picking + branching
├── my-courses-hero.tsx     # + spec
├── owned-course-card.tsx   # + spec
```

- **`my-courses-page.tsx`**: `useRequireAuth()`; `useCourseCatalogQuery
  ({ enabled: ready })`; `ownedCourses = catalogQuery.data?.courses
  .filter((c) => c.hasAccess) ?? []`. `useOwnedCourseDetailsQueries`/
  `useOwnedCourseProgressQueries` over `ownedCourses.map((c) => c.id)`,
  `enabled: ready`. Branches:
  1. Not ready / catalog pending → same placeholder/"Carregando…" states
     every other screen in this feature already uses.
  2. Catalog error → `401` redirects (effect); otherwise the retry-button
     error state.
  3. Catalog loaded, `ownedCourses.length === 0` → empty state (message +
     link to `/catalog`).
  4. Otherwise: zip `ownedCourses[i]` with `detailsResults[i].data` and
     `progressResults[i].data` (both indexed identically to
     `ownedCourses` - `useQueries` preserves order) and
     `findPrimaryAreaName(catalogQuery.data.areas, course)` (existing
     helper, reused as-is). An index whose pair hasn't both resolved yet
     renders `<OwnedCourseCard state={{ kind: 'loading' }} .../>`
     (cover + title only, from the catalog data already in hand);
     resolved ones get `computeCardState(details, progress)`.
     Resolved entries feed `sortOwnedCourses` and `pickHeroEntry`; the
     header's "N inscritos · M concluídos" counts `ownedCourses.length`
     and the resolved entries with `kind: 'completed'` - a course still
     loading doesn't count toward "concluídos" yet, a small, temporary
     undercount no worse than the "Carregando conteúdo…" gap
     `course-detail-owned.tsx` already accepts while its own single
     details call is in flight.
- **`my-courses-hero.tsx`**: props `{ course, areaName, entry: Extract
  <CourseCardState, {kind:'active'}>, slug }`. "Em andamento" eyebrow,
  course title, "Módulo 0{modulePosition} · {lessonTitle}" (no "restam
  Xmin" - dropped, same as the per-card badge decision above), a real
  progress bar + `{percent}%`, "Retomar aula" linking to
  `appRoutes.courses.lesson(slug, lessonId)` - absent (not disabled) if
  `lessonId` is `undefined` (the zero-lessons edge case).
- **`owned-course-card.tsx`**: props `{ course, areaName, slug, state:
  CourseCardState | { kind: 'loading' } }`. Cover (striped placeholder,
  matching every other card in this app) with the lesson-count badge
  only for `kind: 'completed'` and a bottom progress bar for
  `'completed'`/`'active'` (100% or real percent respectively - none for
  `'loading'`). Below: avatar + title, then per kind:
  - `'completed'`: `"{areaName} · {moduleCount} módulos"`, status line
    `"100% concluído · rever"`.
  - `'active'`: `"{areaName} · Módulo 0{modulePosition}"` then
    `{lessonTitle}` on its own line, status line `"{percent}% concluído
    · {percent === 0 ? 'começar' : 'continuar'}"`.
  - `'loading'`: title only, no status line.
  Wrapped in a `Link` to `appRoutes.courses.lesson(slug, lessonId)` only
  when `lessonId` is defined (same "no lessons → no link" rule
  `module-card.tsx` already established); inert otherwise. Inert "⋮",
  same treatment `course-card.tsx` already gives it.

## Tests

- `lib/lesson-sequence.spec.ts` (extend): `findCurrentLesson` - first
  lesson when nothing's completed, a later lesson when earlier ones are
  completed, `undefined` when every lesson is completed.
- `lib/my-courses.spec.ts` (new): `computeCardState` - 100% returns
  `'completed'` with the real module count; 0% and partial both return
  `'active'` with the right `modulePosition`/`lessonTitle`/`percent`.
  `latestWatchedAt` - picks the max timestamp, `undefined` for a course
  with no progress rows. `sortOwnedCourses` - two touched courses order
  by recency, a touched course sorts before an untouched one regardless
  of `displayOrder`, two untouched courses order by `displayOrder`.
  `pickHeroEntry` - picks the most recently watched among strictly
  in-progress entries, excludes 0% and 100% entries, `undefined` when
  none qualify.
- `components/owned-course-card.spec.ts`: renders the right meta/status
  lines per `kind`; is a link only when `lessonId` is defined; contains
  no duration-shaped text (`\d+:\d{2}` or "restam"/"restantes") anywhere,
  matching the standing rule from `lesson-sidebar.spec.ts`.
- `components/my-courses-hero.spec.ts`: renders module/lesson-title
  eyebrow, real percent, links to the given lesson.
- `src/components/app-nav.spec.ts` (new, see "AppNav" above).
- No spec for `my-courses-page.tsx` - same `useRouter()`/multi-query
  constraint already excluding every other `*-page.tsx` in this feature.

## Steps

1. Add `appRoutes.myCourses.index`.
2. Add `lastWatchedAt` to `LessonProgress`/`lessonProgressSchema`.
3. Add `findCurrentLesson` to `lib/lesson-sequence.ts`; extend its spec.
4. Add `lib/my-courses.ts` with its spec.
5. Add `useOwnedCourseDetailsQueries`/`useOwnedCourseProgressQueries` to
   `hooks/catalog.queries.ts`.
6. Update `AppNav` (active prop, real links); add its spec; update the
   three existing callers to pass `active="catalog"`.
7. Build `owned-course-card.tsx` and `my-courses-hero.tsx` with specs.
8. Build `my-courses-page.tsx`.
9. Add `src/app/my-courses/page.tsx`.
10. Run `npm run test`, `npm run typecheck`, `npm run lint`; fix until
    green.
11. Manually verify in the dev server against a local CourseCore
    backend, logged in as a real, email-confirmed account:
    - No stored token → `/my-courses` redirects to `/login`.
    - An account with zero owned courses → empty state, link to
      `/catalog` works.
    - An account owning a mix of not-started, in-progress, and (mark a
      course fully watched first, via the lesson player, to produce
      this state) 100%-complete courses → correct card variant, real
      counts in the header, hero card present and pointing at the
      right lesson, "Retomar aula" and each card's link land on the
      lesson the sidebar/current-lesson logic says they should.
    - Sort order matches "most recently active first, untouched courses
      by displayOrder last" by watching lessons in a specific order
      across courses and confirming the grid re-sorts accordingly.
    - "Meus cursos" renders underlined only on this page; re-verify
      "Catálogo" still renders underlined on `/catalog`,
      `/courses/[slug]`, and the lesson player after the `AppNav` prop
      change.
12. Update `src/features/README.md` and root `README.md`'s "Módulos
    ativos".
13. Commit in small, conventional-commit chunks separated by context
    (route constant; progress model field; lesson-sequence addition;
    my-courses lib; query hooks; AppNav state-awareness; card/hero
    components; page + app wiring; docs).
