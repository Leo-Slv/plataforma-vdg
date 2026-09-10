# Backend Pendencies — Admin panel: Audit log (artboard `1zd`)

Mirrors [`Docs/specs/admin/audit-log-panel.md`](../../specs/admin/audit-log-panel.md).
`GET /api/audit-logs` (paginated) already exists — built for the
`/admin/courses` embedded preview (`courses-panel.md` pendency 4) — so
this screen isn't blocked outright, unlike `videos-panel.md` before
2026-09-09. Two real gaps remain, both closed via frontend-side
decisions rather than backend changes.

## 1. No filter-by-action query parameter — Feature gap — CLOSED (won't implement for now)

- **Mockup expects**: a "Filtrar por ação ▾" dropdown above the table,
  implying the admin can narrow the history to one action type.
- **Backend today**: `ListAuditLogsRequest`
  (`Modules/AuditLogs/Presentation/Requests/ListAuditLogsRequest.cs`)
  accepts only `Page`/`PageSize` — no `Action`/`Type` filter field, and
  `ListAuditLogsUseCase`/`IAuditLogRepository.ListPagedAsync` has no
  corresponding query parameter to pass one through even if the request
  DTO grew one.
- **What closing the gap would need**: an `Action` (or `Actions[]`)
  query parameter on `ListAuditLogsRequest`, threaded through the use
  case into a `WHERE Action = @action` (or `IN (...)`) clause in
  `EfAuditLogRepository.ListPagedAsync`.
- **Workaround shipped**: none — the control doesn't render at all.
  Filtering it client-side against only the currently-loaded page would
  silently misrepresent the full history once paginated (the filter
  would reset/mislead across page boundaries), which is worse than not
  offering it.
- **Severity**: Feature gap — the screen fully works and shows the
  complete real history without this; the cost is that narrowing a long
  history to one action type isn't possible yet.
- **Decision (2026-09-10)**: won't implement for now. Revisit if/when
  audit history grows large enough that scrolling pages to find one
  action type becomes a real workflow problem — at that point, add the
  query parameter above.

## 2. No user email on `AuditLogResponse` — Feature gap — CLOSED (resolved client-side, bounded)

- **Mockup expects**: a "Usuário" column showing the acting admin's
  email (`pastor.joao@vdg.org`).
- **Backend today**: `AuditLogResponse`
  (`Modules/AuditLogs/Presentation/Responses/AuditLogResponse.cs`) has
  `UserId` (`Guid?`) only — no denormalized email/name, and
  `AuditLogOutput.FromAuditLog` doesn't join against the `users` table
  to add one.
- **What closing the gap would need**: either a join in
  `EfAuditLogRepository.ListPagedAsync` to include the acting user's
  email (denormalized onto the response, mirroring how `metadata.displayName`
  was added for pendency 3 of the 2026-09-09 backend-changes doc), or a
  batch `GET /api/users?ids=...` endpoint the frontend could call once
  per page instead of resolving one id at a time.
- **Workaround shipped**: resolved client-side via the existing
  `GET /api/users/{userId}` (singular), one request per *distinct*
  non-null `userId` on the currently-loaded audit-log page — bounded by
  that page's row count (page size 20), not by the full audit history.
  See `Docs/specs/admin/audit-log-panel.md`'s "Open decisions" for why
  this differs from `courses-panel.md` pendency 4's rejection of doing
  the same thing for the embedded preview's entity labels (that lookup
  was open-ended across arbitrary historical entities with no natural
  bound; this one is capped at the page size and is the literal reason
  the column exists).
- **Severity**: Feature gap — cosmetic today (page size 20 keeps the
  extra requests small), would be worth a real backend join if page
  sizes grow or this pattern gets reused elsewhere.
