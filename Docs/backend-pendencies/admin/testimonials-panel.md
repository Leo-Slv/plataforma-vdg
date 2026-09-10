# Backend Pendencies — Admin panel: Testimonials moderation (artboard `1ze`)

Mirrors [`Docs/specs/admin/testimonials-panel.md`](../../specs/admin/testimonials-panel.md).
The admin CRUD (`GET /api/testimonials`, `.../publish`, `.../unpublish`)
already existed (`Docs/backend-pendencies/landing/landing-page.md`
pendency 3) — this screen isn't blocked outright. One real gap.

## 1. No "Rejeitado" state distinct from "Pendente" — Feature gap — CLOSED (won't implement)

- **Mockup expects**: a "Rejeitar" button next to "Publicar" on every
  pending row, implying a three-state moderation flow (Pendente /
  Publicado / Rejeitado).
- **Backend today**: `Testimonial`
  (`Modules/Testimonials/Domain/Entities/Testimonial.cs`) models
  moderation as a single `Published` boolean — `false` means "not
  publicly visible," with no distinction between "nobody has reviewed
  this yet" and "an admin reviewed and declined it." There's no
  `Rejected`/`Status` enum, no reason/notes field, and no delete
  endpoint (a deliberate, separate decision — see
  `Docs/backend-pendencies/2026-09-09-backend-changes-for-frontend.md`
  item 7 — a bad testimonial gets unpublished, not removed).
- **What closing the gap would need**: a real tri-state field (e.g. a
  `TestimonialStatus` enum: `Pending`/`Published`/`Rejected`) replacing
  or alongside `Published`, a migration, and a new
  `POST /api/testimonials/{id}/reject` (or similar) endpoint.
- **Workaround shipped**: none — the "Rejeitar" button doesn't render
  at all. Wiring it to `POST .../unpublish` was considered and
  rejected: calling unpublish on an already-unpublished (pending)
  testimonial has zero observable effect, so the button would exist
  and be clickable while doing nothing — worse than not showing it,
  since it implies an action was taken when nothing was persisted.
- **Severity**: Feature gap — the screen fully works for the one
  concrete action that has real backing (publish, and its natural
  inverse unpublish); the cost is that admins can't record "I looked at
  this one and it's not going up" as a distinct fact from "nobody's
  looked at this yet" — a rejected testimonial looks identical to a
  fresh submission indefinitely.
- **Decision (2026-09-10)**: won't implement for now. Revisit if the
  volume of self-submitted testimonials grows enough that "still
  pending vs. already declined" becomes a real triage problem — at
  that point, add the tri-state field and endpoint above.
