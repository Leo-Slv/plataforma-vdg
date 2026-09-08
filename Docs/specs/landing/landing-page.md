# Landing Page

## Why

The landing page (`/`) is the first thing any visitor — church member or
not — sees. It has to explain what the platform offers (free and paid
courses from Igreja Viver da Graça's discipleship school), build enough
trust to justify creating an account, and route the visitor into either
signup or the course catalog.

This spec revises the original 2026-09-03 version: the mockup grew four
sections since then ("Áreas de ensino", "Formação em destaque", "O que os
alunos dizem", and a closing CTA) that were never implemented, and the
backend gaps that originally justified shipping *everything* as static
editorial copy — no public catalog/stats/testimonials endpoint at all —
are now closed (`Docs/backend-pendencies/landing/landing-page.md`,
pendencies 1-3). This revision catches the page up to the current mockup
and wires what the backend can now actually back with real data.

## Source

Design reference: artboards `1a` ("Landing page — desktop") and `1b`
("Landing — mobile") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Visual system per the mockup's own annotation: near-black / near-white
base, geometric sans (Jost) for headings, DM Sans for body text, a
restrained cool blue reserved for actions and progress indicators.

## Goals

- Communicate what the school is and who it's for, above the fold.
- Surface real, live courses and areas — not a permanently-static
  editorial snapshot — now that a public endpoint exists.
- Show the "Áreas de ensino" grid, a "Formação em destaque" panel, and a
  student-testimonials section, all backed by real data where the backend
  supports it.
- Explain the path from "visitor" to "watching a lesson" in a few steps.
- Drive two primary actions: start a free account, or browse the catalog.
- Work as a single responsive page (no separate mobile route) covering
  the desktop (`1a`) and mobile (`1b`) layouts from the mockup.
- Degrade gracefully: a visitor should never see a broken or half-empty
  page because the public API is slow, down, or has no data yet (see
  "Open decisions").

## Non-goals

- Building the catalog, signup, login, or "about" pages — this spec
  covers `/` only. Nav links to those areas are out of scope, same as the
  original version.
- Any authenticated / personalized state on this page — the landing page
  always renders for an anonymous visitor.
- A CMS or admin UI for editing the page's copy, the "featured courses"
  editorial picks, or the "Formação em destaque" cohort copy — those stay
  hardcoded frontend content (see "Open decisions" for exactly which
  parts).
- **An admin UI to create/publish testimonials.** The backend already has
  full CRUD (`POST/PUT/{id}/publish/{id}/unpublish/GET /api/testimonials`,
  all behind `courses.manage`) from `landing-page.md` pendency 3's
  resolution, but no admin screen calls it yet. Until one exists, the
  testimonials section on this page will render nothing on any
  installation with no testimonials seeded directly — see "States".
- **Fixing the "Comece por aqui" cards' price/duration/module-count
  fields to be fully live.** `GET /api/courses/public-summary`'s
  `FeaturedCourses` deliberately excludes pricing, duration, lesson
  count, and area name (documented as intentional in pendency 1's
  resolution: "safe public subset only") — see "Open decisions" for how
  this spec works around that gap instead of re-opening a backend ask.

## Page content

### Header

- Brand: "Viver da Graça".
- Nav items: "Cursos", "Áreas", "Sobre a escola" — placeholders, no
  destination route yet.
- Actions: "Entrar" (→ login), "Criar conta" (→ signup).

### Hero

- Eyebrow: "Escola de Discipulado · 2026".
- Headline: "Ensino que sustenta a sua caminhada." (shortened on mobile
  per `1b`).
- Subtext, primary CTA ("Começar gratuitamente" → signup), secondary CTA
  ("Ver o catálogo" → catalog) — all static, unchanged.
- Stat row: "`{n}` áreas de ensino", "`{m}` cursos publicados" — now real,
  from `GET /api/courses/public-summary`'s `ActiveAreaCount`/
  `PublishedCourseCount`. "11 anos de igreja" stays static — there is no
  "founded in" concept anywhere in CourseCore, and never will be; it's an
  institutional fact about the church, not catalog data.

### "Comece por aqui" (featured courses)

- Section header "Comece por aqui" with a "Todos os cursos →" link to the
  catalog.
- Three course cards — **still a fixed editorial pick** (title,
  description, category, module/lesson count, duration, price badge,
  status line all hardcoded, same three as before: Fundamentos da Fé,
  Curso de Batismo, Escola de Líderes). See "Open decisions" for why this
  didn't become a live `FeaturedCourses` listing despite the backend now
  having one.
- **Enrichment, not replacement**: for each editorial card, if
  `GET /api/courses/public-summary`'s `FeaturedCourses` contains a course
  whose `Slug` matches the card's hardcoded slug, that card's cover image
  (`ThumbnailUrl`) and, when present, links to the real course detail
  page (`/courses/{slug}`) — confirming the editorial pick still exists
  and is really published, instead of linking blind. A card with no
  matching real course renders exactly as it did before (striped
  placeholder cover, no link) — never a 404.

### "Como a escola funciona" (how it works)

Unchanged — three numbered steps, matching the account/access flow
documented in CLAUDE.md ("Auth").

### "Áreas de ensino" (new)

- Section header "Áreas de ensino" with a "Ver todas as áreas →" link —
  points at the catalog (`appRoutes.catalog.index`), which already groups
  courses by area; there's no dedicated `/areas` page for visitors.
- A numbered grid (01-06 in the mockup, but sized to however many areas
  actually come back), one cell per entry in
  `GET /api/courses/public-summary`'s `Areas`: `Name` and "`{n}` cursos"
  from `PublishedCourseCount` — **fully real**, no static fallback needed
  (unlike the featured cards, every field this grid needs is already on
  the response).
- **Hidden entirely** if the list comes back empty (a fresh install with
  no active areas) or the request fails — see "States". This section
  never existed on the shipped page before, so hiding it on a bad day
  regresses nothing.

### "Formação em destaque" (new)

- A highlighted panel: cover image, eyebrow "Formação em destaque",
  title, description, "Inscrever-se" and "Saiba mais →" CTAs (both → the
  course's detail page — the two buttons already share one destination
  elsewhere on this page, "Ver o catálogo" and "Todos os cursos →").
- Title, cover image, and description come from
  `GET /api/courses/public-summary`'s `HighlightedCourse` (the first
  published course with `IsFeatured: true`, per pendency 2's resolution).
  The mockup's cohort-specific copy ("8 módulos, mentoria em grupo e
  certificado ao final. Turma limitada, com encontros presenciais
  mensais.") **stays hardcoded** — CourseCore has no cohort/enrollment-
  window/capacity concept at all (pendency 2's resolution was explicit
  that this was deliberately not built), so there's nothing real to
  source it from regardless of which course ends up marked featured.
- **Hidden entirely** when `HighlightedCourse` is `null` (no admin has
  marked any published course `IsFeatured` yet) or the request fails —
  same reasoning as the areas grid: never shipped before, so hiding is a
  safe default, and showing the hardcoded cohort copy stapled to an
  arbitrary/no course would be actively misleading.

### "O que os alunos dizem" (new)

- Up to 3 testimonials from `GET /api/testimonials/public` — quote,
  avatar (real `AvatarUrl` when set, else the same brand-mark placeholder
  used for course/user avatars elsewhere in this codebase), author name.
  Fully real; no editorial fallback (there's nothing plausible to
  fabricate here — a fake quote attributed to a fake name is a much worse
  failure mode than an absent section).
- **Hidden entirely** when the list is empty or the request fails — see
  "Non-goals" for why it's very likely to *be* empty on real
  installations for now (no admin UI creates testimonials yet).

### Closing CTA (new)

- "Comece sua jornada hoje." + subtext + the same two CTAs as the hero
  (signup, catalog) — **fully static**, no data involved. This section
  was already in the mockup before this revision; it just had never been
  built. Always renders.

### Footer

Unchanged — org/school name, placeholder links, copyright.

## Responsive behavior

Unchanged from the original spec — one page, two layouts (`1a` desktop /
`1b` mobile), no separate tablet breakpoint specified.

## States

- **Loading**: the two network calls
  (`GET /api/courses/public-summary`, `GET /api/testimonials/public`)
  happen independently, client-side, after the page mounts (see "Open
  decisions" for why client-side rather than server-rendered). Until each
  resolves, the section(s) it feeds render nothing extra — the page looks
  exactly like the *previous*, fully-static version (header, hero minus
  the stat row, static featured cards, how-it-works, closing CTA,
  footer). Nothing pops in as a skeleton; sections that have real data to
  show simply appear once it arrives, on top of an already-complete-
  looking page.
- **Error**: identical treatment to "still loading" for every real-data
  section — hide/omit rather than show a retry banner. This is a public
  marketing page; a visitor should never see "Não foi possível carregar…"
  chrome. A slow or failing public API degrades this page back to
  exactly what it looked like before this revision, not to something
  visibly broken.
- **Empty**: areas grid and testimonials hide on an empty list; featured
  formation hides on a `null` highlighted course. The featured-courses
  cards never go empty (they're editorial, always rendered) — only their
  enrichment (cover image, link) is conditional on a slug match.

## Open decisions

Resolved with the user on 2026-09-08:

- **How to fetch the now-available public data.** This feature has never
  made an HTTP call before (`src/features/landing/` has no `api/`,
  `hooks/`, or `schemas/` folder). Two real options: fetch server-side in
  an async `page.tsx` (no loading flash, real content in the initial
  HTML — better for SEO/crawlers that don't execute JS), or client-side
  with TanStack Query, matching every other feature in this codebase.
  **Decision: TanStack Query, client-side** — consistency with the
  established pattern (`CLAUDE.md`: "TanStack Query for server state")
  outweighs the SEO argument for this iteration; `landing-page.tsx`
  becomes a `'use client'` component with its own `useQuery` calls, same
  shape as every admin/catalog page. Revisit if SEO for this specific
  page becomes a real, measured concern later — that would be a deliberate
  architecture change, not a default.

Derived without needing to ask (mechanical, consistent with the
"don't fabricate data" precedent already used throughout this codebase —
e.g. `courses-panel.md`'s audit-log fallback, `course-modules.md`'s
video-status "sem vídeo" instead of a guess):

- **"Comece por aqui" stays editorial instead of becoming a live
  `FeaturedCourses` listing.** `FeaturedCourses` is "the first 3 *published*
  courses" (`GetPublicCatalogSummaryUseCase`, no curation logic at all) —
  not a curated "start here" set. Rendering it verbatim risks showing an
  arbitrary or unpolished course as a visitor's very first impression,
  and — since `PublicFeaturedCourseResponse` deliberately has no pricing/
  duration/lesson-count/area fields (pendency 1's own resolution text) —
  a fully-live card couldn't show the mockup's price badge or module/
  duration meta at all regardless. Enrichment-by-slug-match (real cover
  image + real link when the editorial pick happens to still exist) gets
  the honest, low-risk half of "live data" without either problem.
- **Areas grid, featured formation, and testimonials hide instead of
  showing placeholder/skeleton content on load or error.** These three
  sections are 100% new to the shipped page — there is no prior state to
  preserve continuity with, so "not there yet" during a slow load is
  indistinguishable from "not there at all" a visitor would have seen
  before this revision. Showing a skeleton for a section a visitor has
  never seen exist is not necessary to avoid regressing anything.
- **Hero stats hide (not fall back to stale static numbers) while
  loading/on error.** The whole reason this revision exists is to stop
  the numbers from silently drifting from reality; falling back to
  hardcoded numbers on error would reintroduce exactly that risk, just
  narrowed to the unlucky visitor who hit a slow request.

## Acceptance criteria

- `/` renders the header, hero (with live area/course counts once
  loaded), featured-courses (editorial, enriched by real data when a
  slug matches), how-it-works, areas grid (when areas exist), featured
  formation (when a course is marked featured), testimonials (when any
  are published), closing CTA, and footer.
- Layout matches the `1a` desktop / `1b` mobile mockup states.
- A `GET /api/courses/public-summary` or `GET /api/testimonials/public`
  failure never breaks the page or shows visible error chrome — it
  degrades to the pre-revision static-only appearance.
- No fabricated data is ever shown: a section with nothing real to show
  is absent, not filled with placeholder copy.
- "Começar gratuitamente"/"Criar conta" target signup; "Entrar" targets
  login; "Ver o catálogo"/"Todos os cursos →"/"Ver todas as áreas →"
  target the catalog; a featured-course card or the featured-formation
  CTAs only link somewhere when backed by a real, confirmed course slug.
