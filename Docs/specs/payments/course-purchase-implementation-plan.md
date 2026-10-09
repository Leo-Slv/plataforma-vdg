# Payments — Course purchase — implementation plan

Implements `course-purchase.md`. New slice `src/features/payments/`.

## Files

```text
api/create-checkout.ts        POST /api/courses/{id}/checkout
api/get-my-orders.ts          GET  /api/orders/me
schemas/{checkout,order}.schema.ts   zod; order.status kept as string
model/order.ts                Order, Checkout types
hooks/payments.queries.ts     useCreateCheckoutMutation, useMyOrdersQuery (poll option)
lib/order-status.ts           label/tone per status, isSettledOrderStatus
lib/poll-order.ts             nextPollDelay (2 s interval, 30 s cap)
lib/checkout-view.ts          deriveCheckoutView(order, timedOut, …) -> screen
lib/checkout-error.ts         ApiError status -> user message
lib/format-amount-in-cents.ts
components/checkout-result.tsx        presentational screens for each view
components/checkout-success-page.tsx  polling container (useSearchParams)
components/checkout-cancel-page.tsx
components/orders-list.tsx            presentational list
components/orders-page.tsx            container
app/checkout/success/page.tsx, app/checkout/cancel/page.tsx (Suspense), app/orders/page.tsx
```

Touched elsewhere: `query-keys.ts` (`payments.orders`), `app-routes.ts`
(`orders`, `checkout`), `app-nav.tsx` ("Minhas compras" in the avatar menu and
drawer, `active="orders"`), `course-detail-locked.tsx` (optional
`onBuy`/`isBuying`/`buyError` props — presentational, so the existing static
specs keep rendering without a QueryClient), `course-detail-page.tsx` (owns
the mutation and the redirect), `format-currency-brl.ts` (keep cents).

## Decisions

- Containers own hooks; view components stay presentational and are covered
  by `renderToStaticMarkup` specs, matching the rest of the repo.
- "Paid" is derived only from the order the API returns — never from the
  redirect itself.
- Order `status` is a plain string in the schema so a new backend status
  can't break parsing of the whole list; unknown values render as-is.

## Tests

`lib/*.spec.ts` (status mapping, polling cadence/timeout, view derivation,
error mapping, amount formatting), `components/checkout-result.spec.ts`,
`components/orders-list.spec.ts`, and new cases in
`course-detail-locked.spec.ts` and `format-currency-brl.spec.ts`.
