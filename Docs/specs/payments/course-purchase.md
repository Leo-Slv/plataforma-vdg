# Payments — Course purchase (Stripe, test mode)

## Why

Paid courses had no self-service path: the detail page's "Inscrever-se
agora" button did nothing, and the only way to unlock a paid course was an
admin granting it (`user-access-edit.md`). The CourseCore backend now sells
a paid course as a one-time Stripe Checkout purchase and grants access to
that single course from a signed webhook (backend spec:
`CourseCore/Docs/specs/payments/stripe-course-purchase.md`). This feature
is the student-facing side of it.

The same backend change **removed per-Area access** (`user-area`,
`role-area`) in favor of per-course access; the admin user screen is
migrated accordingly (see `user-access-edit.md`, revision note).

## Goals

- Let a student buy a paid course from its detail page and be sent to
  Stripe's hosted checkout.
- Show an honest post-payment screen: access is granted by the webhook, not
  by the redirect, so the screen waits for the order to become `Paid`.
- Show a cancel screen that makes clear nothing was charged.
- Let a student review their orders ("Minhas compras").

## Non-goals

- Collecting card data in this app (Stripe-hosted page only).
- Subscriptions, coupons, installments, Pix/boleto, invoices, refunds,
  live mode (see the backend spec's out-of-scope list).
- The "ou 3× de …" line on the detail page stays as drawn in the mockup;
  it is informational and does not change what Stripe charges.

## Behavior

### Buy button (course detail, locked state)

- Offered only for a `Paid` course with `priceAmount > 0`. Free and
  `EnrollmentControlled` courses keep the previous inert enrollment button.
- Click → `POST /api/courses/{courseId}/checkout` → browser navigates to the
  returned `checkoutUrl`. While the request (and navigation) is in flight the
  button shows "Redirecionando para o pagamento…" and is disabled.
- Errors are shown next to the button:
  403 → confirm your e-mail first; 404 → course not available;
  409 → already has access / not purchasable; 502 → payment service
  unavailable; anything else → generic retry message.
- Prices with cents show the cents (R$ 49,90), so the displayed price is
  exactly what is charged.

### `/checkout/success?orderId=…`

Authenticated. Polls `GET /api/orders/me` every 2 s for up to 30 s and shows:

| Order state            | Screen                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| loading / `Pending`    | "Confirmando seu pagamento…"                                           |
| `Paid`                 | "Pagamento confirmado" + "Ir para o curso" / "Meus cursos"             |
| `Pending` after 30 s   | "Ainda estamos confirmando" + "Verificar novamente" / "Minhas compras" |
| `Expired` / `Failed`   | "Pagamento não concluído" — nothing was granted                        |
| unknown id / no id     | "Pedido não encontrado"                                                |

On `Paid` the cached catalog/detail queries are invalidated so the course
appears unlocked everywhere without a manual refresh.

### `/checkout/cancel?orderId=…`

Authenticated. "Pagamento cancelado — nenhuma cobrança foi feita", with a
link back to the course (when the order is known) and to the catalog.

### `/orders` ("Minhas compras")

Authenticated. Lists the user's orders (newest first): course title (linked
to the course), date, amount (`amountInCents`/`currency`) and a status chip
(Aguardando pagamento / Pago / Expirado / Falhou). Empty state links to the
catalog. Reachable from the avatar menu and the mobile drawer.

## Technical notes

- `/checkout/*` read `orderId` with `useSearchParams` inside a `Suspense`
  boundary. An `async` server page that awaited `searchParams` stayed on the
  loading screen on a hard load (which is exactly how Stripe's redirect
  arrives), so the query string is read on the client.
- The polling hook sets `refetchIntervalInBackground` so confirmation still
  lands if the user switches tabs; it is capped at 30 s.

## Acceptance

- [x] Paid + priced course shows "Comprar agora"; click redirects to Stripe.
- [x] Each documented checkout error maps to its message.
- [x] Success screen flips from "Confirmando…" to "Pagamento confirmado"
      once the (signed) webhook lands, without a manual reload.
- [x] Course in the same Area stays locked after buying a different course.
- [x] `/orders` lists orders with status; empty state works.
- [x] `npm run test`, `npm run typecheck`, `npm run lint` pass.
- [x] Verified end-to-end locally against the backend + `stripe-mock`
      (checkout creation) with a hand-signed webhook.
