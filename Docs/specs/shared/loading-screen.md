# Shared — Loading screen

## Why

Every auth-gated page (`useRequireAuth`) and every permission-gated admin
page (`useRequirePermission`) renders a bare `<div className="min-h-screen
bg-[#0a0a0b]" />` while the client-side check is in flight (localStorage/JWT
decode can't run during SSR, so there's always a brief "not ready yet"
render on first paint). That placeholder was never designed — it's just
the page's own background color with nothing in it. This spec gives that
moment a real, shared component matching the mockup.

## Source

Design reference: artboard `1s` ("Tela de carregamento") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
No admin/auth/catalog shell — a standalone, full-bleed screen.

## Goals

- A single reusable `LoadingScreen` component matching the mockup exactly:
  full-bleed `#0a0a0b` background, centered 200×200px spinner (a static
  faint ring behind a spinning accent-colored partial ring) around the
  200×150px circular brand mark (`/brand/viver-da-graca-mark.png`, the
  same asset every other screen already uses) with its glow.
- Replace every existing `<div className="min-h-screen bg-[#0a0a0b]" />`
  "not ready" placeholder — in every `useRequireAuth`/
  `useRequirePermission`-gated page component — with `<LoadingScreen />`.

## Non-goals

- **Next.js route-level `loading.tsx` files / Suspense boundaries.** The
  mockup shows a generic full-screen spinner, not a route-transition
  treatment, and every gated page in this codebase already renders its
  "not ready" state from client-side component logic (a `useState` flag
  flipped after an effect checks `localStorage`/decodes the JWT), not
  from server-driven route suspense. Introducing `loading.tsx` files would
  be a different mechanism solving a different moment (streaming/
  navigation) than what `1s` actually depicts or what the codebase needs
  today.
- **A loading state for in-page data fetching** (e.g. "Carregando
  cursos…", "Carregando usuários…" inside an already-rendered page shell).
  Those are deliberately lighter-weight (plain centered text, no spinner)
  so a slow section doesn't block the rest of an otherwise-ready page —
  see `courses-panel.md`'s per-section independent loading states. `1s` is
  specifically the *whole-page* "nothing has rendered yet" moment.

## Component

`src/components/loading-screen.tsx` — no props, no state, no data
fetching. Cross-feature shared UI (used by `auth`, `catalog`, and `admin`
page components alike), so it lives at `src/components/` directly next to
`app-nav.tsx`, not inside any single feature folder.

Call sites (every existing `if (!ready) { return <div
className="min-h-screen bg-[#0a0a0b]" /> }` — or the equivalent
`!authReady`-driven blank state), swapped for `<LoadingScreen />`:

- `src/features/auth/components/confirm-email-page.tsx`
- `src/features/catalog/components/catalog-page.tsx`
- `src/features/catalog/components/course-detail-page.tsx`
- `src/features/catalog/components/lesson-player-page.tsx`
- `src/features/catalog/components/my-courses-page.tsx`
- `src/features/admin/components/areas-list-page.tsx`
- `src/features/admin/components/area-form-page.tsx`
- `src/features/admin/components/courses-panel-page.tsx`
- `src/features/admin/components/course-form-page.tsx`
- `src/features/admin/components/course-modules-page.tsx`
- `src/features/admin/components/lesson-editor-page.tsx`
- `src/features/admin/components/users-list-page.tsx`

## Backend pendencies

None — purely a frontend presentational component, no API calls, no data.

## Open decisions

None — a small, mechanical, fully-determined change: one new component
matching the mockup pixel-for-pixel, swapped into every existing call site
that already renders the exact placeholder it replaces.

## Acceptance criteria

- `LoadingScreen` renders the full-bleed background, the two-ring spinner
  (one static, one spinning via `animate-spin`), and the circular brand
  mark with its glow — matching artboard `1s`.
- Every page listed above shows `<LoadingScreen />` instead of the bare
  background `div` while its own readiness check is pending.
- No other behavior changes — the components gate readiness exactly as
  before; only what renders during that wait changes.
