"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { formatPrice } from "@/lib/format";
import { livePayments } from "@/lib/stats";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Lock } from "lucide-react";
import { useEffect, useState } from "react";

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

function StripeInner({
  onPaid,
}: {
  onPaid: (paymentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setBusy(false);
    if (result.error) {
      setError(result.error.message ?? "Payment failed.");
      return;
    }
    onPaid(result.paymentIntent?.id ?? "stripe");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={busy || !stripe}>
        <Lock size={16} /> {busy ? "Paying…" : "Pay with Stripe"}
      </Button>
    </form>
  );
}

function DemoCard({
  amount,
  onPaid,
}: {
  amount: number;
  onPaid: (paymentId: string) => void;
}) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 12 || expiry.length < 4 || cvc.length < 3) {
      setError("Enter a complete card — any test numbers work in demo mode.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      onPaid(`demo_${Date.now()}`);
      setBusy(false);
    }, 600);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <CreditCard size={16} /> Demo card — nothing is charged
      </p>
      <p className="text-xs text-ink-soft">
        Add Stripe keys in <code>.env.local</code> to take live payments. Until
        then, use 4242 4242 4242 4242.
      </p>
      <Field label="Name on card">
        <Input value={cardName} onChange={(e) => setCardName(e.target.value)} required />
      </Field>
      <Field label="Card number">
        <Input
          inputMode="numeric"
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(e) =>
            setCardNumber(
              e.target.value
                .replace(/[^\d]/g, "")
                .slice(0, 16)
                .replace(/(\d{4})/g, "$1 ")
                .trim(),
            )
          }
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Expiry">
          <Input
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => {
              const d = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
              setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
            }}
            required
          />
        </Field>
        <Field label="CVC">
          <Input
            inputMode="numeric"
            value={cvc}
            onChange={(e) =>
              setCvc(e.target.value.replace(/[^\d]/g, "").slice(0, 4))
            }
            required
          />
        </Field>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={busy}>
        <Lock size={16} />{" "}
        {busy ? "Paying…" : `Pay ${formatPrice(amount)}`}
      </Button>
    </form>
  );
}

export function PayBox({
  amount,
  bookingId,
  onPaid,
}: {
  amount: number;
  bookingId: string;
  onPaid: (paymentId: string) => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [demo, setDemo] = useState(!livePayments());

  useEffect(() => {
    if (!livePayments()) return;
    fetch("/api/stripe/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountCents: Math.round(amount * 100),
        bookingId,
      }),
    })
      .then((r) => r.json())
      .then((data: { demo?: boolean; clientSecret?: string }) => {
        if (data.demo || !data.clientSecret) setDemo(true);
        else setClientSecret(data.clientSecret);
      })
      .catch(() => setDemo(true));
  }, [amount, bookingId]);

  if (demo || !stripePromise) {
    return (
      <div className="rounded-[24px] border border-line bg-cream p-5">
        <DemoCard amount={amount} onPaid={onPaid} />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="rounded-[24px] border border-line bg-cream p-5 text-sm text-ink-soft">
        Connecting to Stripe…
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-line bg-cream p-5">
      <p className="mb-4 text-sm font-medium">Live Stripe payment</p>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripeInner onPaid={onPaid} />
      </Elements>
    </div>
  );
}
