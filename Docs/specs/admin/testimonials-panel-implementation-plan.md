# Admin — Testimonials moderation panel — implementation plan

Implements [`Docs/specs/admin/testimonials-panel.md`](testimonials-panel.md).

## Data layer (`src/features/admin/`)

New — mirrors the existing admin `video`/`course` slices, kept separate
from `src/features/testimonials/` (the student-facing self-service
submission feature has its own, smaller schema without admin-only
fields like `submittedByUserId`'s full shape needs; the admin one maps
1:1 to `TestimonialResponse`, same split already used for
`admin/schemas/course.schema.ts` vs. `catalog/schemas/course-catalog.schema.ts`).

- `schemas/testimonial.schema.ts` — `testimonialSchema`: `id`,
  `authorName`, `quote`, `avatarUrl` (nullable), `courseId` (nullable),
  `published`, `submittedByUserId` (nullable), `createdAt`, `updatedAt`.
- `model/testimonial.ts` — `Testimonial` (`z.infer`).
- `api/get-testimonials.ts` — `getTestimonials()`:
  `apiFetch('/api/testimonials')` parsed as `z.array(testimonialSchema)`
  (unpaginated, matches the backend's own shape).
- `api/publish-testimonial.ts` — `publishTestimonial(id)`: `POST
  /api/testimonials/{id}/publish`.
- `api/unpublish-testimonial.ts` — `unpublishTestimonial(id)`: `POST
  /api/testimonials/{id}/unpublish`.

## Query layer

- `src/lib/routes/app-routes.ts` — add `admin.testimonials: '/admin/testimonials'`.
- `src/lib/constants/query-keys.ts` — add `admin.testimonials: ['admin', 'testimonials'] as const`.
- `src/features/admin/hooks/admin.queries.ts` — add:
  - `useTestimonialsQuery(options)` — `useQuery`, `queryKeys.admin.testimonials`.
  - `usePublishTestimonialMutation()` / `useUnpublishTestimonialMutation()`
    — plain `useMutation`s, same shape as `useActivateVideoMutation`/`useUnlistVideoMutation`.

## Components

- `lib/resolve-course-title.ts` — new, tiny: `(courseId: string | null, courses: Course[]) => string` —
  `'—'` when null or not found, else `course.title`. Reused instead of
  inlining the same `.find()` + fallback three times (table rows +
  header count uses nothing from it, just the table body).
- `components/testimonials-table.tsx` — new. Props: `testimonials`,
  `courses`, `pendingId` (mutation-in-flight row), `onPublish`,
  `onUnpublish`. Renders the four-column table, "Publicar" for
  `!published`, "Despublicar" + `formatRelativeTime(updatedAt, now)`
  for `published`. Empty state: "Nenhum depoimento encontrado."
- `components/testimonials-panel-page.tsx` — new. Composes
  `useRequirePermission(authPermissions.manageCourses)` →
  `useTestimonialsQuery` + `useCoursesQuery` (already used elsewhere,
  needed for course-title resolution) → client-side filter state
  (`'pending' | 'published' | 'all'`, default `'pending'`) → publish/
  unpublish mutations, each invalidating `queryKeys.admin.testimonials`
  on success (single unpaginated key — no partial-match invalidation
  needed here, unlike the paginated users/videos lists) → `toast.success`/
  `toast.error` on each action, matching every other admin mutation
  this session. Structurally parallel to `videos-panel-page.tsx` minus
  pagination (this list isn't paginated).
- `components/admin-sidebar.tsx` — `active` union gains `'testimonials'`;
  `NAV_ITEMS` gains a "Depoimentos" entry (`appRoutes.admin.testimonials`),
  positioned after "Auditoria" (matches the mockup's own sidebar order).
- `src/app/admin/testimonials/page.tsx` — new route, renders
  `TestimonialsPanelPage`.

## Tests

- `lib/resolve-course-title.spec.ts` — found/not-found/null cases.
- `components/testimonials-table.spec.ts` — empty state, Publicar for
  pending, Despublicar + relative time for published, course title
  resolution, "—" for no course.
- `components/admin-sidebar.spec.ts` — extend the existing
  "links every nav item" case to include `appRoutes.admin.testimonials`.

## Docs

- Add a row to `Docs/backend-pendencies/README.md`'s index for this
  screen, same as `videos-panel.md`/`audit-log-panel.md` got.
