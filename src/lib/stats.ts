import type { Booking, Review } from "./types";

export function livePayments(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function moverRating(reviews: Review[], moverUserId: string): {
  rating: number;
  count: number;
} {
  const theirs = reviews.filter((r) => r.toUserId === moverUserId);
  if (!theirs.length) return { rating: 0, count: 0 };
  const rating =
    theirs.reduce((sum, r) => sum + r.rating, 0) / theirs.length;
  return { rating: Math.round(rating * 10) / 10, count: theirs.length };
}

export function jobsDone(bookings: Booking[], moverUserId: string): number {
  return bookings.filter(
    (b) => b.moverId === moverUserId && b.status === "delivered",
  ).length;
}
