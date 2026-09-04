# Course Detail Page — Implementation Plan

Implements [`course-detail.md`](course-detail.md).

## Promoting the authenticated nav to a shared component

The spec's decision to reuse `/catalog`'s nav here — rather than
reproduce the mockup's slightly different one — makes this the second
real consumer of `catalog-nav.tsx`. Per the reasoning already applied
elsewhere in this repo (nothing gets extracted until a second screen
actually needs it), this is that moment:

- Move `src/features/catalog/components/catalog-nav.tsx` →
  `src/components/app-nav.tsx`, renamed `CatalogNav` → `AppNav` (it's no
  longer catalog-specific). Same props (`displayName`, `initials`).
- Update `catalog-page.tsx`'s import.

## Extracting the auth gate

`catalog-page.tsx` and `confirm-email-page.tsx` each already have their
own copy of the same effect: read `getAccessToken()`, redirect to
`/login` if missing, otherwise flip a `'checking' → 'ready'` state (with
the `eslint-disable` for `react-hooks/set-state-in-effect`, justified
the same way both times). `course-detail-page.tsx` needs the identical
check a third time — this is the point where copying it again stops
being the simpler option:

```ts
// src/lib/auth/use-require-auth.ts
'use client';

function useRequireAuth() {
	const router = useRouter();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!getAccessToken()) {
			router.replace(appRoutes.auth.login);
			return;
		}
		// (same SSR/hydration justification as before)
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setReady(true);
	}, [router]);

	return ready;
}
```

`catalog-page.tsx` and `confirm-email-page.tsx` both switch to it,
dropping their inline effects. Neither page's *behavior* changes —
`getUserEmail()`/`getUserName()` move from "read once into gate state"
to "read directly in the render body once `ready` is true" (a plain
synchronous `localStorage` read, safe post-gate, no need to box it in
state). This has no automated coverage (same `useRouter()` constraint
that's kept `catalog-page.tsx`/`confirm-email-page.tsx` untested all
along), so re-verify both pages manually alongside the new one.

## Extending `src/features/catalog/`

Same feature, not a new one — this is still the backend's Courses
module.

```text
src/features/catalog/
├── model/
│   └── course-details.ts        # CourseModule, Lesson, CourseDetails
├── schemas/
│   └── course-details.schema.ts # mirrors GET /api/courses/{id}
├── api/
│   └── get-course-details.ts
├── hooks/
│   └── catalog.queries.ts       # add useCourseDetailsQuery()
├── lib/
│   ├── find-course.ts           # findCourseBySlug(), findPrimaryAreaName()
│   └── find-course.spec.ts
└── components/
    ├── course-detail-page.tsx   # 'use client': gate + catalog lookup +
    │                              # conditional details query + branching
    ├── course-detail-locked.tsx
    ├── course-detail-owned.tsx
    ├── module-card.tsx
    └── *.spec.ts
```

`src/app/courses/[slug]/page.tsx` (new — this repo's first dynamic
route):

```tsx
export default async function CourseDetail({
	params,
}: PageProps<'/courses/[slug]'>) {
	const { slug } = await params;
	return <CourseDetailPage slug={slug} />;
}
```

`PageProps<'/courses/[slug]'>` is the same generated-helper convention
`layout.tsx` already uses (`LayoutProps<'/'>`) — confirmed against
`node_modules/next/dist/docs/.../dynamic-routes.md` rather than assumed,
per CLAUDE.md's "this is not the Next.js you know" note. `params` is a
`Promise` in this version; the async server wrapper awaits it once and
hands the plain `slug` string down, same thin-wrapper shape every other
route in this repo already uses.

### `model/course-details.ts`

```ts
type Lesson = {
	id: string;
	title: string;
	description: string;
	displayOrder: number;
	freePreview: boolean; // present in the type because it's really in
	// the DTO — not used in any component. See spec's "unenforced field".
	published: boolean;
};

type CourseModule = {
	id: string;
	title: string;
	description: string;
	displayOrder: number;
	published: boolean;
	lessons: Lesson[];
};

type CourseDetails = {
	id: string;
	title: string;
	slug: string;
	description: string;
	thumbnailUrl: string | null;
	pricingModel: 'Free' | 'Paid';
	areaIds: string[];
	modules: CourseModule[];
};
```

Trimmed to the fields this page actually reads (drops `published`,
`displayOrder`, `publishedAt`, `createdAt`, `updatedAt` off the course
itself — `Published`/`DisplayOrder` stay on modules/lessons since those
matter for what to render) — the same DTO the schema mirrors has more
fields than this; add them here if a later page needs them.

### `api/get-course-details.ts`

```ts
async function getCourseDetails(courseId: string): Promise<CourseDetails> {
	const data = await apiFetch(`/api/courses/${courseId}`);
	return courseDetailsSchema.parse(data);
}
```

### `hooks/catalog.queries.ts` (add)

```ts
function useCourseDetailsQuery(courseId: string, options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.catalog.detail(courseId),
		queryFn: () => getCourseDetails(courseId),
		enabled: options.enabled && courseId.length > 0,
	});
}
```

`queryKeys.catalog.detail(courseId)` is a new parameterized entry next
to `list`.

### `lib/find-course.ts`

```ts
function findCourseBySlug(courses: CourseCatalogItem[], slug: string) {
	return courses.find((course) => course.slug === slug);
}

function findPrimaryAreaName(areas: AreaSummary[], course: CourseCatalogItem) {
	return areas.find((area) => course.areaIds.includes(area.id))?.name ?? null;
}
```

A course can belong to more than one area (`areaIds` is an array); the
mockup only ever shows one eyebrow, so this takes the first match — a
real simplification worth naming here, not hidden in the implementation.

### Components

- **`course-detail-page.tsx`**: `useRequireAuth()`; once ready,
  `useCourseCatalogQuery({ enabled: ready })`, then `findCourseBySlug`
  against its `data.courses`. Branches, in order:
  1. Not ready → same blank `min-h-screen` placeholder every gated page
     returns.
  2. Catalog query pending → the same "Carregando…" state `/catalog`
     uses.
  3. Catalog query error → `401` redirects (effect, same pattern as
     `catalog-page.tsx`); otherwise the same retry-button error state.
  4. Catalog loaded, no course matches the slug → not-found state, a
     message plus a link back to `appRoutes.catalog.index`.
  5. Course found, `hasAccess: false` → `<CourseDetailLocked course=.../>`.
     `useCourseDetailsQuery` is called with `enabled: false` in this
     branch (never fires — the point of the split, not an incidental
     detail).
  6. Course found, `hasAccess: true` →
     `useCourseDetailsQuery(course.id, { enabled: true })`; while it's
     pending, render `<CourseDetailOwned>` with a loading module section
     (title/description/area already available from the catalog match,
     so the page doesn't sit on a blank screen waiting); on **success**,
     the full owned view; on **error**, fall back to
     `<CourseDetailLocked>` per the spec ("treat like the locked view
     rather than an error page").
- **`course-detail-locked.tsx`**: eyebrow (area name), H1, description,
  a Gratuito/Pago badge (same `accessBadge` logic already in
  `course-card.tsx` — reuse it, don't reimplement), one inert
  "Inscrever-se" button. Single column — the mockup's right-column
  sidebar existed for price/trailer content that isn't real here (see
  spec), so a second column with nothing real to put in it would just
  be empty space wearing a border.
- **`course-detail-owned.tsx`**: eyebrow, H1, description, a stats row
  with exactly two real numbers (`modules.length`, sum of
  `modules[].lessons.length`) — not four, the mockup's other two
  ("12h de vídeo", certificado) have nothing behind them. "Conteúdo do
  curso" heading, then one `ModuleCard` per module.
- **`module-card.tsx`**: "Módulo 0N · X aulas" eyebrow, title,
  description. Not a `Link` — no destination page exists (spec
  non-goal). Same striped-placeholder cover treatment as everywhere
  else in this app.

## Tests

- `lib/find-course.spec.ts`: `findCourseBySlug` — match found, no
  match; `findPrimaryAreaName` — course in a known area, course with an
  area id not present in the areas list (returns `null`, doesn't throw).
- `components/module-card.spec.ts`: renders title and the "Módulo 0N ·
  X aulas" eyebrow with the right numbers; output contains no `<a`
  (confirms it's not accidentally a link).
- `components/course-detail-locked.spec.ts`: Free vs Paid renders the
  right badge text (same cases already covered for `course-card.tsx`,
  applied to this component since it reuses the same badge logic).
- No spec for `course-detail-page.tsx` or `use-require-auth.ts` — both
  need `useRouter()`, the same constraint that already excluded
  `catalog-page.tsx`/`confirm-email-page.tsx`/`register-form.tsx`/
  `login-form.tsx` from component-level tests in this repo.

## Steps

1. Move `catalog-nav.tsx` → `src/components/app-nav.tsx` as `AppNav`;
   update `catalog-page.tsx`'s import.
2. Add `src/lib/auth/use-require-auth.ts`; switch `catalog-page.tsx` and
   `confirm-email-page.tsx` to it.
3. Add `queryKeys.catalog.detail(courseId)`.
4. Add `model/course-details.ts`, `schemas/course-details.schema.ts`,
   `api/get-course-details.ts`; extend `hooks/catalog.queries.ts`.
5. Add `lib/find-course.ts` with its spec.
6. Build components bottom-up: `module-card` → `course-detail-locked` /
   `course-detail-owned` → `course-detail-page`.
7. Add `src/app/courses/[slug]/page.tsx`.
8. Add the remaining specs listed above.
9. Run `npm run test`, `npm run typecheck`, `npm run lint`; fix until
   green.
10. Manually verify in the dev server against a local CourseCore
    backend, logged in as a real account:
    - No stored token → `/courses/anything` redirects to `/login`
      (re-verify `/catalog` and `/confirm-email` still redirect too,
      after the `useRequireAuth()` swap).
    - An unknown slug → not-found state.
    - A locked course (the dev account has no area grants, so every
      real course qualifies) → the locked view, and confirm in the
      Network tab that `GET /api/courses/{id}` is never called.
    - An owned course — the dev database has none to click through
      naturally, so mock the catalog response the same way
      `course-catalog.md`'s plan did, this time also mocking
      `GET /api/courses/{id}` with a real-shaped module list, to verify
      the owned view's stats and module cards render correctly.
11. Update `src/features/README.md` and root `README.md`'s "Módulos
    ativos".
12. Commit in small, conventional-commit chunks separated by context
    (nav promotion; auth-gate extraction; query key; model/schema/api/
    hooks/lib; components; app wiring; tests; docs).
