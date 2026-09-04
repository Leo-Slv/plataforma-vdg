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
- `catalog/` — maps to the backend's Courses module. Currently `/catalog`
  (the first feature with a real `useQuery`, not just mutations); see
  `Docs/specs/catalog/course-catalog.md`.

Each new feature is added following the workflow in the root `CLAUDE.md`
(spec → resolve open decisions → implementation plan → implement → tests →
docs → commit). A feature only gets the subfolders it actually needs —
skip `api/`/`hooks/`/`schemas/` if it makes no HTTP calls.
