# Profile

## Why

The profile dropdown menu (mockup `1y`, already implemented in `AppNav`)
has an "Editar perfil" item that currently goes nowhere. This spec builds
the screen it should open — mockup `1z`. While speccing it, the backend's
long-standing "no current-user endpoint" gap (`CLAUDE.md`, "Known gap,
decided 2026-09-02") turned out to be closed: `GET /api/auth/me` exists
now. That's the one real piece of `1z`; almost everything else it draws
has nothing behind it at all (see "Non-goals").

## Source

Design reference: artboard `1z` ("Editar perfil") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Centered-card layout, same visual language as `confirm-email.md`'s
screen (no top nav — reached via a modal-style dropdown, not a nav
link).

## Goals

- Show the signed-in account's real name, email, and confirmation status
  from `GET /api/auth/me` (`CurrentUserResponse`).
- A working "Sair da conta": calls the real `POST /api/auth/logout`
  (revokes the refresh token server-side, per the backend's own
  `LogoutUseCase`) before clearing local state and redirecting to
  `/login` — an upgrade over the profile-menu's current logout, which
  only clears the local access token (see "Open decisions").
- Reachable from the profile dropdown's "Editar perfil" item, which
  currently does nothing.

## Non-goals

Everything else `1z` draws has no backend counterpart at all — not a
missing field on an existing endpoint, but entire capabilities that
don't exist anywhere in CourseCore:

- **Editing name or email.** The only endpoint that can change a `User`
  is `PUT /api/users/{userId}` (`UsersController`), and that entire
  controller requires the `ManageUsers` policy — an admin acting on any
  account, not a self-service "update my own profile" endpoint. A
  regular student has no way to change their own name or email at all
  today.
- **Changing password from within a logged-in session.** The only
  password-change path is the forgot-password flow
  (`POST /api/auth/forgot-password` → email → `POST /api/auth/reset-password`),
  which requires a reset token, not "type your current password, get a
  new one" from a session that's already authenticated. `1z`'s "Nova
  senha" field has nothing to submit to.
- **Uploading a profile photo.** `User` (`Modules/Users/Domain/Entities/User.cs`)
  has no avatar/photo field at all, and there's no upload endpoint
  anywhere in the backend — same standing gap already documented for
  course cover images and lesson video files. "Alterar foto" is dropped
  entirely, not shown as a disabled control.
- **A phone number.** Not a field on `User` either. "Telefone" is
  dropped entirely, same reasoning as the photo.
- **A "Salvar alterações" button.** With every field above unbuildable,
  there is nothing left to save — the button doesn't render at all
  rather than existing as a permanently-disabled no-op.

## Page content

Route: `/profile`. No shared shell (matches `1z`'s own layout, and
`confirm-email.md`'s precedent) — a centered card on the dark background.

- "←" back to `/catalog`.
- Heading: **"Perfil"**, not "Editar perfil" — see "Open decisions" for
  why the title itself changed.
- Avatar: the same initials-circle treatment used in `AppNav`, not a
  photo (see "Non-goals").
- **Nome**: `CurrentUserResponse.Name`, read-only.
- **E-mail**: `CurrentUserResponse.Email`, read-only, with a status badge
  next to it — "Confirmado" / "Pendente" from `EmailVerifiedAt`, the same
  distinction `confirm-email.md`'s own screen already surfaces.
- **Sair da conta**: the only interactive control on the page.

## States

- **Loading**: `useRequireAuth`'s own gate (`<LoadingScreen />`) covers
  the "not ready yet" moment; once past it, the `GET /api/auth/me` call
  is fast enough that no separate skeleton is worth building — the card
  chrome (heading, back link, "Sair da conta") renders immediately, and
  the name/email fields show a plain "…" until the response arrives.
- **Error**: `GET /api/auth/me` failing (401 → the existing app-wide
  redirect to `/login`; anything else) shows a small inline retry
  message in place of the name/email fields, without hiding "Sair da
  conta" — logging out should never depend on this call succeeding.

## Open decisions

Derived without needing to ask (mechanical, consistent with precedent
already set this session — e.g. `users-list.md` renaming a mislabeled
mockup column instead of building around the wrong premise):

- **Title changes from "Editar perfil" to "Perfil".** Every field the
  mockup would let you edit has nothing to save to (see "Non-goals").
  Calling the screen an editor when it edits nothing would be actively
  misleading; "Perfil" describes what it actually does.
- **Logout is upgraded to call the real endpoint everywhere, not just on
  this new screen.** `AppNav`'s existing "Sair" (added wiring the profile
  *menu*, before this screen existed) only cleared the local access
  token — `POST /api/auth/logout` didn't exist as a known capability at
  the time. Both call sites now share one `logout()` helper: POST to
  `/api/auth/logout` best-effort (the cookie carries the refresh token;
  a failed request still shouldn't block logging out locally), then
  clear local storage and hard-navigate to `/login`.
- **No dedicated loading skeleton.** `GET /api/auth/me` is a single,
  fast, already-authenticated read with no pagination or dependent
  requests — the same reasoning `confirm-email.md` used to justify not
  building one for its own account-status block.

## Acceptance criteria

- `/profile` renders the real name and email from `GET /api/auth/me`,
  and the correct Confirmado/Pendente badge.
- "Sair da conta" calls `POST /api/auth/logout`, clears local auth
  state, and lands on `/login` — including when the logout request
  itself fails.
- The profile dropdown's "Editar perfil" item navigates here instead of
  being inert.
- No editable field, save button, phone number, or photo upload appears
  anywhere on the page.
- No stored access token → redirect to `/login`, same gate as every
  other authenticated page.
