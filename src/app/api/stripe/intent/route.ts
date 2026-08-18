import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ demo: true });
  }

  const body = (await req.json()) as {
    amountCents?: number;
    bookingId?: string;
  };
  const amount = Math.round(Number(body.amountCents) || 0);
  if (amount < 50) {
    return NextResponse.json({ error: "Amount too small" }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "cad",
    automatic_payment_methods: { enabled: true },
    metadata: { bookingId: body.bookingId ?? "" },
  });

  return NextResponse.json({ clientSecret: intent.client_secret });
}
