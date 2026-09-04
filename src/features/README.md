# Features

Each business feature lives in its own folder here, following a fixed internal
shape:

```text
src/features/<feature>/
├── api/         # HTTP calls to the CourseCore API (thin wrappers over apiFetch)
├── components/  # Feature-specific UI (colocated *.spec.ts tests)
├── hooks/       # React Query hooks (<feature>.queries.ts)
├── lib/         # Feature-specific helpers/formatters
├── model/       # TypeScript types for the feature's domain
└── schemas/     # Zod schemas used to validate API responses and forms
```

`src/app/**` stays thin: routes import and render feature components instead
of implementing business logic inline. `src/components/**` only holds
cross-feature UI (shadcn/ui primitives in `ui/`, shared composites elsewhere).

- `landing/` — the public `/` page. Static content only (no `api/`, `hooks/`,
  or `schemas/` — it makes no CourseCore calls); see
  `Docs/specs/landing/landing-page.md`.
- `auth/` — maps to the backend's Auth module. Currently `/register`,
  `/login`, and `/confirm-email` (resend/change-email etc. can join
  later); see `Docs/specs/auth/register.md`, `Docs/specs/auth/login.md`,
  and `Docs/specs/auth/confirm-email.md`.
- `catalog/` — maps to the backend's Courses (+ Progress) modules.
  Currently `/catalog` (the first feature with a real `useQuery`, not
  just mutations), `/courses/[slug]` (the first dynamic route),
  `/courses/[slug]/lessons/[lessonId]` (the first two-segment dynamic
  route, and the first mutation that invalidates a query on success),
  and `/my-courses` (the first use of `useQueries` — a dynamic array of
  queries sized by a previous response, N+1 requests for N owned
  courses); see `Docs/specs/catalog/course-catalog.md`,
  `Docs/specs/catalog/course-detail.md`,
  `Docs/specs/catalog/lesson-player.md`, and
  `Docs/specs/catalog/my-courses.md`.

`src/components/app-nav.tsx` is the shared top nav for every
authenticated (non-auth-flow) page — first used by `catalog/`, reused
as-is by every other page in this feature rather than each one growing
its own copy. It's state-aware (`active: 'catalog' | 'my-courses'`)
since `/my-courses` joined `/catalog` as a real nav destination.

Each new feature is added following the workflow in the root `CLAUDE.md`
(spec → resolve open decisions → implementation plan → implement → tests →
docs → commit). A feature only gets the subfolders it actually needs —
skip `api/`/`hooks/`/`schemas/` if it makes no HTTP calls.
