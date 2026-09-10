# Admin — Audit log panel — implementation plan

Implements [`Docs/specs/admin/audit-log-panel.md`](audit-log-panel.md).

## Data layer (`src/features/admin/`)

No new schema/model/api needed — `GET /api/audit-logs` already has
`api/get-audit-logs.ts` + `schemas/audit-log.schema.ts`
(`pagedAuditLogSchema`) from the embedded preview. Reuses `api/get-user.ts`
(already built for `user-access-edit.md`) for the per-row email lookup.

- `lib/resolve-audit-detail.ts` — new. Same resolution order as
  `resolve-audit-label.ts` (`metadata.displayName` → Course/Area title
  via already-loaded lists → `{EntityName} #{shortId}`), but returns
  just the detail string, no `{action} ·` prefix, and `'—'` when there's
  no `entityId` at all. Does not touch `resolve-audit-label.ts` (still
  used, unchanged, by the embedded preview).
- `lib/audit-action-tone.ts` — new. Tiny pure function:
  `'destructive' | 'neutral'` from an action name substring match
  (`Unpublish`/`Revoke`/`Delete`/`Remove`/`Unlist`).

## Query layer

- `src/lib/routes/app-routes.ts` — add `admin.audit: '/admin/audit'`.
- `src/features/admin/hooks/admin.queries.ts` — add
  `useUsersByIdsQueries(userIds: string[], options)`: `useQueries`
  wrapping `getUser`, keyed `queryKeys.admin.user(userId)` per id — same
  `useQueries`-over-a-dynamic-id-list shape `useAllCourseModulesQueries`
  (videos panel) and `useOwnedCourseDetailsQueries` (catalog) already
  use. Sharing the `queryKeys.admin.user` key means a row's email lookup
  here and a direct visit to that user's edit page share one cache
  entry.

## Components

- `components/audit-log-table.tsx` — new. Props: `entries: AuditLog[]`,
  `courses: Course[]`, `areas: Area[]`, `userEmailById: Map<string, string>`,
  `userLookupReady: boolean`. Renders the four-column table
  (Ação/Detalhe/Usuário/Quando), using `resolveAuditDetail` and
  `audit-action-tone`. Empty state: "Nenhuma ação registrada ainda."
- `components/audit-panel-page.tsx` — new. Composes
  `useAuditLogsQuery(page, 20, ...)` (already exists) +
  `useUsersByIdsQueries` over that page's distinct `userId`s +
  `useCoursesQuery`/`useAreasQuery` (both already used elsewhere, needed
  for `resolveAuditDetail`'s Course/Area fallback) + `PaginationControls`.
  Structurally parallel to `videos-panel-page.tsx`
  (permission gate → paginated query → a bounded per-row lookup →
  table + pager).
- `components/admin-sidebar.tsx` — `active` union gains `'audit'`;
  "Auditoria" nav item's `href` becomes `appRoutes.admin.audit` (was
  `null`).
- `components/audit-log-panel.tsx` (the embedded `/admin/courses`
  preview) — add an optional "Ver tudo →" link to `appRoutes.admin.audit`
  in the `status: 'ready'` branch, rendered next to the existing
  "Últimas ações auditadas" label.
- `src/app/admin/audit/page.tsx` — new route, renders
  `AuditPanelPage`.

## Tests

- `lib/resolve-audit-detail.spec.ts` — mirrors
  `resolve-audit-label.spec.ts`'s cases, minus the action prefix,
  plus the no-`entityId` → `'—'` case.
- `lib/audit-action-tone.spec.ts` — destructive vs. neutral cases.
- `components/audit-log-table.spec.ts` — renders rows, resolves detail,
  shows resolved/unresolved/null user cases, empty state.
- `components/admin-sidebar.spec.ts` — update the existing "Auditoria
  renders as inert" case to assert a real link instead (mirrors the
  `videos-panel.md` update to this same file).
- `components/audit-log-panel.spec.ts` — add a case for the new
  "Ver tudo →" link.

## Docs

- Mark this screen resolved in `Docs/backend-pendencies/README.md`'s
  index (if a row exists — it doesn't yet, since this screen was never
  previously flagged as blocked; add one).
