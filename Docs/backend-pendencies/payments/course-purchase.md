# Backend pendencies — Course purchase (Stripe)

Spec: [`Docs/specs/payments/course-purchase.md`](../../specs/payments/course-purchase.md).
Backend source of truth: `CourseCore/Docs/specs/payments/stripe-course-purchase.md`.

The core contract is **closed** (checkout, webhook, orders, per-course
access). What remains:

## 1. Live mode — Config

- **Mockup/need**: real charges.
- **Backend today**: `Stripe:SecretKey` must be `sk_test_`/`rk_test_`; the
  API refuses to start in Production with a live key
  (`ProductionConfigurationValidator`).
- **To close**: backend decision to allow live keys + webhook endpoint
  registered for live mode.
- **Workaround**: test mode only (card `4242 4242 4242 4242`).
- **Severity**: Config.

## 2. Refunds / revocation after a refund — Feature gap

- **Need**: a refunded purchase should drop access.
- **Backend today**: no `charge.refunded` handling; revocation is manual
  (`DELETE /api/access/user-course/{userId}/{courseId}`, admin screen has
  "Revogar").
- **Workaround**: admin revokes by hand.
- **Severity**: Feature gap.

## 3. Installments line is cosmetic — Cosmetic

- **Mockup**: "ou 3× de R$ …" under the price.
- **Backend today**: single payment only; no installment concept.
- **Workaround**: the line stays as drawn (informational); the charge is the
  full price.
- **Severity**: Cosmetic.

## 4. Order has no course title / receipt link — Feature gap

- **Need**: "Minhas compras" would ideally show the title and a receipt.
- **Backend today**: `OrderResponse` has `courseId`, amount, currency,
  status, dates only.
- **Workaround**: title resolved client-side from the already-loaded catalog
  ("Curso indisponível" if the course is no longer listed).
- **Severity**: Feature gap.

## 5. Re-sending the confirmation e-mail from the checkout error — Feature gap

- **Need**: when checkout returns 403 (e-mail not confirmed) the user should
  be able to fix it in place.
- **Backend today**: `POST /api/auth/resend-confirmation` exists, but no
  screen in this app consumes it yet from the detail page.
- **Workaround**: the error message tells the user to confirm their e-mail.
- **Severity**: Feature gap.
