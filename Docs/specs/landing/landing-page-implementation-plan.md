# Landing Page — Implementation Plan

Implements [`landing-page.md`](landing-page.md).

## Route constants

Add to `src/lib/routes/app-routes.ts` (extends the existing `system` group
and introduces an `auth`/`catalog` group — no routes exist there yet):

```ts
const appRoutes = {
	system: {
		home: '/',
	},
	auth: {
		login: '/login',
		register: '/register',
	},
	catalog: {
		index: '/catalog',
	},
} as const;
```

English slugs, matching the CourseCore endpoint naming
(`/api/auth/register`) and this repo's code-language convention. These
paths are link targets only — no `src/app/login`, `src/app/register`, or
`src/app/catalog` route is created by this plan (non-goal per the spec);
until those features are specced, Next.js will 404 on click, which is
acceptable per the spec's acceptance criteria ("routes may be stubbed").

## Feature slice: `src/features/landing/`

This feature has no HTTP calls (spec: "No network call is made to
CourseCore from this page") and no per-request server state, so it skips
`api/`, `hooks/`, and `schemas/` — nothing in those folders would have a
reason to exist yet.

```text
src/features/landing/
├── model/
│   └── featured-course.ts       # FeaturedCourse type
├── lib/
│   └── landing-content.ts       # all static copy: hero, stats, featured
│                                 # courses, how-it-works steps, footer
└── components/
    ├── landing-page.tsx         # composes the sections below, in order
    ├── landing-header.tsx
    ├── landing-hero.tsx
    ├── featured-courses-section.tsx
    ├── featured-course-card.tsx # one card, used 3x by the section above
    ├── how-it-works-section.tsx
    ├── landing-footer.tsx
    └── *.spec.ts                # colocated, see "Tests" below
```

`src/app/page.tsx` is replaced with a thin wrapper:

```tsx
import { LandingPage } from '@/features/landing/components/landing-page';

export default function Home() {
	return <LandingPage />;
}
```

### `model/featured-course.ts`

```ts
type FeaturedCourse = {
	slug: string;
	title: string;
	category: string;
	moduleCount: number;
	lessonCount: number;
	durationLabel: string; // "7h", "2h30", "12h" — pre-formatted, not computed
	price: 'free' | { amountLabel: string }; // "free" | { amountLabel: "R$ 149" }
	statusLabel: string; // "Aberto para toda a igreja", "Turmas novas todo mês", "2 aulas liberadas · certificado"
	coverImageUrl: string;
};
```

### `lib/landing-content.ts`

One module, exporting the static editorial data named in the spec:

- `heroContent`: eyebrow, headline, subtext (desktop + mobile variant),
  primary/secondary CTA labels, stat row (`{ value, label }[]`).
- `featuredCourses: FeaturedCourse[]` — the 3 entries from the spec
  ("Fundamentos da Fé", "Curso de Batismo", "Escola de Líderes"), verbatim
  copy.
- `howItWorksSteps: { step: string; title: string; description: string }[]`
  — the 3 entries from the spec.
- `footerContent`: org name, school name, link labels, copyright year.

Centralizing content in one file (rather than inlining strings per
component) is what makes the "revisit once CourseCore exposes a public
catalog/stats endpoint" note in the spec actionable later: swapping this
module for a React Query hook is a localized change.

### Components

- **`landing-header.tsx`**: brand + nav (`Cursos`, `Áreas`, `Sobre a
  escola` as inert placeholders — render as non-interactive text or
  `<span>`, not `<a href="#">`, to avoid implying a working link) + two
  `Button`s (`variant="outline"` for "Entrar" linking to
  `appRoutes.auth.login`, `variant="default"` for "Criar conta" linking
  to `appRoutes.auth.register`) via `asChild` wrapping `next/link`.
- **`landing-hero.tsx`**: renders `heroContent`. CTAs are `Button asChild`
  wrapping `Link` (primary → `appRoutes.auth.register`, secondary →
  `appRoutes.catalog.index`). Stat row hidden below `sm` breakpoint per
  the mobile mockup (`1b` drops it).
- **`featured-course-card.tsx`**: one `Card` per course — cover image,
  `Badge` for price (`Gratuito` vs `R$ 149`), title (`CardTitle`),
  category/module meta, status line. Takes a `FeaturedCourse` prop.
- **`featured-courses-section.tsx`**: section heading + "Todos os cursos
  →" link (→ `appRoutes.catalog.index`) + a responsive grid (`grid-cols-1`
  mobile, `grid-cols-3` desktop) mapping `featuredCourses` through
  `FeaturedCourseCard`.
- **`how-it-works-section.tsx`**: heading + intro line + 3-column
  (1-column on mobile) numbered step list from `howItWorksSteps`.
- **`landing-footer.tsx`**: org/school name, inert link labels (same
  placeholder treatment as header nav), copyright.
- **`landing-page.tsx`**: renders header, hero, featured-courses,
  how-it-works, footer in order. No props, no state.

Images: `coverImageUrl` in `landing-content.ts` points at a same-origin
placeholder path (e.g. `/images/courses/<slug>.jpg`) using `next/image`;
actual photography is a content task, not a code task, and is out of
scope here. Until real files exist, use a solid-fill placeholder image
already available in `public/` (or, if none exists, a plain
background-color `div` in `featured-course-card.tsx` sized to the same
aspect ratio) so the page doesn't 404 on missing assets.

## Styling notes

- Use Tailwind utilities directly against the existing design tokens
  (`bg-primary`, `text-foreground`, etc. from `globals.css` /
  `components.json`'s `lyra` preset) — no new tokens introduced.
  Headings use the `font-heading` class already wired to Jost (see
  `CardTitle`'s use of it); body copy uses the default body font (DM
  Sans).
- No new shadcn primitives needed — `Button`, `Card` (+ sub-parts), and
  `Badge` cover every element in the mockup.

## Tests

No DOM-testing library is installed (`npm run test` runs Node's built-in
test runner via `tsx --test`, no jsdom). Adding `@testing-library/react` +
a DOM environment is more than this presentational feature needs, so
component specs render with `react-dom/server`'s `renderToStaticMarkup`
(pure Node, already available via `react-dom`, no new dependency) and
assert against the resulting HTML string. Planned specs:

- `landing-content.spec.ts` (in `lib/`, not `components/` — not a
  component): `featuredCourses` has exactly 3 entries with the expected
  titles/prices; `howItWorksSteps` has exactly 3 entries.
- `landing-hero.spec.ts`: rendered markup contains the headline text and
  both CTA `href`s point at `appRoutes.auth.register` /
  `appRoutes.catalog.index`.
- `featured-courses-section.spec.ts`: renders exactly 3
  `featured-course-card` outputs (e.g. count title occurrences).
- `landing-page.spec.ts`: smoke test — renders without throwing and the
  output contains one instance of each section's identifying text (hero
  headline, "Comece por aqui", "Como a escola funciona", footer org name).

## Steps

1. Add `auth`/`catalog` route groups to `app-routes.ts`.
2. Add `model/featured-course.ts` and `lib/landing-content.ts`.
3. Build components bottom-up: `featured-course-card` →
   `featured-courses-section` → `landing-header` / `landing-hero` /
   `how-it-works-section` / `landing-footer` → `landing-page`.
4. Replace `src/app/page.tsx` with the thin wrapper.
5. Add the colocated specs listed above.
6. Run `npm run test`, `npm run typecheck`, `npm run lint`; fix until
   green.
7. Manually check `/` in the dev server at both a desktop and a mobile
   viewport against mockup frames `1a`/`1b`.
8. Update `src/features/README.md`'s "No feature folder exists yet" line
   and root `README.md` per CLAUDE.md's "Docs" workflow step.
9. Commit in small, conventional-commit chunks separated by context (e.g.
   route constants; feature content/model; components; app wiring; tests;
   docs) — per CLAUDE.md, never one giant commit.
