# Course Catalog Page — Implementation Plan

Implements [`course-catalog.md`](course-catalog.md).

## Route constants

`courses` is a new top-level group in `src/lib/routes/app-routes.ts` —
the first *parameterized* route this repo has needed:

```ts
courses: {
	detail: (slug: string) => `/courses/${slug}`,
},
```

No page behind it yet (non-goal per the spec) — same stub treatment
every other not-yet-built destination has gotten.

## Storing the account name

Same pattern as the e-mail addition from the confirm-email work:
`getUserName()`/`setUserName()` join the pair already in
`access-token.ts`, saved by `register-form.tsx`/`login-form.tsx`'s
`onSuccess` (both already call `setAccessToken`/`setUserEmail` — this
adds a third line, `setUserName(data.name)`). `clearAccessToken()`
clears all three keys.

## Query key

First real `useQuery` in this app (everything before this was a
mutation) — `src/lib/constants/query-keys.ts` gets its first entry:

```ts
const queryKeys = {
	catalog: {
		list: ['catalog', 'list'] as const,
	},
} as const;
```

No params — the catalog always fetches everything; filtering is
client-side (see "Filtering").

## New feature slice: `src/features/catalog/`

New domain, not `auth` — matches the spec's own domain folder
(`Docs/specs/catalog/`) and CourseCore's own module boundary.

```text
src/features/catalog/
├── model/
│   └── course-catalog.ts       # AreaSummary, CourseCatalogItem, CourseCatalog
├── schemas/
│   └── course-catalog.schema.ts # zod mirror for the API boundary (not
│                                  # unit-tested — same call as
│                                  # auth-response.schema.ts, a response
│                                  # mirror, not a form)
├── api/
│   └── get-course-catalog.ts    # getCourseCatalog() -> apiFetch GET
├── hooks/
│   └── catalog.queries.ts       # useCourseCatalogQuery()
├── lib/
│   ├── filter-courses.ts        # filterCourses(), groupCoursesByArea()
│   ├── filter-courses.spec.ts
│   ├── user-display.ts          # getInitials(), getDisplayName()
│   └── user-display.spec.ts
└── components/
    ├── catalog-page.tsx         # 'use client': gate + query + filter state
    ├── catalog-nav.tsx          # top app nav (new shell — see spec)
    ├── catalog-page-header.tsx  # H1 + subtitle + area pills + search
    ├── area-section.tsx         # one area: header + horizontal-scroll row
    ├── course-card.tsx          # one course card, both access states
    └── *.spec.ts
```

`src/app/catalog/page.tsx` (new — replaces the stub 404):

```tsx
import { CatalogPage } from '@/features/catalog/components/catalog-page';

export default function Catalog() {
	return <CatalogPage />;
}
```

### `model/course-catalog.ts`

```ts
type AreaSummary = { id: string; name: string; slug: string; displayOrder: number };

type CourseCatalogItem = {
	id: string;
	title: string;
	slug: string;
	description: string;
	thumbnailUrl: string | null;
	displayOrder: number;
	pricingModel: 'Free' | 'Paid';
	areaIds: string[];
	hasAccess: boolean;
};

type CourseCatalog = { areas: AreaSummary[]; courses: CourseCatalogItem[] };
```

### `api/get-course-catalog.ts`

```ts
async function getCourseCatalog(): Promise<CourseCatalog> {
	const data = await apiFetch('/api/courses/available'); // GET is fetch's default method
	return courseCatalogSchema.parse(data);
}
```

### `hooks/catalog.queries.ts`

```ts
function useCourseCatalogQuery(options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.catalog.list,
		queryFn: getCourseCatalog,
		enabled: options.enabled,
	});
}
```

`enabled` is driven by the auth-gate state in `catalog-page.tsx` (see
below) — no point firing the request before confirming a token exists.

### `lib/filter-courses.ts`

```ts
function filterCourses(
	courses: CourseCatalogItem[],
	{ areaId, search }: { areaId: string | null; search: string },
): CourseCatalogItem[] {
	const normalizedSearch = search.trim().toLowerCase();
	return courses.filter((course) => {
		const matchesArea = !areaId || course.areaIds.includes(areaId);
		const matchesSearch =
			!normalizedSearch || course.title.toLowerCase().includes(normalizedSearch);
		return matchesArea && matchesSearch;
	});
}

function groupCoursesByArea(areas: AreaSummary[], courses: CourseCatalogItem[]) {
	return areas
		.map((area) => ({
			area,
			courses: courses.filter((course) => course.areaIds.includes(area.id)),
		}))
		.filter((group) => group.courses.length > 0);
}
```

Selecting an area pill filters down to *only* that area's section
(`areaId` narrows `groupCoursesByArea`'s input via `filterCourses`
first) — not a scroll-to/highlight. The area header's "N cursos →"
control calls the same "select this area" handler the pills use. An
area's course count in its header is always the count of what's actually
rendered there post-filter (so it never disagrees with what's on
screen) — with no filters active, that's just the area's real total.

### `lib/user-display.ts`

```ts
function getInitials(name: string | null): string {
	if (!name) return '';
	const [first, second] = name.trim().split(/\s+/);
	return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase();
}

function getDisplayName(name: string | null): string {
	if (!name) return '';
	return name.trim().split(/\s+/).slice(0, 2).join(' ');
}
```

Kept local to this feature, not `src/lib/` — same "not shared until a
second consumer needs it" call already made for other one-off pieces
(e.g. the auth card shell that never got extracted).

### Components

- **`catalog-page.tsx`**: the only client-data-dependent piece, same
  shape as `confirm-email-page.tsx` — auth gate on mount (missing token
  → `router.replace(appRoutes.auth.login)`; **not** the confirm-email
  gate, catalog is visible unconfirmed per backend rule 9). Once gated,
  owns `useCourseCatalogQuery({ enabled: gate === 'ready' })` and the
  filter state (`selectedAreaId: string | null`, `search: string`).
  Renders `CatalogNav` (name/initials from `getUserName()`), a loading
  state, an error state (network/`500` → message + a "Tentar novamente"
  button calling `query.refetch()`; `401` → same redirect-to-login
  effect pattern as the gate, watched via a second effect on
  `query.isError`/`query.error`), or — once loaded —
  `CatalogPageHeader` + one `AreaSection` per
  `groupCoursesByArea(filterCourses(...))` entry.
- **`catalog-nav.tsx`**: brand mark, "Catálogo" (current — styled
  active, not a real link target change since it *is* this page),
  "Meus cursos"/"Certificados" as inert text (matches the landing
  header's placeholder-nav treatment), display name + initials avatar.
- **`catalog-page-header.tsx`**: H1, the real-count subtitle, the pill
  row (`"Todas as áreas"` clears `selectedAreaId`; one pill per area),
  the search input. Controlled by props from `catalog-page.tsx`
  (`areas`, `selectedAreaId`, `onSelectArea`, `search`, `onSearchChange`,
  `courseCount`, `areaCount`).
- **`area-section.tsx`**: eyebrow ("Área 0N" from the area's position
  in the list, 1-indexed), name, the count/"→" control, and the
  horizontally scrollable course row (`overflow-x-auto`, a trailing
  CSS mask gradient reproducing the mockup's fade hint — no carousel
  JS/controls, native scroll only).
- **`course-card.tsx`**: wraps the whole card in a `Link` to
  `appRoutes.courses.detail(course.slug)`. Cover: `course.thumbnailUrl`
  rendered via a plain `<img>` if present (not `next/image` — the media
  host isn't configured in `next.config.ts`'s remote patterns yet, and
  no seeded course in this dev environment has one to test against;
  revisit if that becomes real), else the same striped placeholder
  pattern used everywhere else in this app. Below: avatar (brand mark
  placeholder, matching every other card so far — no instructor concept
  exists), title, `{area name} · {description}` (the spec's stand-in for
  the module/status line the API can't provide) clamped to 2 lines
  (`line-clamp-2`), the access-state badge (see spec's "Access states"
  — "Gratuito"/"Pago" or nothing), inert "⋮". `hasAccess: false` cards
  get `opacity-55` on the whole card, matching the mockup's one locked
  example.

## Tests

- `lib/filter-courses.spec.ts`: `filterCourses` — no filters returns
  everything; `areaId` narrows to that area only; `search` matches
  case-insensitively on title substrings; both combined. `groupCoursesByArea`
  — areas with zero matching courses are dropped from the result.
- `lib/user-display.spec.ts`: `getInitials`/`getDisplayName` — two-word
  name, three-word name (only first two count), single word, `null`.
- `components/course-card.spec.ts`: renders via `renderToStaticMarkup`
  (confirm empirically it doesn't need router context — it only uses
  `next/link`, same as landing's course cards, which worked standalone).
  Asserts the link `href`, the Gratuito/Pago badge text per
  `pricingModel`+`hasAccess` combination, and that an unlocked course
  renders no badge.
- `components/catalog-page-header.spec.ts`: renders the pill list from
  a given `areas` array and the real-count subtitle text.
- No spec for `catalog-page.tsx`/`catalog-nav.tsx`/`area-section.tsx` if
  they end up needing `useRouter()`/other client-only context that
  breaks standalone rendering — same known constraint as
  `register-form.tsx`/`login-form.tsx`, confirmed case by case rather
  than assumed.

## Steps

1. Add the `courses.detail` route.
2. Add `getUserName`/`setUserName` to `access-token.ts`; wire the third
   `setUserName(...)` call into `register-form.tsx`/`login-form.tsx`.
3. Add `queryKeys.catalog.list`.
4. Add `model/course-catalog.ts`, `schemas/course-catalog.schema.ts`,
   `api/get-course-catalog.ts`, `hooks/catalog.queries.ts`.
5. Add `lib/filter-courses.ts` and `lib/user-display.ts` with their specs.
6. Build components bottom-up: `course-card` → `area-section` →
   `catalog-page-header` → `catalog-nav` → `catalog-page`.
7. Add `src/app/catalog/page.tsx`.
8. Add the remaining specs listed above.
9. Run `npm run test`, `npm run typecheck`, `npm run lint`; fix until
   green.
10. Manually verify in the dev server against a local CourseCore
    backend, logged in as a real account: the catalog loads and groups
    correctly by area, area pills and search both filter without a
    network request, a locked course renders dimmed with the right
    badge, a course card navigates to its stub `/courses/[slug]` route,
    and — the one failure mode reachable without special setup — killing
    the backend mid-session and reloading shows the retry state instead
    of a blank page.
11. Update `src/features/README.md` and root `README.md`'s "Módulos
    ativos".
12. Commit in small, conventional-commit chunks separated by context
    (route constant; account-name storage; query-keys entry;
    model/schema/api/hooks/lib; components; app wiring; tests; docs).
