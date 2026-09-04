# Course Catalog Page

## Why

`/login` and a confirmed `/confirm-email` both point at `appRoutes.catalog
.index` (`/catalog`) — still a stub since the landing page first linked
to it. This is the first screen of the actual authenticated app (past
the auth flow's centered-card screens): browse every area and course,
see what you already have access to, and what needs a grant or
purchase.

## Source

Design reference: artboard `1f` ("Catálogo de cursos") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same dark palette/type system as the rest of the app, but a different
shell: a top app nav (brand mark, Catálogo/Meus cursos/Certificados,
user avatar) instead of the auth screens' centered card — this is the
first screen using it.

**This mockup shows meaningfully more than the current backend can
provide** — prices, durations, progress, certificates. The next section
goes through this in detail because it drives most of this spec's
decisions; skimming it will make the rest of the document confusing.

## What the backend actually returns

`GET /api/courses/available` (Bearer, optional `?hasAccess=true|false`
query filter) → `CourseCatalogResponse`:

```
Areas:   { id, name, slug, displayOrder }[]
Courses: { id, title, slug, description, thumbnailUrl, displayOrder,
           pricingModel /* "Free" | "Paid" */, areaIds[], hasAccess }[]
```

That's the entire shape (`CourseCatalogItemResponse.cs`,
`AreaSummaryResponse.cs`). No search/text query param exists — the
`hasAccess` filter is the only one. Both collections come back in full,
every time; there's no pagination.

### What's in the mockup that isn't in that response

| Mockup shows | Backend has it? | Where it actually lives (if anywhere) |
|---|---|---|
| "24 aulas · 7h", "8 módulos" | No | `CourseDetailsResponse.Modules` — but only via `GET /api/courses/{id}`, one course at a time. Fetching that for every catalog card would be 18 extra requests for a list screen. |
| "66% concluído · retomar", a progress bar | No | `GET /api/progress/courses/{courseId}` — again per-course, nothing bulk. This is what a "Meus cursos" dashboard (mockup `1j`, not specced) is for, not a catalog grid. |
| "R$ 149", "R$ 99" (actual prices) | No | `PricingModel` is a **string enum, `"Free"` or `"Paid"` — no amount field anywhere in the domain.** There's no price to show, ever, with the current schema. |
| "Por concessão" (a third, grant-only category, no price shown) | No | Only two `PricingModel` values exist. This isn't a real category to reproduce — see "Access states" below for what replaces it. |
| "Certificado emitido" / "Certificado ao concluir", the "Certificados" nav item | No | Zero certificate-related code anywhere in the backend (`grep -r Certificate` across `Modules/` — no hits). Not a gap in one endpoint; the concept doesn't exist. |
| "Solicitar acesso" | No | No request/approval endpoint. Access is granted by an admin via `UserAreaAccess`/`RoleAreaAccess` directly — there's no self-service request to trigger. |

None of this is a small adaptation — it's most of what makes the mockup's
cards feel rich. The plan below is to build the catalog the current API
actually supports well, not to fake the rest with placeholder numbers.

## Goals

- List every active area and every published course the account can see,
  grouped by area, matching the mockup's layout (area header + a
  horizontally scrollable row of course cards) as closely as the real
  data allows.
- Distinguish, per course, using only `pricingModel` + `hasAccess`:
  unlocked (open it), free-but-not-yet-unlocked (shouldn't normally
  happen once confirmed, but the states aren't mutually exclusive in the
  data — handle it the same as unlocked once `hasAccess` is true
  regardless of `pricingModel`), and locked/paid (no purchase flow —
  informational only, matching the backend spec's own non-goal on
  payments).
- Working area filter pills and a working title search — both client-side
  over the single already-fetched list, no server round-trip per
  keystroke or click.
- Visible to any authenticated user regardless of e-mail confirmation
  (backend spec rule 9 — this screen doesn't add its own gate beyond
  "is there a session at all").

## Non-goals

- **Anything from the "what's missing" table above** — durations, module/
  lesson counts, progress, real prices, certificates, request-access.
  Revisit each only if/when the backend actually exposes it; this spec
  doesn't invent client-side numbers to fill the visual gap.
- **The course detail page** (mockup `1g`) — a course card's target route
  exists (`appRoutes.courses.detail(slug)`, new) but renders nothing yet,
  same stub treatment every other not-yet-built destination in this repo
  has gotten.
- **"Meus cursos" / "Certificados" nav items** — inert text, same
  treatment the landing page gave its own placeholder nav (`Cursos`,
  `Áreas`, `Sobre a escola`). Certificados doubly so, since there's
  nothing behind it at all (see table above).
- **A shared authenticated app-shell component.** This is the first
  screen using the top-nav layout instead of the auth screens' centered
  card; it stays local to this feature until a second screen (course
  detail, "Meus cursos") actually needs the same shell — same reasoning
  already applied to not extracting an auth-card shell before login
  existed.
- **Showing fewer than all fetched areas by default** ("mais 2 áreas ·
  Ver todas as áreas →" in the mockup). Everything the backend returns
  is already in memory in one response; gating some of it behind a
  second click has no functional reason once there's no pagination to
  hide latency for. Render every area returned.

## Access states (replaces the mockup's three-way price badge)

With only `pricingModel` (`Free`/`Paid`) and `hasAccess` (bool) to work
with, a course renders one of two ways:

- **`hasAccess: true`** — full-color card, no badge. Clickable toward
  the course (stub route today).
- **`hasAccess: false`** — dimmed card (mirrors the mockup's `opacity:
  .55` treatment on its one locked example), badge reads "Gratuito" if
  `pricingModel` is `Free` (shouldn't normally appear once confirmed,
  but the API allows it, e.g. an unconfirmed session) or "Pago" if
  `Paid`. No price amount, no "solicitar acesso" line, no separate
  "por concessão" styling — one locked state covers every reason access
  might be missing, because the API doesn't say why it's missing.

## Page content

Top nav (new shell, not the auth screens' card):

- Brand mark (32px).
- "Catálogo" (current, underlined), "Meus cursos", "Certificados" —
  inert text except "Catálogo".
- User's first name + an initials avatar (from the stored account name —
  see "Storing the account name").

Page body:

- H1 "Catálogo" + a subtitle built from the real counts (`{courses
  .length} cursos organizados em {areas.length} áreas`), not the
  mockup's hardcoded "18 cursos... 6 áreas".
- Filter pills: "Todas as áreas" + one per fetched area, client-side
  toggle.
- Search input, client-side substring match against course titles.
- One section per area (all of them — see "Non-goals"): eyebrow ("Área
  0N" by position), area name, course count for that area, a "N cursos
  →" control that's equivalent to selecting that area's filter pill (a
  real interaction, not decorative), then a horizontally scrollable row
  of that area's courses (native `overflow-x-auto`, the mockup's
  fade-mask hint on the trailing edge carries over as a CSS mask, no
  custom carousel JS needed).
- Course card: striped placeholder cover (matches every other course
  card in this app so far), avatar + title + `{area} · {description}`
  (description substitutes for the meta line the mockup filled with
  module/status copy this API can't provide), the access-state badge
  from above, inert "⋮".

## Storing the account name

`AuthResponse.name` already exists (used nowhere yet). Same treatment as
the e-mail addition from the confirm-email work: `getUserName()`/
`setUserName()` join `access-token.ts`'s stored pair, saved by
register/login's `onSuccess` alongside the token and e-mail. Needed here
for the nav's name + initials; not needed by any earlier screen, which
is why it wasn't added until now.

## Behavior

### On mount

Same base auth gate as `/confirm-email` (redirect to `/login` if no
stored access token) — but **not** the confirm-email gate itself; per
backend rule 9 the catalog is visible unconfirmed.

### Data

`GET /api/courses/available` (no `hasAccess` filter — this screen shows
everything, locked included, same as the mockup). Loading and error
states follow the same `isApiError` branching pattern as every other
screen: `401` → redirect to `/login` (broken session); network/`500` →
a retry-able error state (this is the first screen that can fail to load
its *primary* content, unlike the auth screens where failure is always
about a form submission — needs its own empty/error treatment, detailed
in the implementation plan).

### Filters

Area pill + search text are independent, composable client-side filters
over the one fetched list — no loading state, no request.

## Acceptance criteria

- `/catalog` with no stored access token redirects to `/login`.
- With a session (confirmed or not), the page loads and renders every
  area returned, each with its courses, matching real counts in the
  subtitle.
- A course with `hasAccess: true` renders unlocked; `false` renders
  dimmed with a Gratuito/Pago badge — no invented price, duration, or
  progress data anywhere on the page.
- Area pills and search both filter the already-loaded list with no
  additional request.
- A network/`500` failure loading the catalog shows a retry option, not
  a blank page.
- Clicking a course card navigates to its stub detail route; nothing
  else on the page (kebab menu, "Meus cursos", "Certificados") does
  anything beyond what's stated above.
