# Course Detail Page

## Why

Every course card in `/catalog` links to `appRoutes.courses.detail(slug)`.
This is the page that lives there: what a course actually is, its module
breakdown, and — for a locked course — how much of that breakdown a
visitor can preview before enrolling.

## Source

Design reference: artboard `1g` ("Página do curso") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same visual system and nav as `/catalog` (see `course-catalog.md`).

## Revision (2026-09-08): the access model stopped being all-or-nothing

The original version of this spec (2026-09-03) documented
`GetCourseDetailsUseCase` 403ing the entire request for any course the
account didn't fully own, making the mockup's "browse before you buy"
layout — modules unlocked as a preview, "Assistir aula grátis" on
individual lessons — impossible to build. That's closed now
(`Docs/backend-pendencies/catalog/course-detail.md` pendencies 1-4, 8):

- `GetCourseDetailsUseCase` returns the full module/lesson structure for a
  locked-but-otherwise-valid course (real account, published course, just
  missing an area grant) instead of 403ing — `CourseDetailsResponse.HasAccess`
  says which case you're in. It still hard-403s for the cases that
  genuinely have nothing to preview (bad account, unpublished course).
- Every lesson not flagged `FreePreview` reports `VideoId: null` and
  `DurationSeconds: null` when the course is locked — the enforcement
  mechanism, not just a display convention. `RequestVideoPlaybackUseCase`
  independently allows playback for a `FreePreview` lesson regardless of
  course-level access, so a free lesson is actually watchable, not just
  visible.
- `CourseDetailsResponse` also gained `PriceAmount` and `CertificateIssued`
  (installments are still not modeled — see "Non-goals").

This page and `/courses/[slug]/lessons/[lessonId]` were both still built
against the old all-or-nothing assumption until this revision.

## Goals

- Resolve `/courses/[slug]` against the catalog list (`GET
  /api/courses/available`) to find the course, its `hasAccess`, and the
  real aggregate counts (`moduleCount`, `lessonCount`, `durationSeconds`,
  `certificateIssued`, `priceAmount` — all real fields on
  `CourseCatalogItemResponse`, see `course-catalog.md`).
- Fetch `GET /api/courses/{course.id}` **regardless of `hasAccess`** —
  the whole point of this revision. Its response shape differs by case:
  - **`hasAccess: true`**: every lesson has real `VideoId`/`DurationSeconds`.
  - **`hasAccess: false`**: only `FreePreview` lessons do; everything
    else reports `null` for both.
- **Owns the course**: full module list, each card linking to its first
  lesson (unchanged from before this revision).
- **Doesn't own it**: price card (see `Docs/specs/catalog/course-catalog.md`
  and the 1g price-card fix already shipped), plus a module grid where
  each card reflects what's actually previewable:
  - A module with at least one `FreePreview` lesson: real summed
    duration of *those* lessons, count of free lessons, "Assistir aula
    grátis" linking to the first one.
  - A module with none: "Requer inscrição", a disabled "Bloqueado"
    state, no link — and no duration line, since a locked module's full
    duration genuinely isn't in the response (every non-free lesson's
    `DurationSeconds` is `null`).
- A free-preview lesson is actually playable from
  `/courses/[slug]/lessons/[lessonId]` without full course access —
  gated on `location.lesson.freePreview`, not `course.hasAccess`.
- **Unknown slug**: a not-found state, not a crash.

## Non-goals

- **Installments as real data.** `PriceAmount` is a single total; "ou 3×
  de R$ X" is still a client-side computed assumption (fixed 3x), not a
  backend concept — see `course-catalog.md`'s own pendency for this.
- **Checkout/enrollment actually doing anything.** No purchase endpoint
  exists; "Inscrever-se agora" renders but starts no flow.
- **A course "kind" field** ("· Formação" next to the area name) — not on
  any response.
- **Progress tracking for a free-preview viewer without course access.**
  `POST /api/progress/lessons` implies an enrollment relationship; the
  lesson player hides "Marcar aula como assistida" and the progress bar
  entirely when `!course.hasAccess`, showing "Aula grátis" instead. Not
  verified against the backend either way — a conservative choice to
  avoid an unverified write, not a confirmed restriction.
- **Locked-module duration for modules with zero free lessons.** The
  mockup's own example shows a duration ("1h 30min · requer inscrição")
  for a fully-locked module — not reproducible honestly, since the
  backend genuinely omits `DurationSeconds` for every non-free lesson in
  that case. This spec shows no duration there rather than a number that
  can't be real.
- **Disabling locked lessons in the lesson-player sidebar.** Clicking a
  locked lesson from within the free-preview player still navigates and
  bounces back to the course detail page (the same not-accessible check
  the URL itself enforces) rather than being visually disabled in place —
  a safe fallback, not a polished one.

## Data

1. `useCourseCatalogQuery()` (existing, shared cache) — find the course
   by `slug`; gives `hasAccess` and every aggregate field.
2. `useCourseDetailsQuery(course.id, { enabled: Boolean(course) })` — no
   longer conditioned on `hasAccess`. Feeds the module grid on both the
   owned and locked views once it resolves; the locked view shows
   "Carregando conteúdo…" until then, same as the owned view already did.
3. On the lesson player
   (`/courses/[slug]/lessons/[lessonId]`): the same details query, also
   unconditional now. `lessonIsAccessible = course.hasAccess ||
   location.lesson.freePreview` decides whether to render the player or
   redirect back to the course detail page.

## Behavior

- No stored access token → redirect to `/login`.
- Catalog list loaded, no course matches the slug → "Curso não
  encontrado."
- Course found → price card, stats row, and module grid all render from
  real data; `hasAccess` only changes which module cards are unlocked and
  whether the module card links anywhere.
- Details request genuinely fails (bad account, unpublished course,
  network error) → same locked-view fallback as before, module section
  shows nothing rather than an error banner.
- Lesson player: URL for a lesson that isn't free-preview and course
  isn't owned → redirect to the course detail page, same as an unknown
  lesson id.

## Acceptance criteria

- `/courses/[slug]` with no stored token redirects to `/login`.
- An unknown slug shows a not-found state.
- A locked course shows the price card, the real stats row, and a module
  grid where free-preview modules link to their first lesson and others
  show "Bloqueado".
- An owned course shows the full module list unchanged from before this
  revision.
- `/courses/[slug]/lessons/[lessonId]` plays a free-preview lesson even
  when the course itself is locked; any other lesson on a locked course
  redirects back to the course detail page.
- The page uses the same nav and visual system as `/catalog`.
