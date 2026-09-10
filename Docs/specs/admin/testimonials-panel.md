# Admin — Testimonials moderation panel

## Why

`Docs/specs/testimonials/submit-testimonial.md`-equivalent self-service
flow (see `Docs/backend-pendencies/2026-09-09-backend-changes-for-frontend.md`
item 7) ships every student-submitted testimonial unpublished
(`published: false`), pending admin review. The admin CRUD
(`GET /api/testimonials`, `.../publish`, `.../unpublish`) has existed
since 2026-09-07, but nothing in the frontend ever called it — this
spec builds `1ze` ("Painel admin — depoimentos (moderação)"), the
screen that closes that gap.

## Source

Design reference: artboard `1ze` ("Painel admin — depoimentos
(moderação)") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same admin shell as `courses-panel.md`/`audit-log-panel.md`.

## Goals

- List every testimonial (`GET /api/testimonials` — unpaginated, small
  dataset by nature), newest first, with a client-side status filter
  (Pendentes / Publicados / Todos — see "Open decisions", default
  Pendentes matching the mockup).
- Publish a pending testimonial (`POST /api/testimonials/{id}/publish`).
- Unpublish an already-published one (`POST /api/testimonials/{id}/unpublish`)
  — not drawn in the mockup's own example row (it only shows a
  published row with no actions), but the same symmetric
  publish/unpublish pattern already used for courses (`course-form.md`)
  and videos (`videos-panel.md`); leaving a published-but-regretted
  testimonial with no way back to unpublished would be a real gap, not
  a deliberate one.
- Reachable from `AdminSidebar`'s new "Depoimentos" item.

## Non-goals

- **"Rejeitar" as a distinct state from "Pendente".** The backend
  models `Published` as a single boolean — there is no third state, no
  reason field, no way to persist "an admin looked at this and said
  no" separately from "nobody has reviewed this yet". **Decision
  (resolved with the user 2026-09-10): drop the "Rejeitar" button
  entirely** rather than wire it to an action with no observable
  effect (calling `unpublish` on an already-unpublished testimonial
  changes nothing) — same posture already taken for the audit panel's
  unsupported action filter and the videos panel's unsupported
  "Vincular vídeo" button. See
  `Docs/backend-pendencies/admin/testimonials-panel.md` pendency 1.
- **Editing a testimonial's text/author/course.** `PUT /api/testimonials/{id}`
  exists but nothing in `1ze` draws an edit affordance — out of scope
  for this pass.
- **Deleting a testimonial.** No delete endpoint exists, by deliberate
  backend decision (same conservative "unpublish, don't remove" choice
  already applied to courses/areas/modules) — nothing here should imply
  otherwise.

## Page content

Route: `/admin/testimonials`. Shared shell: `AdminSidebar`
(`active="testimonials"`).

### Header

- Title: "Depoimentos".
- Subtitle: "`{n}` pendentes de revisão · depoimentos só aparecem no
  site depois de publicados" — `n` computed from the real list
  (`testimonials.filter(t => !t.published).length`), not the mockup's
  fixed "3".
- Filter control: "Filtrar: `{selected}` ▾" — a real, working
  client-side filter (Pendentes / Publicados / Todos), not dropped like
  the audit panel's — that screen's filter was rejected specifically
  because its data is paginated and a client-side filter would
  misrepresent the full history; this list is small and unpaginated, so
  filtering what's already fully loaded is accurate by construction.

### Table

Columns, in order: Aluno · curso, Depoimento, Status, Ações. One row
per testimonial matching the active filter, newest (`createdAt`) first:

- **Aluno · curso**: `AuthorName`, and beneath it, the course title
  resolved from `CourseId` against the already-loaded admin course list
  (`GET /api/courses`, the same one `courses-panel.md` already fetches)
  — "—" when `CourseId` is null (the self-service form allows
  submitting with no course selected) or the id isn't found.
- **Depoimento**: `Quote`, truncated with `line-clamp` (the mockup
  shows a fixed short excerpt per row; real quotes run up to 1000
  characters — see `Docs/backend-pendencies/2026-09-09-backend-changes-for-frontend.md`
  item 7).
- **Status**: "Pendente" (muted) or "Publicado" (accent blue), from
  `Published`.
- **Ações**: for a pending row, "Publicar" (pill button). For a
  published row, "Despublicar" (see "Goals") plus the relative time
  since `UpdatedAt` (matches the mockup's own "há 4 dias" on its one
  published example row, reusing the same `formatRelativeTime` helper
  already built for `courses-panel.md`/`audit-log-panel.md`).

### States

- **Loading**: "Carregando…" in place of the table.
- **Error**: retry-safe inline message + button, same pattern as every
  other admin list.
- **Empty**: "Nenhum depoimento encontrado." when the active filter
  matches nothing (e.g. "Pendentes" with everything already reviewed).
- **Forbidden**: gated on `courses.manage` (`ManageCourses`) — the
  backend reuses that policy for every testimonial admin action rather
  than introducing a new one (see pendency 2), so this screen does the
  same instead of inventing a permission the backend doesn't check.

## Open decisions

Resolved with the user on 2026-09-10:

- **"Rejeitar" has no backing state on the backend.** **Decision: drop
  it entirely**, keep only "Publicar" for pending rows (see
  "Non-goals").

Derived without needing to ask (mechanical, consistent with precedent):

- **Client-side filter is implemented for real** (unlike the audit
  panel's dropped one) — this list isn't paginated, so filtering
  already-fully-loaded data can't misrepresent anything.
- **"Despublicar" added for published rows**, symmetric with every
  other publish/unpublish surface in this admin section.
- **Gated on `courses.manage`**, matching the backend's own policy
  reuse for every testimonial admin route.

## Acceptance criteria

- `/admin/testimonials` renders the header (with a real pending count),
  filter, table, from `GET /api/testimonials`.
- The filter narrows to Pendentes/Publicados/Todos accurately, client-side.
- "Publicar" on a pending row calls `POST .../publish` and the row
  moves to "Publicado" without a manual page refresh.
- "Despublicar" on a published row calls `POST .../unpublish` and the
  row moves back to "Pendente" without a manual page refresh.
- No "Rejeitar" control appears anywhere on the page.
- "Depoimentos" in `AdminSidebar` links here.
- Gated on `courses.manage`; forbidden otherwise.
