# Admin — Course create/edit — Implementation plan

Spec: [`course-form.md`](course-form.md)

## Backend contracts used

- `POST /api/courses` (`CreateCourseRequest`: `Title, Slug, Description,
  ThumbnailUrl, DisplayOrder, PricingModel, PriceAmount,
  IssuesCertificate, IsFeatured, AreaIds[], Modules[]`) — `Modules`
  always sent as `[]` from this screen.
- `PUT /api/courses/{id}` (`UpdateCourseRequest`: same shape minus
  `Modules`) — no `Published` field; see below.
- `POST /api/courses/{id}/publish`, `POST /api/courses/{id}/unpublish`
  — both `ManageCourses`, no body.
- `GET /api/courses` (already consumed by `courses-panel.md`) — reused
  here to locate a single course by id for the edit form, since
  `GET /api/courses/{id}` is the student-facing `GetCourseDetailsUseCase`
  (403s an admin with no personal access — confirmed by reading it).
- `GET /api/areas` (already consumed elsewhere) — for the Área dropdown.

## New modules

- **`src/features/admin/lib/resolve-price-amount.ts`** — pure
  `resolvePriceAmount(pricingModel, rawInput: string): number | null` —
  `Free`/`EnrollmentControlled` → `null` unconditionally (mirrors the
  backend's own `Course.ValidatePriceAmount` rejecting a price on a free
  course); `Paid` → `Number(rawInput)`. Kept separate from the schema so
  the "what actually gets sent" logic is unit-testable without rendering
  a form.
- **`src/features/admin/schemas/course-form.schema.ts`** —
  `courseFormSchema`: `title, description, thumbnailUrl, pricingModel,
  priceAmount (raw string), areaId, displayOrder, issuesCertificate,
  isFeatured, published`. A `superRefine` requires `priceAmount` to be a
  valid positive number string when `pricingModel === 'Paid'`.
- **`src/features/admin/api/create-course.ts`**,
  **`update-course.ts`**, **`publish-course.ts`**,
  **`unpublish-course.ts`** — thin wrappers, all reusing `courseSchema`
  for response parsing.
- **`src/features/admin/hooks/admin.queries.ts`** — add
  `useCreateCourseMutation`, `useUpdateCourseMutation`,
  `usePublishCourseMutation`, `useUnpublishCourseMutation`.
- **Presentational** (`src/features/admin/components/`):
  - `admin-select.tsx` — boxed `<select>` matching `AdminField`'s visual
    language (dark box, uppercase label), used for the Área and Status
    dropdowns.
  - `pricing-model-picker.tsx` — the 3-option radio group; renders the
    BRL price input only when `Paid` is selected.
  - `course-form.tsx` — the shared create/edit form, structurally
    parallel to `area-form.tsx`: `useForm` + `zodResolver`, live slug
    from `slugify(watch('title'))`, mode-conditional sections (Status/
    Excluir curso/Pré-visualizar only in `edit`).
  - `course-form-page.tsx` — page-level: gates on `courses.manage`,
    loads the admin course list and finds the course by id for `edit`
    mode (`courses.find(c => c.id === courseId)`, per the spec's
    resolved decision), wires create/update + conditional publish/
    unpublish, and the unpublish-as-delete flow.
- **Routes**: `src/app/admin/courses/new/page.tsx`,
  `src/app/admin/courses/[courseId]/edit/page.tsx`.
- **`app-routes.ts`**: `admin.courseNew`, `admin.courseEdit(id)`.

## Wiring up the courses panel

`courses-panel.md`'s "Novo curso" button and course rows become real
links (`appRoutes.admin.courseNew` / `appRoutes.admin.courseEdit(id)`),
closing that spec's own inert-until-`1n`-exists note — same pattern as
`areas-list.md` → `area-form.md`.

## Submit flow (create)

1. `POST /api/courses` with `Modules: []`, `PriceAmount` from
   `resolvePriceAmount`, `AreaIds: [areaId]`.
2. On success, invalidate `queryKeys.admin.courses`, redirect to
   `/admin/courses`. No publish call — new courses always start as
   drafts (spec's "Open decisions").

## Submit flow (edit)

1. `PUT /api/courses/{id}` with the same field shape (minus `Modules`).
2. If `published` changed relative to the course's current
   `Published` (compared against the value the form was initialized
   with, not re-fetched), call `.../publish` or `.../unpublish`
   accordingly.
3. On success (both calls, when the second one fires), invalidate
   `queryKeys.admin.courses`, redirect to `/admin/courses`.

## Tests

- `resolve-price-amount.spec.ts` — `Free`/`EnrollmentControlled` always
  `null` regardless of input; `Paid` parses a valid string; `Paid` with
  garbage input (covered by the schema's `superRefine`, not this
  function — this function assumes valid input reaches it after
  validation passes).
- `course-form.spec.ts` — create vs. edit affordances (button label,
  Status/Excluir curso/Pré-visualizar visibility); live slug from title;
  price input only rendered for `Paid`.
- `courses-table.spec.ts` — extended: rows link to
  `appRoutes.admin.courseEdit(id)`.
- No page-level spec for `course-form-page.tsx`, same precedent as the
  other two admin page components.

## Manual verification (2026-09-07)

Same approach as the previous three admin screens: real backend (seed
admin, temporary env override) + real frontend, headless-driven:

- **Create**: filled title/description/area, submitted → redirected to
  `/admin/courses`, the new course's edit link resolved to a real
  course id.
- **Edit**: opened the created course, renamed it, toggled "Publicado"
  on, submitted → redirected back; confirmed via a follow-up
  `GET /api/courses` that the rename persisted **and** `published:
  true` — proving the separate `POST .../publish` call actually fired
  after the field update, not just the main `PUT`.
- **Delete**: reopened the edit page, clicked "Excluir curso", accepted
  the confirm dialog → redirected; `GET /api/courses` confirmed
  `published: false` afterward.
- No console errors in any step. Screenshots of the create and edit
  forms confirmed the layout matches the mockup closely, including the
  radio-selected pricing model, the two extra toggles (Emitir
  certificado / Curso em destaque), and the inert "Gerenciar módulos →"
  / present "Excluir curso" in edit mode only.

## Docs

- `README.md` / `src/features/README.md` — extend the admin bullet.
