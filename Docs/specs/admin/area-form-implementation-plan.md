# Admin — Area create/edit — Implementation plan

Spec: [`area-form.md`](area-form.md)

## Backend contract used

Confirmed against the current CourseCore source:

- `POST /api/areas` (`CreateAreaRequest`: `Name`, `Slug`, `Description`,
  `DisplayOrder`, `AccentColor`) → `AreaResponse`, `201`.
- `PUT /api/areas/{id}` (`UpdateAreaRequest`: adds `Active` to the same
  shape) → `AreaResponse`, `200`.
- `GET /api/areas/{id}` → `AreaResponse` including `courses:
  [{ id, title, slug, published }]`; `404` if the id doesn't exist.
- Both write endpoints validate: `Name` required, ≤150 chars
  (`AreaValidationLimits.NameMaxLength`); `Description` ≤500 chars;
  `Slug` ≤180 chars and must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
  (`Shared/Domain/ValueObjects/Slug.cs`); `AccentColor` must parse as one
  of the `AreaAccentColor` enum names (`Blue`/`Green`/`Purple`/`Orange`,
  case-insensitive); a slug collision with a different area throws a
  `409 Conflict` ("An area with this slug already exists").

## New modules

- **`src/features/admin/lib/slugify.ts`** — pure `slugify(value): string`,
  mirrors the backend's `Slug` pattern (NFD-normalize, strip combining
  diacritics, lowercase, collapse non-alphanumeric runs to `-`, trim
  leading/trailing `-`). Computed live off the `name` field's current
  value in the form — no separate slug state.
- **`src/features/admin/lib/accent-color.ts`** — `ACCENT_COLOR_OPTIONS`
  (the 4 swatches, positionally mapped to the backend enum — see the
  spec's "Open decisions") and `DEFAULT_ACCENT_COLOR = 'Blue'`.
- **`src/features/admin/schemas/area-form.schema.ts`** — `areaFormSchema`
  (name/description/displayOrder/accentColor/active) for React Hook Form
  + zod. `displayOrder` is a plain `z.number()` (not `z.coerce.number()`
  — coercion breaks `zodResolver`'s form-value type inference against
  `useForm<T>`'s single generic; the input is instead registered with
  RHF's own `{ valueAsNumber: true }`, which achieves the same string→
  number conversion without the type mismatch).
- **`src/features/admin/api/{get-area,create-area,update-area}.ts`** —
  thin `apiFetch` wrappers, reusing `areaSchema` for response parsing
  (already built for the areas list).
- **`src/features/admin/hooks/admin.queries.ts`** — added `useAreaQuery`
  (id, `retry: false` so a 404 doesn't retry pointlessly),
  `useCreateAreaMutation`, `useUpdateAreaMutation`.
- **Presentational pieces** (`src/features/admin/components/`):
  `admin-field.tsx` / `admin-textarea-field.tsx` (boxed dark-background
  inputs, matching the admin mockup's visual language — distinct from
  the auth flow's underline-style `FormField`, since the two sections
  use different visual languages already), `status-toggle.tsx` (generic
  on/off switch, not area-specific), `accent-color-picker.tsx` (4
  swatches, `aria-pressed` on the selected one), `area-courses-panel.tsx`
  (read-only, renders `null` when the area has no courses).
- **`area-form.tsx`** — the shared create/edit form (React Hook Form +
  `zodResolver(areaFormSchema)`), composing the pieces above. Renders
  the slug as a read-only box (`slugify(watch('name'))`), hides the
  status toggle and "Excluir área" in `create` mode.
- **`area-form-page.tsx`** — page-level component: gates on
  `authPermissions.manageAreas` (same as the areas list), loads the area
  for `edit` mode, wires both mutations, handles the 401/404/generic-error/
  409-conflict states, and the "Excluir área" confirm→deactivate→redirect
  flow (`window.confirm`, then `PUT` with `Active: false`).
- **Routes**: `src/app/admin/areas/new/page.tsx` and
  `src/app/admin/areas/[areaId]/edit/page.tsx` (the latter using Next.js
  16's typed `PageProps<'/admin/areas/[areaId]/edit'>`, same pattern as
  `/courses/[slug]`).
- **`app-routes.ts`** — `admin.areaNew`, `admin.areaEdit(id)`.
- **`query-keys.ts`** — `admin.area(id)`.

## Wiring up the areas list (closing the loop from `areas-list.md`)

That spec's open decision explicitly said to revisit the inert "Nova
área" button and row click once this screen existed. Both are now real:
`AreasListPage`'s button is a `Link` to `appRoutes.admin.areaNew`, and
each `AreasTable` row is a `Link` to `appRoutes.admin.areaEdit(area.id)`
(the whole row, not a separate "editar" affordance — the mockup doesn't
draw a distinct per-row action for this table, unlike the course cards
elsewhere in the mockup that do have an explicit "⋮" menu).

## Manual verification (2026-09-07)

Backend (seed admin, same temporary env-var approach as the areas-list
verification) + frontend running locally, driven with a headless
Chromium (Playwright) script — create → edit → delete, checked against
both the UI and a follow-up `GET /api/areas` call:

- **Create**: filled Nome/Descrição/Ordem, submitted → redirected to
  `/admin/areas`, the new area appeared in the table with the live
  computed slug (`/area-de-teste-playwright`) and `Ativa` status.
- **Edit**: opened the created area's edit page (row click → real
  `areaId` in the URL), renamed it, submitted → redirected back, the
  rename persisted (confirmed via `GET /api/areas`, not just the
  redirect itself).
- **Delete**: reopened the edit page, clicked "Excluir área", accepted
  the confirm dialog → redirected to the list;
  `GET /api/areas` confirmed `active: false` on that area afterward — a
  real deactivation, not a no-op.
- No console errors in any of the three steps.
- The edit form screenshot confirmed the visual layout matches the
  mockup closely: breadcrumb, Nome/Slug/Descrição/Cor de destaque on the
  left, Área ativa toggle + Ordem de exibição + Excluir área on the
  right, and the courses panel correctly omitted for an area with zero
  courses (per spec, it only renders when non-empty).

## Tests

- `slugify.spec.ts` — accent stripping, punctuation/whitespace
  collapsing, leading/trailing trim, empty input.
- `area-form.spec.ts` — create vs. edit mode affordances (button label,
  status toggle, delete link presence); live slug rendering from the
  name; the courses panel rendering when courses are given; the
  submit-error banner.
- `areas-table.spec.ts` — extended with a test that each row links to
  `appRoutes.admin.areaEdit(id)`.
- `area-form-page.spec.ts` — **not added**, same precedent as
  `areas-list-page.spec.ts` in the previous spec (no page-level spec
  exists for any hook-wired page component in this codebase; covered by
  the manual verification above instead).

## Docs

- `README.md` — extend the admin bullet to mention create/edit.
- `src/features/README.md` — extend the `admin/` bullet.
