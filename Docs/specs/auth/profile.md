# Profile

## Why

The profile dropdown menu (mockup `1y`, already implemented in `AppNav`)
has an "Editar perfil" item that currently goes nowhere. This spec builds
the screen it should open — mockup `1z`. Originally (2026-09-08) almost
everything `1z` draws had no backend counterpart — only name/email/status
from `GET /api/auth/me` were real, so the screen shipped read-only,
retitled "Perfil". As of 2026-09-09 the backend closed every one of those
gaps (`PUT /api/auth/me`, `POST /api/auth/change-password`, `Phone`/
`AvatarUrl` fields — see
`Docs/backend-pendencies/auth/profile.md`), so this revision makes the
screen actually editable, matching `1z`'s original intent.

## Source

Design reference: artboard `1z` ("Editar perfil") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Centered-card layout, same visual language as `confirm-email.md`'s
screen (no top nav — reached via a modal-style dropdown, not a nav
link).

## Goals

- Show the signed-in account's real name, email, phone, avatar, and
  confirmation status from `GET /api/auth/me` (`CurrentUserResponse`).
- Edit **name**, **phone**, and **avatar URL** and save them via
  `PUT /api/auth/me` — **not email**, which stays read-only (self-service
  email change is a deliberate backend non-goal, admin-only via
  `PUT /api/users/{id}`).
- Change password in-session via `POST /api/auth/change-password`
  (current password + new password) — this revokes every active session,
  including the current one, so a successful change ends in the same
  "Sair da conta" flow described below rather than staying on the form.
- A working "Sair da conta": calls the real `POST /api/auth/logout`
  (revokes the refresh token server-side, per the backend's own
  `LogoutUseCase`) before clearing local state and redirecting to
  `/login`.
- Reachable from the profile dropdown's "Editar perfil" item.

## Non-goals

- **Editing email.** `PUT /api/auth/me` deliberately excludes `Email` —
  see "Backend / API contract" in `CLAUDE.md` and this screen's own
  pendency doc. The field stays read-only with its Confirmado/Pendente
  badge.
- **Uploading a profile photo file.** `User.AvatarUrl` is a plain URL
  string — CourseCore still has no binary upload/storage pipeline
  anywhere (same standing decision as course cover images and lesson
  videos). "URL da foto" ships as a text field instead of `1z`'s
  "Alterar foto" drop-zone affordance.
- **A single combined "Salvar alterações" covering the password too.**
  `1z`'s mockup draws one form with an inline "Nova senha (deixe em
  branco para manter a atual)" field, but the real endpoints have
  different shapes (`change-password` needs the *current* password too,
  for verification) and different consequences (a name/phone/avatar
  save is silent; a password change force-logs-out every session). They
  ship as two independent forms/actions instead of one combined submit.

## Page content

Route: `/profile`. No shared shell (matches `1z`'s own layout, and
`confirm-email.md`'s precedent) — a centered card on the dark background.

- "←" back to `/catalog`.
- Heading: **"Perfil"**.
- Avatar: the account's `avatarUrl` image when set, otherwise the same
  initials-circle treatment used in `AppNav`.
- **Dados da conta** card:
  - **Nome completo**: editable, required.
  - **E-mail**: `CurrentUserResponse.Email`, read-only, with a status
    badge next to it — "Confirmado" / "Pendente" from `EmailVerifiedAt`.
  - **Telefone**: editable, optional, plain string (no format/country
    validation — matches the backend's own `Phone` field).
  - **URL da foto**: editable, optional, must be a valid URL when
    non-empty.
  - **Salvar alterações**: `PUT /api/auth/me`. Only this session's local
    auth state (cached name) and the `GET /api/auth/me` query cache are
    updated on success — other sessions are untouched, matching the
    backend's "no `TokenVersion` bump for a cosmetic change" behavior.
- **Alterar senha** card (separate from the account-data card/action):
  - **Senha atual**: required.
  - **Nova senha**: required, same 12-character minimum as registration
    (`IPasswordPolicy`).
  - **Alterar senha**: `POST /api/auth/change-password`. On success,
    shows a short "you're about to be logged out everywhere" message,
    then clears local auth state and hard-navigates to `/login` — the
    backend revokes this session too, so staying on the page would leave
    the UI holding a token that fails on the next request.
- **Sair da conta**: unaffected by the above, always available.

## States

- **Loading**: `useRequireAuth`'s own gate (`<LoadingScreen />`) covers
  the "not ready yet" moment; once past it, the `GET /api/auth/me` call
  is fast enough that no separate skeleton is worth building — the card
  chrome (heading, back link, "Sair da conta") renders immediately, and
  the form fields populate once the response arrives (`react-hook-form`'s
  `values` option, same pattern `lesson-editor.md` already uses).
- **Error**: `GET /api/auth/me` failing (401 → the existing app-wide
  redirect to `/login`; anything else) shows a small inline retry
  message in place of the account-data form, without hiding "Sair da
  conta" — logging out should never depend on this call succeeding.
- **Save error** (profile): generic inline message — none of the
  `PUT /api/auth/me` error cases (400/401/404) need field-specific
  handling beyond client-side validation.
- **Save error** (password): `401` → "Senha atual incorreta." on the
  current-password field; `429` → the shared rate-limit message (same
  copy used elsewhere in `auth`); `400` → the backend's own policy
  message (e.g. common/too-short password); anything else → generic.

## Open decisions

Derived without needing to ask (mechanical, consistent with precedent
already set this session):

- **Password change is its own form/action, not folded into "Salvar
  alterações".** See "Non-goals" — different request shape (needs
  current password), different blast radius (logs out every session).
  Combining them into one submit would make a name-only edit force a
  password field into every request, or silently skip the password
  change if left blank in a way that's easy to get wrong.
- **A successful password change hard-navigates to `/login` after a
  brief delay**, rather than immediately or not at all. Immediately would
  cut off the confirmation message; not navigating would leave the UI
  showing a now-invalid session (the next authenticated request 401s).
- **Logout continues to call the real endpoint everywhere** (already
  true since the previous revision of this screen) — `AppNav`'s "Sair"
  and this screen's "Sair da conta" share the same `performLogout()`
  helper.

## Acceptance criteria

- `/profile` renders the real name, email, phone, avatar, and the
  correct Confirmado/Pendente badge from `GET /api/auth/me`.
- Editing name/phone/avatar URL and saving persists via
  `PUT /api/auth/me` and updates the page without a full reload.
- Email has no editable control anywhere on the page.
- Changing password with a correct current password succeeds, shows the
  logout-warning message, then lands on `/login` with local auth state
  cleared.
- An incorrect current password shows "Senha atual incorreta." without
  navigating away.
- "Sair da conta" calls `POST /api/auth/logout`, clears local auth
  state, and lands on `/login` — including when the logout request
  itself fails.
- The profile dropdown's "Editar perfil" item navigates here instead of
  being inert.
- No stored access token → redirect to `/login`, same gate as every
  other authenticated page.
