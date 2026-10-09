# Catalog — Honest actions on locked courses, e-mail gate and silent session refresh

## Why

An audit of the app found places where the UI promised something it did not do:

- The price card's "Inscrever-se agora" did nothing for free courses in a private area, for "Por inscrição" courses and for paid courses without a price.
- Users with an unconfirmed e-mail (including those created from the admin "Convidar usuário") saw every course locked with no explanation, and a locked course's preview stayed on "Carregando conteúdo…" forever.
- "Esqueci" on the login page and "Trocar e-mail" on the confirmation page led to pages that do not exist.
- The access token lasts 60 minutes and nothing ever used the 7-day refresh cookie, so a session died after an hour.
- "ou 3× de R$ …" implied installments while Stripe charges the full amount at once.

## Behavior

### Price card on a locked course

Exactly one next step is offered (`features/catalog/lib/locked-cta.ts`):

| Situation                                              | What the card shows                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| E-mail not confirmed                                   | "Confirme seu e-mail…" + **Confirmar e-mail** link (wins over everything below)      |
| Paid course with a price                               | **Comprar agora** → Stripe checkout (see `payments/course-purchase.md`)             |
| "Por inscrição", or paid without a price               | **Solicitar acesso** → `POST /api/access/requests`                                  |
| …with a pending request                                | "Solicitação enviada — aguardando a equipe" (no button)                             |
| …with a rejected request                               | note + **Solicitar novamente**                                                      |
| Free course locked (private area)                      | "liberado pela equipe da igreja — fale com a secretaria" (no button)                |

The installment line is removed; the card shows the single price. Requests are granted from the admin user screen ("Conceder acesso a um curso"); a dedicated approval queue is intentionally not built yet.

### E-mail confirmation

- Logging in with an unconfirmed account goes to `/confirm-email` (the account state comes from `GET /api/auth/me`); confirmed accounts go to the catalog.
- Catalog, course detail, "Meus cursos" and "Minhas compras" show a banner "Confirme seu e-mail…" with a link while the account is unconfirmed.
- When the content preview of a locked course cannot be loaded, the page says so instead of staying on "Carregando conteúdo…". A course the user owns whose content fails to load shows an error with "Tentar novamente".
- Queries no longer retry 4xx answers (403/404/409…): they are the server's answer, so errors surface immediately.

### Forgot / reset password

- `/forgot-password`: e-mail (+ Turnstile when configured) → `POST /api/auth/forgot-password`. The confirmation never says whether the account exists.
- `/reset-password?token=…` (the link in the e-mail; the code can also be typed): new password (min. 12) + confirmation → `POST /api/auth/reset-password`.
- "Trocar e-mail" was removed: the API has no endpoint for users to change their own e-mail.

### Silent session refresh

An authenticated request that returns 401 triggers one `POST /api/auth/refresh-token` (cookie-based, shared between concurrent calls) and is retried once. If the refresh fails the stored session is cleared and the user is sent to `/login`. Login/register/logout/forgot/reset 401s are never refreshed.

## Acceptance

- [x] No locked-course state renders a button that does nothing.
- [x] Request flow: send → "Solicitação enviada"; reload keeps it; the admin grant unlocks the course.
- [x] Unconfirmed login lands on `/confirm-email`; banner + confirm CTA elsewhere; no endless "Carregando conteúdo…".
- [x] Forgot/reset pages work against the backend (invalid code shows an error; the code is pre-filled from the link).
- [x] An expired access token is renewed transparently (verified against the running API).
- [x] `npm run test`, `npm run typecheck`, `npm run lint` pass.

## Related backend fix

`POST /api/auth/forgot-password` used to answer 500 when the e-mail provider failed, but only for existing accounts — which leaked which e-mails are registered. The delivery failure is now logged and the endpoint answers 204 either way.
