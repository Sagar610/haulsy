# Haulsy

Marketplace for bulky items plus movers with vans. Buyers request a mover, the mover accepts or declines, then payment (demo card, or live Stripe). Demo data is set in Canada (CAD).

```bash
npm install
npm run dev
```

Live site: https://haulsy-eight.vercel.app

Local: http://localhost:3000 after `npm run dev`.

## Demo logins (password `demo123`)

- `admin@haulsy.test` — full ops console at `/admin`
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

## Admin console

Log in as `admin@haulsy.test` and open `/admin`. From there you can:

- See volume, open jobs, movers on shift, and queues
- Create, suspend, and assign roles to people
- Moderate listings (take down / restore, edit price)
- Force job status or refund a paid haul
- Edit mover rates or remove someone from the roster
- Remove reviews, read job messages, and inspect CAD finance
- Reset this browser’s demo data
