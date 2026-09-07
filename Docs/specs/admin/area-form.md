# Admin — Area create/edit

## Why

The areas list (`/admin/areas`, see `Docs/specs/admin/areas-list.md`) is
read-only — "Nova área" and the per-row edit action were shipped inert
because this screen didn't exist yet. This spec closes that: staff with
the `areas.manage` permission can create a new area or edit an existing
one, including activating/deactivating it, from the same form the
mockup draws for both cases.

## Source

Design reference: artboard `1m` ("Área — criar/editar") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
The mockup only draws the **edit** state (breadcrumb "Áreas / Editar", a
populated "Cursos nesta área" panel, "Excluir área"). The **create**
state is the same layout with those edit-only pieces removed and empty
defaults — the mockup's own artboard name ("criar/editar") implies one
shared form, and nothing about the field set differs between the two
modes on the backend side (`POST /api/areas` and `PUT /api/areas/{id}`
take the same shape, `AccentColor` aside from `Active`/`DisplayOrder`
defaults).

## Goals

- Let an admin create a new area: name, description, accent color,
  display order. Defaults to active on creation (matches
  `CreateAreaUseCase` — `Area.Create` always starts active; there is no
  "create as inactive" option in the backend and the mockup's create
  affordance ("Nova área") doesn't suggest one either).
- Let an admin edit an existing area's name, description, accent color,
  display order, and active/inactive status.
- Show the read-only "Cursos nesta área" panel (title + Publicado/Rascunho
  per course) on the edit form, sourced from `GET /api/areas/{id}`'s
  `courses` field — no course management here (attaching/detaching a
  course to an area is course-side scope, not specced yet).
- Provide "Excluir área" on the edit form, per the resolved decision in
  `Docs/backend-pendencies/admin/areas-crud.md` (pendency 1): since no
  real `DELETE /api/areas/{id}` exists, this deactivates the area
  (`Active: false` via `PUT`) and returns to the areas list — a
  destructive-feeling, immediate action, distinct from toggling "Área
  ativa" in the form body and clicking "Salvar área".

## Non-goals

- Attaching or detaching courses from an area — the "Cursos nesta área"
  panel is read-only display.
- A real delete (the area row disappearing permanently) — see "Excluir
  área" above; this is a soft-deactivate, same posture as course
  deactivation.
- Renaming the `AreaAccentColor` backend enum members
  (`Blue`/`Green`/`Purple`/`Orange`) to match the mockup's actual swatch
  hues — see "Open decisions".
- Reordering areas via drag-and-drop — "Ordem de exibição" is a plain
  number input, matching how the mockup draws it (a text value, not a
  drag handle, unlike the module/lesson reordering drawn elsewhere).

## Page content

Shared shell: same `AdminSidebar` (`active="areas"`) as the areas list.

### Header

- Breadcrumb: "Áreas / Editar" (edit mode) or "Áreas / Nova área" (create
  mode — not in the mockup, derived to match the pattern).
- Title: the area's current name (edit) or "Nova área" (create, before a
  name is entered).
- "Cancelar" (→ back to `/admin/areas`, discards changes) and "Salvar
  área" / "Criar área" buttons.

### Form — left column

- **Nome da área**: required text input, max 150 chars
  (`AreaValidationLimits.NameMaxLength`).
- **Slug**: read-only, computed from "Nome da área" via slugify
  (lowercase, diacritics stripped, non-alphanumeric runs collapsed to a
  single `-`, no leading/trailing `-`) — matches the backend's own
  `Slug` value object pattern (`^[a-z0-9]+(?:-[a-z0-9]+)*$`,
  `Shared/Domain/ValueObjects/Slug.cs`). Not a form field the admin
  types into; recomputed live as the name changes. See "Open decisions."
- **Descrição**: optional textarea, max 500 chars
  (`AreaValidationLimits.DescriptionMaxLength`).
- **Cor de destaque**: 4 preset swatches, one selected — see "Open
  decisions" for the swatch → `AreaAccentColor` enum mapping.

### Form — right column

- **Status**: "Área ativa" toggle (edit mode only — see "Open
  decisions" on create-mode default).
- **Ordem de exibição**: required integer input (`DisplayOrder`).
- **Cursos nesta área** (edit mode only, only rendered when the area has
  at least one course): read-only list of `{ title, Publicado |
  Rascunho }` from `GET /api/areas/{id}`'s `courses` field.
- **Excluir área** (edit mode only): confirm, then `PUT` with
  `Active: false`, then redirect to `/admin/areas`.

### States

- **Loading** (edit mode only): while `GET /api/areas/{id}` is in
  flight, before the form has data to render.
- **Not found**: a 404 from `GET /api/areas/{id}` (bad/stale id) shows a
  "Área não encontrada." message with a link back to the list, instead
  of an empty/broken form.
- **Submit error**: a slug conflict (`409`, "An area with this slug
  already exists") is the one realistic conflict, surfaced as an inline
  form error tied to the read-only slug's source (the Nome field) since
  there's no slug input to attach it to directly; any other failure
  shows a generic retry-safe error banner, form stays populated (no data
  loss).
- **Forbidden**: same gating as the areas list — no `areas.manage`
  permission redirects to `/catalog` before the form ever renders.

## Open decisions

Resolved with the user on 2026-09-07:

- **Slug field behavior.** The mockup renders it with a visually
  distinct (darker, monospace) style from the editable Nome/Descrição
  fields, suggesting display-only. **Decision: auto-generate the slug
  from the name client-side and render it read-only** — no separate
  slug input, no way to set a slug that doesn't match the current name.
  This trades away the (rare) case of wanting a stable slug independent
  of a renamed area, in exchange for never producing a broken/duplicate
  slug by hand. Revisit if that trade-off turns out to matter in
  practice.

Carried over from `Docs/backend-pendencies/admin/areas-crud.md` (not
re-litigated, just applied here):

- **Accent-color swatch → enum mapping.** The backend's `AreaAccentColor`
  enum (`Blue`, `Green`, `Purple`, `Orange`) was named without access to
  this mockup's real swatch hues (per that file's pendency 3 note). The
  mockup's four swatches are, in order: `oklch(.62 .1 248)` (blue),
  `oklch(.65 .14 30)` (red/orange), `oklch(.7 .13 145)` (green),
  `oklch(.75 .13 85)` (yellow/gold) — the fourth doesn't read as
  "purple" at all. **Decision: map positionally by declaration order**
  (swatch 1 → `Blue`, 2 → `Orange`, 3 → `Green`, 4 → `Purple`) rather
  than block this screen on a backend rename. The mismatch between the
  4th swatch's actual color and the `Purple` label is cosmetic (an enum
  value name, never shown to an end user) — noted here instead of
  re-opening the backend pendency.
- **"Excluir área" = deactivate, not delete.** No real `DELETE
  /api/areas/{id}` exists; deactivating is the shipped behavior (see
  `areas-crud.md` pendency 1).

## Acceptance criteria

- `/admin/areas/new` renders an empty form; submitting calls
  `POST /api/areas` and redirects to `/admin/areas` on success.
- `/admin/areas/{id}/edit` loads the area via `GET /api/areas/{id}` and
  pre-fills the form, including the read-only "Cursos nesta área" panel
  when the area has courses; submitting calls `PUT /api/areas/{id}` and
  redirects to `/admin/areas` on success.
- The slug shown always matches `slugify(name)` live as the admin types,
  never a stale or independently-set value.
- "Excluir área" deactivates the area (`Active: false`) and returns to
  the list — it does not remove the area from `GET /api/areas`, only
  changes its status.
- A slug conflict on submit is shown as a form error, not a silent
  failure or a generic crash.
- Both routes redirect to `/catalog` for a user missing the
  `areas.manage` permission claim, same as the areas list.
- No course-attachment UI ships as part of this form.
