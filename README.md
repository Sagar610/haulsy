# Haulsy

Marketplace for bulky items plus movers with vans. Buyers request a mover, the mover accepts or declines, then payment (demo card, or live Stripe). Demo data is set in Canada (CAD).

```bash
npm install
npm run dev
```

Live site: https://haulsy-eight.vercel.app

Local: http://localhost:3000 after `npm run dev`.

## Demo logins (password `demo123`)

- `madhavi.buyer@haulsy.test` — buyer with jobs and a delivered item to review
- `aisha.mover@haulsy.test` — van driver with a **pending inbox job**
- `dharmesh.seller@haulsy.test` — seller

## Leave demo payments (Stripe)

Create `.env.local`:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Restart `npm run dev`. Checkout then uses Stripe PaymentIntents in CAD. Without keys, the demo card (`4242…`) still works.

Accounts stay on this device until you add a real database. Edit yours at `/account`.
