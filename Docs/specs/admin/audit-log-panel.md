# Admin — Audit log panel

## Why

`courses-panel.md` embeds a 3-row audit preview (`AuditLogPanel`) inside
`/admin/courses`, gated on `audit.read`. The admin sidebar has drawn a
"Auditoria" nav item since the videos-panel work — inert, since this
dedicated screen didn't exist yet. `GET /api/audit-logs` was already
built (paginated) to back that preview; this spec builds `1zd`, the real
full-history screen it was always meant to support, reachable from the
sidebar.

## Source

Design reference: artboard `1zd` ("Painel admin — auditoria") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same admin shell as `courses-panel.md`/`videos-panel.md` (this session's
sibling screen, also unspecced — see that file's own note about the
lighter-weight pass used for it).

## Goals

- List every audit log entry, paginated, newest first, four columns:
  Ação, Detalhe, Usuário, Quando.
- Reachable from `AdminSidebar`'s "Auditoria" item (currently inert).
- The existing `/admin/courses` preview widget (`AuditLogPanel`) gains a
  "Ver tudo →" link to this screen when it has entries to show.

## Non-goals

- **Filtering by action.** The mockup draws a "Filtrar por ação ▾"
  control; `GET /api/audit-logs` has no filter parameter at all (only
  `page`/`pageSize` — see `Docs/backend-pendencies/admin/audit-log-panel.md`
  pendency 1). **Decision (resolved with the user 2026-09-10): drop the
  control entirely** rather than fake it client-side-only (misleading
  once paginated) or leave it inert-decorative — same posture
  `videos-panel.md` took for the mockup's unsupported "Vincular vídeo"
  button.
- **Editing, deleting, or reverting an audit entry.** Audit logs are an
  append-only record; nothing here writes to them.

## Page content

Route: `/admin/audit`. Shared shell: `AdminSidebar` (`active="audit"`,
now a real link instead of inert).

### Header

- Title: "Auditoria".
- Subtitle: "Histórico de ações administrativas, mais recentes
  primeiro" (static copy, matches the mockup).

### Table

Columns, in order: Ação, Detalhe, Usuário, Quando. One row per entry
from `GET /api/audit-logs?page=&pageSize=`:

- **Ação**: `entry.action` verbatim (monospace, matching the mockup's
  own treatment) — e.g. `CoursePublished`. Destructive-sounding actions
  (`Unpublish`/`Revoke`/`Delete`/`Remove`/`Unlist` substring) render in
  the muted-red tone already used elsewhere for destructive affordances;
  everything else neutral. The mockup's own row-by-row coloring doesn't
  follow a consistent rule (`TestimonialPublished` renders neutral while
  `CoursePublished` renders accent-blue for no stated reason) — not
  reproduced literally; this substring heuristic is the closest
  consistent approximation.
- **Detalhe**: reuses the same `metadata.displayName` /
  Course-or-Area-title / `{EntityName} #{shortId}` resolution
  `resolve-audit-label.ts` already does for the embedded preview, minus
  the leading `{action} ·` prefix (this screen already has its own Ação
  column) — new `lib/resolve-audit-detail.ts`, "—" when there's no
  `entityId` at all (e.g. `LoginSucceeded`).
- **Usuário**: the acting user's email, resolved via
  `GET /api/users/{userId}` for each distinct non-null `userId` on the
  *current page* (see "Open decisions" — bounded, not a full-history
  lookup). "—" for `userId: null` (system-initiated entries, if any
  exist). A user id that fails to resolve (deleted account, etc.) shows
  a shortened id instead of blocking the row.
- **Quando**: `formatRelativeTime(entry.createdAt, now)` — the exact
  same helper/thresholds the embedded preview already uses and this
  session's tests already lock in (`há Nmin` / `há Nh` / `ontem` /
  absolute `DD/MM/AAAA` beyond 48h), not the mockup's literal "3 dias
  atrás" copy — same "normalize an already-normalized mockup label"
  precedent as the preview's own build.

Pagination: `PaginationControls` (already built for
`users-list.md`/`videos-panel.md`), page size 20 (matches
`users-list.md`'s own default; audit history is the kind of dataset
that grows unbounded, so a bigger page wastes more on the per-page user
lookup below for no real benefit).

### States

- **Loading**: "Carregando…" in place of the table.
- **Error**: retry-safe inline message + button, same pattern as every
  other paginated admin list.
- **Empty**: "Nenhuma ação registrada ainda." (matches the embedded
  preview's own empty copy).
- **Forbidden**: gated on `audit.read`, same posture as every other
  admin screen.

## Open decisions

Resolved with the user on 2026-09-10:

- **No filter-by-action support on the backend.** **Decision: drop the
  "Filtrar por ação" control entirely** (see "Non-goals").
- **No user email on `AuditLogResponse`** (`userId` only). **Decision:
  resolve via `GET /api/users/{userId}`, one request per *distinct*
  non-null `userId` on the currently-loaded page** (typically far fewer
  than the page size, since one admin often accounts for many
  consecutive entries) — same bounded-N+1 reasoning `users-list.md`
  already used for its own per-row area-access lookup, and distinct
  from `courses-panel.md`'s rejection of N+1 audit-log enrichment (that
  case was unbounded, open-ended entity lookups across the whole
  system; this is bounded to exactly the page size and is the literal
  reason the column exists).

Derived without needing to ask (mechanical, consistent with precedent):

- **"Quando" reuses the existing relative-time helper/thresholds**
  as-is, not the mockup's literal "N dias atrás" copy.
- **"Detalhe" reuses `resolve-audit-label.ts`'s resolution rules**
  (`metadata.displayName` → Course/Area title → short id) via a new,
  prefix-free sibling function, rather than duplicating that logic or
  changing the existing (tested, working) function's return shape.
- **Page size 20**, matching `users-list.md`.
- **The `/admin/courses` embedded preview gains a "Ver tudo →" link**
  to this new screen — same "Todos os cursos →" pattern already used
  on the landing page's featured-courses section.

## Acceptance criteria

- `/admin/audit` renders the header, table (Ação/Detalhe/Usuário/Quando),
  and pagination from `GET /api/audit-logs`.
- "Auditoria" in `AdminSidebar` links here instead of being inert.
- No action-filter control is rendered anywhere on the page.
- The "Usuário" column shows a resolved email when the lookup succeeds,
  a shortened id when it doesn't, "—" when `userId` is null.
- `/admin/courses`'s embedded audit preview gains a "Ver tudo →" link to
  `/admin/audit` when it has entries.
- Gated on `audit.read`; forbidden otherwise.
