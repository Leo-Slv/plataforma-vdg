# Landing Page — Implementation Plan (2026-09-08 revision)

Implements the revised [`landing-page.md`](landing-page.md). Supersedes
the original plan's "no HTTP calls" premise — this feature gets `api/`,
`hooks/`, `schemas/`, and new `model/` files for the first time.

## Data layer: `src/features/landing/`

```text
src/features/landing/
├── schemas/
│   ├── public-catalog-summary.schema.ts
│   └── testimonial.schema.ts
├── model/
│   ├── public-catalog-summary.ts
│   └── testimonial.ts
├── api/
│   ├── get-public-catalog-summary.ts   # GET /api/courses/public-summary
│   └── get-public-testimonials.ts      # GET /api/testimonials/public
└── hooks/
    └── landing.queries.ts              # usePublicCatalogSummaryQuery, usePublicTestimonialsQuery
```

### `schemas/public-catalog-summary.schema.ts`

```ts
const publicFeaturedCourseSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	thumbnailUrl: z.string().nullable(),
});

const publicAreaSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	publishedCourseCount: z.number(),
});

const publicCatalogSummarySchema = z.object({
	activeAreaCount: z.number(),
	publishedCourseCount: z.number(),
	featuredCourses: z.array(publicFeaturedCourseSchema),
	highlightedCourse: publicFeaturedCourseSchema.nullable(),
	areas: z.array(publicAreaSummarySchema),
});
```

### `schemas/testimonial.schema.ts`

```ts
const testimonialSchema = z.object({
	id: z.string(),
	authorName: z.string(),
	quote: z.string(),
	avatarUrl: z.string().nullable(),
	courseId: z.string().nullable(),
	published: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
```

### `api/get-public-catalog-summary.ts` / `api/get-public-testimonials.ts`

Same thin-wrapper shape as every other `api/*.ts` file in this codebase
(`apiFetch` + `schema.parse`). Both hit `[AllowAnonymous]` routes —
`apiFetch` still attaches a bearer token if one happens to exist (a
logged-in user could in theory land on `/`), which is harmless since the
routes don't require it.

### `hooks/landing.queries.ts`

```ts
function usePublicCatalogSummaryQuery() {
	return useQuery({
		queryKey: queryKeys.landing.catalogSummary,
		queryFn: getPublicCatalogSummary,
	});
}

function usePublicTestimonialsQuery() {
	return useQuery({
		queryKey: queryKeys.landing.testimonials,
		queryFn: getPublicTestimonials,
	});
}
```

No `{ enabled }` option on either — unlike every gated admin/catalog
query, there's no permission or route-param precondition here; the page
is public and always wants both as soon as it mounts.

`src/lib/constants/query-keys.ts`: add
```ts
landing: {
	catalogSummary: ['landing', 'catalog-summary'] as const,
	testimonials: ['landing', 'testimonials'] as const,
},
```

## Content restructuring

`lib/landing-content.ts` keeps everything that has no live counterpart:
`heroContent` (drop the `stats` array — that's now live), `featuredCourses`
(unchanged, still the 3 editorial entries with full metadata),
`howItWorksIntro`/`howItWorksSteps`, `footerContent`, plus new static
content for the closing CTA and the featured-formation panel's cohort
copy:

```ts
const featuredFormationCopy = {
	eyebrow: 'Formação em destaque',
	description:
		'8 módulos, mentoria em grupo e certificado ao final. Turma limitada, com encontros presenciais mensais.',
	primaryCtaLabel: 'Inscrever-se',
	secondaryCtaLabel: 'Saiba mais →',
} as const;

const closingCtaContent = {
	headline: 'Comece sua jornada hoje.',
	subtext:
		'Crie sua conta gratuita e tenha acesso imediato aos cursos abertos da sua área.',
	primaryCtaLabel: 'Criar conta gratuita',
	secondaryCtaLabel: 'Ver o catálogo',
} as const;
```

`model/featured-course.ts` is unchanged.

## Components

- **`landing-page.tsx`** becomes `'use client'`. Calls both hooks,
  derives the props each section needs, and composes:
  header → hero → featured-courses → how-it-works → areas-grid (if
  `summary?.areas.length`) → featured-formation (if
  `summary?.highlightedCourse`) → testimonials (if
  `testimonials?.length`) → closing-cta → footer.
- **`landing-hero.tsx`**: add a `stats: { activeAreaCount: number;
  publishedCourseCount: number } | undefined` prop. Stat row renders only
  when `stats` is defined — three items: `activeAreaCount` (label "áreas
  de ensino"), `publishedCourseCount` (label "cursos publicados"), and
  the static "11" / "anos de igreja" (always rendered once the other two
  resolve, matching the mockup's three-item row — hiding the whole row
  during load rather than showing 2 of 3 items avoids an odd partial
  state).
- **`featured-courses-section.tsx`**: add a `liveCourses:
  PublicFeaturedCourse[] | undefined` prop, passed through to each
  `FeaturedCourseCard` alongside its static `course` entry. Matching is
  by slug: `liveCourses?.find(c => c.slug === course.slug)`.
- **`featured-course-card.tsx`**: add an optional `live?: {
  thumbnailUrl: string | null; slug: string }` prop. When present: wrap
  the card in a `Link` to `appRoutes.courses.detail(live.slug)`, and
  render `live.thumbnailUrl` via `next/image` instead of the striped
  placeholder when it's non-null. When absent: exactly today's markup
  (no link, striped placeholder) — a pure additive change, no existing
  test assertion should need to change for the no-match case.
- **`areas-grid-section.tsx`** (new): props `{ areas:
  PublicAreaSummary[] }` (parent only renders this component when
  non-empty, so no internal empty-state branch needed). Section header +
  "Ver todas as áreas →" (→ `appRoutes.catalog.index`) + a
  `grid-cols-{areas.length}`-ish responsive grid (cap the desktop column
  count sensibly, e.g. `sm:grid-cols-3 lg:grid-cols-6`, since the mockup
  assumes exactly 6 but the real count could differ) of numbered cells
  (`String(index + 1).padStart(2, '0')`, `area.name`,
  `${area.publishedCourseCount} cursos`).
- **`featured-formation-section.tsx`** (new): props `{ course:
  PublicFeaturedCourse }` (parent only renders when non-null). Cover
  image (`course.thumbnailUrl`, falls back to the striped placeholder
  pattern if null — a featured course *should* have a thumbnail in
  practice, but don't crash if an admin marked one featured without
  setting one), eyebrow/description from `featuredFormationCopy`, real
  `course.title`, both CTAs → `appRoutes.courses.detail(course.slug)`.
- **`testimonials-section.tsx`** (new): props `{ testimonials:
  Testimonial[] }` (parent only renders when non-empty). Grid of quote
  cards — quote, avatar (`testimonial.avatarUrl` via `next/image`, else
  the shared `/brand/viver-da-graca-mark.png` placeholder already used
  elsewhere), `authorName`.
- **`closing-cta-section.tsx`** (new): fully static, from
  `closingCtaContent` — headline, subtext, two CTAs
  (`appRoutes.auth.register`, `appRoutes.catalog.index`).

## Tests

`landing-page.tsx` now calls hooks (`useQuery`), so — same precedent as
every other page-level container in this codebase (`course-modules-page`,
`lesson-editor-page`, `users-list-page`) — it gets **no** `.spec.ts` of
its own; **delete** `landing-page.spec.ts` and move its coverage down to
the presentational sections it composes, each of which stays plain-props,
no hooks, and testable with `renderToStaticMarkup` same as before:

- `landing-hero.spec.ts`: extend — with `stats` provided, the rendered
  markup contains the real numbers; with `stats` undefined, no stat row
  markup appears at all (assert the "áreas de ensino" label is absent).
- `featured-courses-section.spec.ts`: extend — a matching `liveCourses`
  entry produces a `Link` `href` to the course's detail route for that
  card; a non-matching (or absent) `liveCourses` list produces the exact
  previous output (no link).
- `areas-grid-section.spec.ts` (new): renders one cell per area with the
  right name/count and numbering.
- `featured-formation-section.spec.ts` (new): renders the real title and
  both CTAs pointing at the course's detail route.
- `testimonials-section.spec.ts` (new): renders each quote/author; falls
  back to the brand-mark image when `avatarUrl` is `null`.
- `landing-content.spec.ts`: unchanged assertions for `featuredCourses`/
  `howItWorksSteps`; drop the now-removed `heroContent.stats` if any spec
  touched it (check first — the existing spec file doesn't).

## Steps

1. Schemas, model, api, hooks, query keys.
2. `lib/landing-content.ts` edits (drop hero stats, add
   `featuredFormationCopy`/`closingCtaContent`).
3. `featured-course-card.tsx` (`live` prop) →
   `featured-courses-section.tsx` (`liveCourses` prop) → `landing-hero.tsx`
   (`stats` prop) — extend existing components first.
4. New components: `areas-grid-section.tsx`, `featured-formation-section.tsx`,
   `testimonials-section.tsx`, `closing-cta-section.tsx`.
5. `landing-page.tsx`: `'use client'`, wire both hooks, compose every
   section with its derived props/conditional rendering.
6. Tests: extend the three touched specs, add the four new ones, delete
   `landing-page.spec.ts`.
7. `npm run test`, `npm run typecheck`, `npm run lint`.
8. Manually check `/` in the dev server (with the CourseCore backend
   running) at both desktop and mobile viewports, and with the backend
   stopped (to confirm graceful degradation to the pre-revision look).
9. Update `src/features/README.md`'s landing bullet (no longer "Static
   content only... makes no CourseCore calls") and root `README.md`.
10. Commit in small chunks: data layer; component changes; new sections +
    page wiring; tests; docs.
