# Course Detail Page

## Why

Every course card in `/catalog` links to `appRoutes.courses.detail(slug)`
— a stub since that work shipped. This is the page that lives there:
what a course actually is, and — for a course the account already has
access to — its module breakdown.

## Source

Design reference: artboard `1g` ("Página do curso") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same visual system as `/catalog` (see
[`course-catalog.md`](course-catalog.md)) and the same top nav — reused
as-is here rather than reproducing the mockup's own slightly different
nav for this frame (it drops "Certificados" and the user avatar). One
shared, consistent nav across every authenticated page beats matching
each mockup frame's nav pixel-for-pixel, and "Certificados" has no
backend behind it either way (see `course-catalog.md`'s gap table).

**This mockup has the same problem `course-catalog.md` documented, more
severely.** Read that spec's "What the backend actually returns" first;
this page needs a second pass because the backend's access model, not
just missing fields, makes most of the mockup's "browse before you buy"
design impossible to build as drawn.

## The access model changes what this page can show, not just what it can't

`GET /api/courses/{courseId}` (`GetCourseDetailsUseCase`) — the only
endpoint with module/lesson data — throws a **403 for the entire
request** if the account doesn't have access to the course:

```csharp
var access = await _courseAccessService.CanUserAccessCourseAsync(userId, courseId, ct);
if (!access.CanAccess) { throw new ForbiddenException(...); }
```

Access itself (`CourseAccessService.CanUserAccessCourseAsync`) is
**all-or-nothing per course** — free, or an area grant covering the
whole course. There's no partial state.

The mockup assumes something in between: 2 of 8 modules unlocked as a
preview, "Assistir aula grátis" on individual lessons. That maps to
`LessonResponse.FreePreview` — a real field — but it's **decorative
data with no enforcement anywhere**: not in `GetCourseDetailsUseCase`
(which 403s before any lesson is even reachable without full access),
not in `RequestVideoPlaybackUseCase` (checks the same all-or-nothing
`CanUserAccessCourseAsync`, never reads `FreePreview`). Same category as
`User.EmailVerifiedAt` before the confirm-email work gave it a
consumer — a column that exists and is written by admin tooling, wired
to nothing on the read/access side. This spec doesn't build UI around
`FreePreview`: showing a "grátis" badge on a lesson that 403s the moment
either its course details or its playback is requested would be a
worse bug than not showing the badge.

Consequence: **this page's whole shape branches on `hasAccess`,** not
just individual pieces of content:

- **`hasAccess: true`** → `GET /api/courses/{id}` succeeds. Full page:
  description, real module/lesson counts, the module list.
- **`hasAccess: false`** → that call would 403, so this plan never makes
  it. The page falls back to what `GET /api/courses/available` already
  returned for this course (title, description, thumbnail,
  pricingModel) — the same data `/catalog` used to render its card —
  and shows a locked landing with no module breakdown, because there is
  none to show without a 403.

`hasAccess` itself comes from the catalog list, not this page — see
"Data" below.

## What else is in the mockup that isn't in the backend

Beyond what `course-catalog.md` already ruled out (module/lesson counts
*are* real here, unlike the catalog card — see above):

| Mockup shows | Backend has it? |
|---|---|
| "12h de vídeo" | No duration anywhere reachable without playback access per video, one at a time (`VideoPlaybackOutput.DurationSeconds`) — not a course-level or bulk figure. |
| "Sim" / certificado | No certificate concept anywhere (confirmed in `course-catalog.md`). |
| "R$ 149", "ou 3× de R$ 49,67" | `PricingModel` is still just `Free`/`Paid`, no amount, no installment concept. |
| "Inscrever-se agora" (checkout) | No purchase/checkout endpoint — explicit non-goal in the backend's own spec. |
| "Assistir aula grátis" | `LessonResponse.FreePreview` exists but is unenforced everywhere — see above. |
| A course "kind" ("· Formação" next to the area name) | No such field on `CourseDetailsResponse`/the catalog item. |
| A progress bar on a module card | Same per-course-only progress endpoint gap as the catalog page — nothing bulk, nothing module-level. |

## Goals

- Resolve `/courses/[slug]` against the catalog list (`GET
  /api/courses/available`, same query the catalog page uses — same
  cache key, so arriving from a catalog click costs no extra request)
  to find the course and its `hasAccess`.
- **Owns the course**: show the real title, description, area, module
  count, lesson count (both summed from `GET /api/courses/{id}`'s real
  `Modules`/`Lessons`), and the module list itself.
- **Doesn't own it**: show what the catalog already told the browser
  (title, description, area, Gratuito/Pago) with no module breakdown,
  and an enroll CTA — inert, no checkout exists (see table above).
- **Unknown slug**: a not-found state, not a crash.
- Same authenticated shell as `/catalog` (nav, dark card system).

## Non-goals

- Everything in the two gap tables above — no invented durations,
  certificates, prices, installments, free-preview enforcement, or
  course "kind".
- **The lesson player** (mockup `1h`). Module cards in the owned view
  are informational, not links — there's no destination page yet, and
  no agreed URL shape for one. Revisit once that screen is specced.
- **Checkout/enrollment actually doing anything.** The button exists
  because the mockup has one and hiding it would look broken; it
  doesn't start a flow.
- **Promoting `FreePreview` to a real feature** (wiring it into access
  checks). That's a CourseCore change, out of scope here — noted so it
  isn't mistaken for an oversight.

## Data

1. `useCourseCatalogQuery()` (existing, shared cache) — find the course
   by `slug`. Not found in the list → not-found state (see "Behavior").
2. If found and `hasAccess`, a second query,
   `GET /api/courses/{course.id}` — new, `enabled: hasAccess`. Its
   `Modules`/`Lessons` drive the module count, lesson count, and module
   list. This call is never made when `hasAccess` is `false` — that's
   the point, not an optimization.

## Behavior

- No stored access token → redirect to `/login`, same gate every
  authenticated page in this repo already has.
- Catalog list loading → the same loading state `/catalog` uses.
- Catalog list loaded, no course matches the slug → "Curso não
  encontrado" with a link back to `/catalog`.
- Course found, `hasAccess: false` → locked view from catalog data only.
- Course found, `hasAccess: true`, details loading → loading state for
  just the module section (title/description/area already known from
  the catalog match, so they render immediately).
- Details request somehow still fails (e.g. access was revoked between
  the two requests) → treat like the locked view rather than an error
  page; it's a legitimate state, not a failure.

## Acceptance criteria

- `/courses/[slug]` with no stored token redirects to `/login`.
- An unknown slug shows a not-found state, not a blank page or crash.
- A course with `hasAccess: false` never triggers a request to
  `GET /api/courses/{id}` and renders title/description/area/badge from
  the catalog data alone, no module list.
- A course with `hasAccess: true` renders real module and lesson counts
  and the real module list from `GET /api/courses/{id}` — no duration,
  certificate, price, or free-preview state anywhere on the page.
- The page uses the same nav and visual system as `/catalog`.
