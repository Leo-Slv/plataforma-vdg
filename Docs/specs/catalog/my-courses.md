# My Courses Page

## Why

`/catalog`, `/courses/[slug]`, and the lesson player all point their
"Meus cursos" nav item at inert text so far — this spec builds the page
that lives there: a dashboard of everything the account already owns,
so a returning student lands somewhere useful instead of the catalog
grid every time.

## Source

Design reference: artboard `1j` ("Meus cursos — dashboard do aluno") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same dark system and top nav as `/catalog`/`/courses/[slug]`/the lesson
player.

## What's real, and what this page has to compute itself

No single endpoint returns this page's data — it's assembled from three
already-existing calls this app already uses elsewhere:

- `GET /api/courses/available?hasAccess=true` — the owned-courses list
  (same shape as the catalog's own list, just pre-filtered). Reuses
  `queryKeys.catalog.list`'s cache if the visitor came from `/catalog`.
- `GET /api/courses/{id}` — real module/lesson list, **one call per
  owned course**. Reuses `queryKeys.catalog.detail(id)` — already warm
  for any course the visitor has opened before.
- `GET /api/progress/courses/{id}` — real per-lesson completion, **one
  call per owned course**. Reuses `queryKeys.progress.course(id)` — same
  cache the lesson player already populates.

`course-catalog.md` deliberately deferred per-course progress display
to this exact page ("This is what a 'Meus cursos' dashboard... is for,
not a catalog grid"), reasoning that N+1 requests are fine for a
dashboard of the courses one account owns (small N) even though they'd
be wasteful for an 18-course public catalog. This page is that N+1: one
catalog call, then `2×N` parallel calls (details + progress) for however
many courses `hasAccess: true` returns — via `useQueries`, this
codebase's first use of it (every prior screen fetched a fixed, known
set of queries, not a dynamic array sized by a previous response).

### What's in the mockup that still isn't in the backend

| Mockup shows | Backend has it? |
|---|---|
| "24 aulas · 7h", "restam 8min", "12min restantes" | Lesson **count** is real (summed from `GET /api/courses/{id}`). Any **duration** — total, remaining, or per-lesson — is not: same unreachable-without-a-videoId gap as `lesson-player.md`. |
| "Certificado emitido" | No certificate concept anywhere (`course-catalog.md`, `course-detail.md`). |
| The "⋮" kebab per card | No per-card menu actions exist to back it. |

Everything else on this screen — enrolled/completed counts, per-course
percent, which lesson is "current," the hero continue-card, "Retomar
aula" — is real and described below.

## Goals

- List every course with `hasAccess: true`, each rendered as a card
  showing: cover, real lesson count (no duration), real percent, and a
  status line depending on state (see "Card states").
- A header line with real counts: "`{owned.length}` inscritos ·
  `{completed.length}` concluídos".
- A "continue de onde parou" hero card for the most recently active
  in-progress course, if any (see "Picking the hero course"), with a
  real "Retomar aula" link straight to the next lesson to watch.
- Every card and the hero both link to a real lesson via
  `appRoutes.courses.lesson(slug, lessonId)` — this page is a second
  real entry point into the lesson player, alongside course-detail's
  module cards.
- "Meus cursos" in `AppNav` becomes a real, active link here (currently
  inert text on every page that renders the nav).

## Non-goals

- Any duration figure anywhere — course-level, remaining-time, or
  per-lesson. Same standing rule as `course-detail.md`/`lesson-player.md`.
- Certificates ("Certificado emitido") — no backend concept, same as
  `course-catalog.md`'s own non-goal.
- The "⋮" kebab menu — inert, matching `course-card.tsx`'s existing
  treatment.
- Pagination or a "load more" — same reasoning `course-catalog.md` used:
  everything fetched is already in memory once the N+1 calls resolve.

## Card states

Every owned course falls into exactly one, computed from
`courseProgress.progressPercent` and the course's real module/lesson
list:

- **Completed** (`progressPercent === 100`): area + real module count
  (`"{area} · {modules.length} módulos"`, matching `course-detail-owned
  .tsx`'s existing counting logic), status line "100% concluído · rever".
  Links to the course's first lesson (start a re-watch from the top —
  there's no "last lesson watched" concept worth surfacing here, and
  the mockup doesn't specify one either).
- **In progress** (`0 < progressPercent < 100`) or **not started**
  (`progressPercent === 0`, but `hasAccess: true`): area + the current
  lesson's module (`"{area} · Módulo 0{N}"`) on one line, the current
  lesson's title on the next. Status line
  `"{percent}% concluído · continuar"` (or "0% concluído · começar" at
  exactly 0). Links to the current lesson (see "Finding the current
  lesson").
- A course can't be `hasAccess: false` here at all — this list is
  already filtered server-side by `?hasAccess=true`.

## Finding the current lesson

Same flattening `lesson-sequence.ts` already does for "Próxima aula,"
reused here: flatten the course's modules into an ordered lesson list,
then walk it for the first lesson **not** marked `completed` in
`courseProgress.lessons`. If every lesson is completed, that's the
100% case above (course-level percent already agrees). If nothing has
been started, the first lesson in the flattened list is "current" — the
same "not started" card state, not a separate one.

## Picking the hero course

"Continue de onde parou" needs one course, not a list. Among owned
courses with `0 < progressPercent < 100` (deliberately excluding both
0% and 100% — a hero card offering to "continue" a course you haven't
touched, or finish one you already have, doesn't match the mockup's own
framing), pick the one whose current lesson's progress entry has the
latest `lastWatchedAt` (from `LessonProgressResponse.LastWatchedAt`,
already on every entry in `courseProgress.lessons` — comparing across
courses once all `N` progress calls have resolved). If no course
qualifies (a brand-new account, or every owned course is either
untouched or finished), the hero section doesn't render — "Seus cursos"
still does, deciding is legitimate here since the mockup describes a
"you're mid-course" moment this account may genuinely not be in yet.
The hero shows the same current-lesson data the in-progress card state
computes (module/lesson title, percent, real progress bar), just at
larger scale, and "Retomar aula" links to that same lesson.

## Sort order for "Seus cursos"

Not specified by the mockup beyond the three visible cards' apparent
order. Decision: most-recently-active first (courses with an in-progress
or completed lesson, ordered by their latest `lastWatchedAt` descending),
then not-started owned courses in the catalog's own `displayOrder`. This
keeps the grid consistent with the hero card's own "most recent first"
logic rather than inventing a second, unrelated ordering rule.

## `AppNav` becomes state-aware

Every page using `AppNav` today hardcodes "Catálogo" as the underlined
item. This page needs "Meus cursos" underlined instead — the third
distinct nav destination (after Catálogo and, structurally, Certificados
which stays permanently inert). `AppNav` gains an `active: 'catalog' |
'my-courses'` prop; every existing caller (`catalog-page.tsx`,
`course-detail-page.tsx`, `lesson-player-page.tsx`) passes
`active="catalog"` explicitly (matches current behavior — none of them
are actually "on" the catalog page's own route, same simplification the
mockup itself makes by not having a distinct nav state per sub-page).
"Meus cursos" also stops being a `<span>` and becomes a real `Link`
regardless of which page renders the nav.

## Behavior

### On mount

Same base auth gate as `/catalog` (`useRequireAuth()`, redirect to
`/login` if no stored token) — no email-confirmation gate, matching
every other post-login screen; an unconfirmed account simply sees zero
owned courses (see "Empty state"), which is correct, not a bug.

### Data

1. `useCourseCatalogQuery({ enabled: ready })` (shared cache) → filter to
   `hasAccess: true` client-side (no need to call the API a second time
   with `?hasAccess=true` — the already-fetched full list has the same
   flag per course).
2. `useQueries` over the owned list: for each course, a details query
   (`queryKeys.catalog.detail`) and a progress query
   (`queryKeys.progress.course`) — `2N` queries, `enabled` once step 1
   has resolved.
3. Once every details/progress pair for a course has resolved, compute
   its card state, current lesson, and hero eligibility as described
   above. A course whose pair is still loading renders its card in a
   lightweight loading state (cover + title only, from the catalog data
   already available) rather than blocking the whole grid.

### Empty state

Zero owned courses (new/unconfirmed account, or a confirmed account with
no free/paid access yet) → no hero, no grid — a message ("Você ainda não
tem cursos." or similar) with a CTA back to `/catalog`, same pattern
`course-catalog.md` already uses for its own empty state.

## Acceptance criteria

- `/my-courses` with no stored token redirects to `/login`.
- A confirmed account with zero owned courses sees the empty state with
  a link to `/catalog`, not a blank page.
- Enrolled/completed counts in the section header are real, matching
  the length of the owned list and the count of 100%-complete courses.
- Every card shows a real lesson count and real percent — no duration
  anywhere, no certificate badge anywhere.
- The hero card, when present, resolves to the owned course with the
  most recently watched lesson among those strictly between 0% and
  100%; "Retomar aula" and every card's own link land on the real
  current lesson for that course, computed from real progress data, not
  guessed.
- A 100%-complete course's card links to its first lesson.
- "Meus cursos" in the nav is a real link on every page that renders
  `AppNav`, and renders as the active item only on this page.
