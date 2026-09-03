# Project Architecture

Plataforma VDG is the web frontend for [CourseCore](https://github.com/Leo-Slv/CourseCore),
a course platform backend. This repo only renders UI and talks to the
CourseCore API over HTTP/JSON — it is not the authority for auth or
authorization; the backend is.

The architecture and conventions below are based on the frontend of
https://github.com/ErrorSquad-ABP/ABP3-Sistema-Gestao-Leads/tree/main/front,
adapted where the real CourseCore API contract differs from that reference
(see "Deliberate deviations from the reference project" at the end of this
file). Before introducing a new pattern, check how equivalent functionality
is handled elsewhere in this codebase or in that reference project, and
prefer the established convention over inventing a new one.

## Stack

- Next.js 16 (App Router, `src` dir, Turbopack for dev)
- React 19 + TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui (`radix` base, `lyra` preset — see `components.json`)
- TanStack Query for server state
- React Hook Form + Zod for forms and validation
- Prettier + `prettier-plugin-tailwindcss`, ESLint (`eslint-config-next`)

There is no global client-state store (Redux/Zustand/etc.) yet. Server state
goes through TanStack Query; keep local UI state in component state. Only
introduce a global store if a concrete feature needs cross-tree client state
that query caching and component state can't reasonably cover — don't add one
preemptively.

## Folder structure

```text
src/app/         # Routes (App Router). Stay thin: import and render feature
                 # components/hooks instead of implementing business logic inline.
src/components/
  ui/            # shadcn/ui primitives (generated via `npx shadcn add <name>`)
  ...            # cross-feature shared composites (layout, feedback, shared, etc.)
src/features/    # One folder per business feature — see src/features/README.md
src/lib/
  http/          # apiFetch client + ApiError (adapted to CourseCore's real contract)
  auth/          # access-token storage (client-side, localStorage)
  query/         # QueryClient + provider
  routes/        # app-routes.ts — centralized route path constants
  constants/     # query-keys.ts — centralized React Query key registry
  env.ts         # runtime env access
```

### Feature slice shape

Each feature under `src/features/<feature>/` follows:

```text
api/         # HTTP calls (thin wrappers over apiFetch)
components/  # Feature UI (colocated *.spec.ts tests)
hooks/       # React Query hooks (<feature>.queries.ts)
lib/         # Feature-specific helpers/formatters
model/       # TypeScript types for the feature's domain
schemas/     # Zod schemas for API responses and form validation
```

No feature folder exists yet in this scaffold — each one is added following
the Implementation Workflow below, one feature at a time.

## Backend / API contract

The CourseCore backend lives in a sibling repo on this machine:
`c:\Users\leonardo.silva\source\repos\CourseCore`
(GitHub: https://github.com/Leo-Slv/CourseCore).

- **Live contract**: run the backend locally (`dotnet run`, Development
  environment) and read the OpenAPI spec at
  `https://localhost:7165/openapi/v1.json`, or browse it via the Scalar UI at
  `https://localhost:7165/scalar`. This is the source of truth — it's
  generated straight from the actual controllers/DTOs.
- **Offline fallback**: when the API isn't running, read
  `Docs/postman.md`, `README.md`, and `Docs/implementation-class-diagram.md`
  inside that backend repo directly (Claude Code can read files outside this
  repo's working directory by absolute path).

### Response shape

CourseCore does **not** use the `{ success, message, data, errors }` envelope
the reference project's `api-client.ts` assumes. The real contract is:

- **Success**: the raw DTO directly in the response body (e.g. a course
  response object, not wrapped in a `data` field). `204 No Content` for
  actions with no body.
- **Error**: `Shared/Presentation/Responses/ApiErrorResponse.cs` /
  `ExceptionHandlingMiddleware.cs` in the backend produce:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "...",
    "traceId": "...",
    "correlationId": "...",
    "timestamp": "...",
    "details": ["..."]
  }
  ```
  `details` is a flat array of strings, not an array of `{code, message}`
  objects like the reference project's `ApiErrorItem`.

This is already implemented in `src/lib/http/api-client.ts` and
`src/lib/http/api-error.ts` — do not reintroduce the reference project's
envelope pattern when adding new API calls.

### Auth

- Login/register return the access token in the JSON response body
  (`AuthOutput.Token` in the backend). Store it client-side via
  `src/lib/auth/access-token.ts` (localStorage) and send it as
  `Authorization: Bearer <token>` — `apiFetch` already does this
  automatically.
- The refresh token is set by the backend as an httpOnly cookie
  (`Auth:RefreshTokenCookie:*` config in CourseCore) and is sent
  automatically via `credentials: 'include'` (already the default in
  `apiFetch`) — it is never readable or stored from JavaScript.
- **Known gap, decided 2026-09-02**: CourseCore has no `GET /api/auth/me` (or
  equivalent "current user") endpoint. The reference project's server-side
  session bootstrap (`src/lib/auth/session.ts`, used in Server Components to
  gate routes before render) depends on such an endpoint and is **not**
  replicated here. For now, authenticated-route gating happens entirely
  client-side (read the stored access token / decoded JWT claims, redirect if
  missing or invalid). Revisit this only if a "current user" endpoint gets
  added to the backend first — that would need its own spec on the CourseCore
  side before this repo builds against it.

## Implementation Workflow

Follow the same process used in the CourseCore backend repo, one feature at a
time:

1. **Spec (WHAT/WHY only)** at `Docs/specs/<domain>/<feature>.md` — no
   implementation detail.
2. **Resolve open decisions explicitly.** If something can't be inferred from
   the existing code, this CLAUDE.md, or the reference project, list the
   questions and ask before proceeding — don't assume silently.
3. **Implementation plan (HOW)** at
   `Docs/specs/<domain>/<feature>-implementation-plan.md`.
4. **Implement.**
5. **Tests.** Fix/add tests until `npm run test`, `npm run typecheck`, and
   `npm run lint` all pass.
6. **Docs.** Update `README.md` (and this file, if the architecture changed)
   to reflect the new feature.
7. **Commit.** Conventional Commits, in English, separated by context
   (several small commits, never one giant commit). Never add a
   `Co-Authored-By: Claude` trailer — commits are attributed to the user
   only. Never push to the remote without an explicit request.

The user writes in Portuguese in conversation; specs, plans, commit messages,
and code comments stay in English, matching the CourseCore backend's
convention.

## Design mockups

Screens are designed in Claude Design under the project "Igreja Viver da
Graça - UI Mockups" and delivered here as the exported canvas artifact
committed under `Docs/design/mockups/<screen-name>.html` — durable, works
offline, versioned with the code, instead of depending on a live fetch of
the Claude Design canvas on every session. Reference the relevant HTML
mockup(s) from each feature's spec when speccing a UI-heavy feature.

## Deliberate deviations from the reference project

- **HTTP client / error shape**: adapted to CourseCore's actual API contract
  instead of the reference's `{success, data, errors}` envelope — see
  "Backend / API contract" above.
- **No server-side session bootstrap**: client-only auth gating for now,
  since CourseCore has no `/api/auth/me`-equivalent endpoint — see "Auth"
  above.
- **Reduced starter dependency set**: `recharts`, `motion`, `simplebar-react`,
  `@iconify/react`, and `playwright` from the reference project's
  `package.json` were intentionally not installed in this scaffold — they
  support features (dashboards, animations, e2e tests) that don't exist yet
  here. Add them when the feature that actually needs them is specced.
- **No branch-flow model**: this repo commits directly, following
  CourseCore's own convention, not the reference project's
  `CONTRIBUTING.md` `main`/`develop`/`feature/*` branch flow.
