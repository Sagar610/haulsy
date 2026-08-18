"use client";

import { PayBox } from "@/components/pay/PayBox";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Media";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { bookings, currentUser, hydrated, markPaid } = useStore();
  const booking = bookings.find((b) => b.id === id);

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.replace(`/login?next=/bookings/${id}/pay`);
    }
  }, [hydrated, currentUser, router, id]);

  useEffect(() => {
    if (booking?.paid) router.replace(`/bookings/${booking.id}`);
  }, [booking, router]);

  if (!hydrated || !currentUser) return <PageLoader />;
  if (!booking || booking.customerId !== currentUser.id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Nothing to pay</h1>
        <Button href="/bookings" className="mt-6">
          Bookings
        </Button>
      </div>
    );
  }

  if (booking.paid) {
    return <PageLoader />;
  }

  if (booking.status !== "accepted") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Waiting on the mover</h1>
        <p className="mt-2 text-ink-soft">
          Payment opens after they accept this job.
        </p>
        <Button href={`/bookings/${booking.id}`} className="mt-6">
          Back to job
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Payment
      </p>
      <h1 className="font-display mt-2 text-4xl">
        Pay {formatPrice(booking.total)}
      </h1>
      <p className="mt-2 text-ink-soft">
        Item {formatPrice(booking.itemPrice)} + haul{" "}
        {formatPrice(booking.haulFee)} + fee {formatPrice(booking.serviceFee)}.
      </p>
      <div className="mt-8">
        <PayBox
          amount={booking.total}
          bookingId={booking.id}
          onPaid={(paymentId) => {
            markPaid(booking.id, paymentId);
            router.push(`/bookings/${booking.id}`);
          }}
        />
      </div>
    </div>
  );
}
