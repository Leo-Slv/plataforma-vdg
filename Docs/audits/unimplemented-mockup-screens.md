# Mockup screens with no implemented route (desktop only)

Snapshot date: 2026-09-14. Cross-references every desktop artboard in
[`Docs/design/mockups/Plataforma VDG.html`](../design/mockups/Plataforma%20VDG.html)
against `src/app/**/page.tsx` and `src/lib/routes/app-routes.ts`. Mobile
artboards (`1b`, `1t`, `1u`, `1v`, `1w`, `1x`, `2a`–`2q`) are out of scope for
this pass — this is a single responsive app, not separate mobile routes, so
"implemented or not" doesn't apply the same way; whether each breakpoint
actually matches its mobile artboard is a separate, unaudited question.
Companion to
[`Docs/audits/unused-backend-endpoints.md`](unused-backend-endpoints.md),
which tracks backend capabilities the frontend doesn't consume yet.

Supersedes the 2026-09-09 snapshot of this file: the mockup itself grew two
new artboards since then (`1ze`, `1zf`), and every screen that snapshot
tracked as unbuilt (`1zb`, `1zc`, `1zd`) has since shipped.

## A. Full desktop artboard inventory (25)

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
| 1ze | Painel admin — depoimentos (moderação) | Admin: moderate (publish/unpublish) submitted testimonials — new artboard, not in the 2026-09-09 inventory |
| 1zf | Vídeo — editar | Admin: edit a single video's metadata/visibility — new artboard, not in the 2026-09-09 inventory |

## B. Implemented frontend routes

- `/` (landing)
- `/register`, `/login`, `/confirm-email`
- `/catalog`
- `/courses/[slug]`, `/courses/[slug]/lessons/[lessonId]`
- `/my-courses`
- `/profile`
- `/testimonials/new`
- `/admin/areas`, `/admin/areas/new`, `/admin/areas/[areaId]/edit`
- `/admin/courses`, `/admin/courses/new`, `/admin/courses/[courseId]/edit`, `/admin/courses/[courseId]/modules`
- `/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/edit`
- `/admin/users`, `/admin/users/[userId]/edit`
- `/admin/videos`, `/admin/videos/[videoId]`
- `/admin/audit`
- `/admin/testimonials`
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

## C. Diff — desktop mockup screens with no implemented route (1)

| Label | Screen | Status |
|---|---|---|
| `1i` | Checkout — Pix/cartão | **Not implemented, deliberately.** Per `Docs/backend-pendencies/catalog/course-detail.md` pendency 6: no payment/checkout endpoint exists at all — an explicit backend non-goal, not a missing field. Building it would mean fabricating a price, installments, and a Pix QR code with no real concept behind any of them. Decision recorded 2026-09-04: skip the screen (no spec, no plan) until CourseCore has a real payments module. |

Everything else maps 1:1 to a working route: `1a/1c/1d/1e/1f/1g/1h/1j`
directly; `1k/1l/1m/1n/1o/1p/1q/1r` (all admin CRUD) are fully built with
matching specs under `Docs/specs/admin/`; `1s` ships as the global
`loading.tsx`; `1y` ships as `AppNav`'s dropdown; `1z` shipped 2026-09-09
(see `Docs/specs/auth/profile.md`); `1zb`, `1zc`, `1zd`, `1ze`, `1zf` all
shipped since the last snapshot (see section D).

## D. Documentation gap found during this pass

Three of the screens that shipped since 2026-09-09 skipped step 1 of the
`CLAUDE.md` implementation workflow — no spec was written before or after
implementing:

| Label | Screen | Route | Commit | Spec? |
|---|---|---|---|---|
| `1zb` | Enviar depoimento | `/testimonials/new` | `1f7d821` | **Missing** |
| `1zc` | Painel admin — vídeos | `/admin/videos` | `9087031` | **Missing** |
| `1zf` | Vídeo — editar | `/admin/videos/[videoId]` | `9087031` | **Missing** |
| `1zd` | Painel admin — auditoria | `/admin/audit` | `56ac0ef` | Has spec (`Docs/specs/admin/audit-log-panel.md`) |
| `1ze` | Painel admin — depoimentos (moderação) | `/admin/testimonials` | `f0de347` | Has spec (`Docs/specs/admin/testimonials-panel.md`) |

This is a documentation debt, not a functional gap — the three unspecced
screens are implemented and routed. If they need revisiting later (bug
fixes, backend contract changes), there's no spec to check against; writing
retroactive specs for `1zb`/`1zc`/`1zf` would close that.

## Takeaway

As of 2026-09-14, every desktop mockup artboard has a working route except
`1i` (checkout), which stays out of scope by deliberate decision — no
payment/checkout endpoint exists at all in CourseCore, an explicit backend
non-goal, not a missing field. The remaining open item on the frontend side
is documentation debt (missing specs for `1zb`/`1zc`/`1zf`), not a missing
screen.
