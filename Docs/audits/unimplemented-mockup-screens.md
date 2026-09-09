# Mockup screens with no implemented route (desktop only)

Snapshot date: 2026-09-09. Cross-references every desktop artboard in
[`Docs/design/mockups/Plataforma VDG.html`](../design/mockups/Plataforma%20VDG.html)
against `src/app/**/page.tsx` and `src/lib/routes/app-routes.ts`. Mobile
artboards (`1b`, `1t`, `1u`, `1v`, `1w`, `1x`, `2a`–`2p`) are out of scope for
this pass. Companion to
[`Docs/audits/unused-backend-endpoints.md`](unused-backend-endpoints.md),
which tracks backend capabilities the frontend doesn't consume yet — several
rows below line up directly with endpoints listed there.

## A. Full desktop artboard inventory (23)

| Label | Title | Description |
|---|---|---|
| 1a | Landing page — desktop | Public marketing home page (hero, feature/value sections, testimonials) |
| 1c | Cadastro (Turnstile) | Registration form with Cloudflare Turnstile captcha |
| 1d | Login | Login form |
| 1e | Confirmação de e-mail — estado bloqueado | Blocked/gated state shown before a user confirms their email |
| 1f | Catálogo de cursos | Course catalog/listing grid |
| 1g | Página do curso | Course detail page (description, modules, pricing/CTA) |
| 1h | Player de aula + progresso | Video lesson player with watch-progress tracking |
| 1i | Checkout — Pix / cartão | Payment checkout flow (Pix/credit card) |
| 1j | Meus cursos — dashboard do aluno | Student's "my courses" dashboard |
| 1k | Painel admin — cursos e áreas | Admin panel listing courses and areas together |
| 1l | Áreas — lista | Admin: list of content areas |
| 1m | Área — criar/editar | Admin: create/edit an area form |
| 1n | Curso — criar/editar | Admin: create/edit a course form |
| 1o | Curso → Módulos e aulas | Admin: manage a course's modules and lessons |
| 1p | Aula — criar/editar | Admin: create/edit a lesson |
| 1q | Usuários — lista | Admin: users list |
| 1r | Usuário — editar acesso | Admin: edit a user's access (roles/area grants/status) |
| 1s | Tela de carregamento | Generic app loading/spinner screen |
| 1y | Menu do perfil (dropdown) | Profile dropdown menu (nav bar) — edit profile / logout |
| 1z | Editar perfil | Edit-profile screen |
| 1zb | Enviar depoimento | Form for a student to submit a testimonial |
| 1zc | Painel admin — vídeos | Admin: videos management panel |
| 1zd | Painel admin — auditoria | Admin: audit log panel |

## B. Implemented frontend routes

- `/` (landing)
- `/register`, `/login`, `/confirm-email`
- `/catalog`
- `/courses/[slug]`, `/courses/[slug]/lessons/[lessonId]`
- `/my-courses`
- `/profile`
- `/admin/areas`, `/admin/areas/new`, `/admin/areas/[areaId]/edit`
- `/admin/courses`, `/admin/courses/new`, `/admin/courses/[courseId]/edit`, `/admin/courses/[courseId]/modules`
- `/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/edit`
- `/admin/users`, `/admin/users/[userId]/edit`
- `src/app/loading.tsx` — a global fallback, not a routed page, but is what implements `1s`

Two route constants exist with **no `page.tsx` behind them**:
`appRoutes.auth.forgotPassword` (`/forgot-password`) and
`appRoutes.auth.changeEmail` (`/change-email`) — reserved but unbuilt. Neither
has a matching mockup artboard in this file, so they're a backend-endpoint
gap (see `unused-backend-endpoints.md`, `POST /api/auth/forgot-password` /
`POST /api/auth/reset-password`) rather than a mockup gap, and aren't counted
below.

`1y` ships as the `AppNav` dropdown component (`src/components/app-nav.tsx`),
not a standalone route — correctly so, it's a nav element, not a screen.

## C. Diff — desktop mockup screens with no implemented route (4)

| Label | Screen | Status |
|---|---|---|
| `1i` | Checkout — Pix/cartão | **Not implemented, deliberately.** Per `Docs/backend-pendencies/README.md`: no payment/checkout endpoint exists at all — an explicit backend non-goal, not a missing field. Nothing to build against until that changes on the CourseCore side. |
| `1zb` | Enviar depoimento | **Not implemented.** Only the read side exists (`GET /api/testimonials/public`, rendered by `testimonials-section.tsx` on the landing page). The full admin CRUD + this submission form are unbuilt — see `unused-backend-endpoints.md`'s testimonials cluster (5 endpoints: list/create/update/publish/unpublish). No spec or backend-pendency doc exists yet for this screen. |
| `1zc` | Painel admin — vídeos | **Not implemented.** No `/admin/videos` route, no spec, no pendency entry. The backend has `GET/PUT/DELETE /api/videos/lessons/{lessonId}` (already used per-lesson from the lesson editor) plus a standalone `POST /api/videos` — a dedicated videos *panel* (cross-lesson list/management) has no frontend counterpart at all. |
| `1zd` | Painel admin — auditoria | **Not implemented.** No `/admin/audit` route or spec, even though `GET /api/audit-logs` already works and is called elsewhere per `unused-backend-endpoints.md`'s "already consumed" list — wait, that endpoint is actually already wired into the frontend (used by `Docs/specs/admin/courses-panel.md`'s side panel), but there is no dedicated full-page audit screen matching this artboard's "own panel" design. |

Everything else maps 1:1 to a working route: `1a/1c/1d/1e/1f/1g/1h/1j`
directly; `1k/1l/1m/1n/1o/1p/1q/1r` (all admin CRUD) are fully built with
matching specs under `Docs/specs/admin/`; `1s` ships as the global
`loading.tsx`; `1y` ships as `AppNav`'s dropdown; `1z` shipped 2026-09-09
(see `Docs/specs/auth/profile.md`).

## Documentation staleness found during this pass

`Docs/backend-pendencies/README.md`'s "Skipped screens" table still marks
`1k`, `1l`, `1m`, `1n` as "backend gap resolved as of the 2026-09-07
snapshot — should be revisited" even though they were, in fact, already
built (`src/app/admin/areas/*`, `src/app/admin/courses/*`, plus specs
`areas-list.md`, `area-form.md`, `courses-panel.md`, `course-form.md` all
exist). The sibling rows for `1o/1p/1q/1r` were correctly updated to say
"Built" when those shipped — `1k/1l/1m/1n`'s rows were just never touched
afterward. Worth a follow-up edit to that table; not corrected here since
it's out of scope for this audit pass.

## Takeaway

Combined with the backend-endpoint audit, three natural next builds stand
out, in priority order:

1. **`1zb` Enviar depoimento** (+ admin testimonials CRUD) — mockup exists,
   all 5 backend endpoints exist, nothing blocking a full spec-to-ship pass.
2. **`1zd` Painel admin — auditoria** — backend endpoint already live and
   already partially surfaced elsewhere; a dedicated screen is mostly a
   presentation-layer exercise reusing an existing data source.
3. **`1zc` Painel admin — vídeos** — backend mostly there
   (`GET/PUT/DELETE .../videos/lessons/{lessonId}`, plus standalone
   `POST /api/videos`), but likely needs backend-pendency scoping first: no
   endpoint lists videos independent of a lesson today, so a cross-lesson
   "videos panel" may need a new list endpoint before it can show more than
   one row at a time.

`1i` (checkout) stays out of scope until CourseCore adds a payment endpoint
— that's a backend decision, not a frontend one.
