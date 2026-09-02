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

No feature folder exists yet — each one is added following the workflow in
the root `CLAUDE.md` (spec → resolve open decisions → implementation plan →
implement → tests → docs → commit).
