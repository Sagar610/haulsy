"use client";

import { ListingCard } from "@/components/marketplace/ListingCard";
import { MoverCard } from "@/components/movers/MoverCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Media";
import { SmartImage } from "@/components/ui/Media";
import { jobsDone, moverRating } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { ArrowRight, Box, CalendarClock, Truck } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Box,
    title: "List the real size",
    body: "Sellers measure length, width, height and weight. That is how we know which van can take it.",
  },
  {
    icon: CalendarClock,
    title: "Pick a slot",
    body: "Choose when you want it collected. We only show movers who are free and whose vehicle fits.",
  },
  {
    icon: Truck,
    title: "They bring it home",
    body: "Pay the item and the haul online. The mover collects from the seller and delivers to your door.",
  },
];

export default function HomePage() {
  const { listings, movers, users, reviews, bookings } = useStore();
  const featured = listings.filter((l) => l.status === "live").slice(0, 6);
  const featuredMovers = movers.slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <p className="tape-label inline-block rounded-md px-3 py-1 text-[11px]">
              Marketplace + movers
            </p>
            <h1 className="font-display mt-5 max-w-xl text-4xl leading-[1.1] tracking-tight text-ink sm:text-6xl">
              Buy bulky. We bring it home.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              Found a sofa you love, but no van? Haulsy is a marketplace for
              large things, with people who already have the van. Book pickup
              and delivery in the same checkout — or hire help to move house.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/marketplace" size="lg">
                Shop bulky finds <ArrowRight size={18} />
              </Button>
              <Button href="/moves" variant="outline" size="lg">
                Book a house move
              </Button>
            </div>
            <p className="mt-4 text-sm text-ink-soft">
              Movers set their own rates. You only see people whose vehicle
              actually fits.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-[28px] bg-sage">
              <SmartImage
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
                alt="Green velvet sofa"
                className="aspect-[4/5]"
              />
            </div>
            <div className="mt-8 overflow-hidden rounded-[28px] bg-sage">
              <SmartImage
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80"
                alt="People carrying a job together"
                className="aspect-[4/5]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-cream">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6">
          {[
            ["Measure once", "Every listing has real dimensions, not vibes."],
            ["The right van", "Cars, wagons, vans and cube vans — matched to the load."],
            ["Pay in one go", "Item + haul + a small Haulsy fee, all online."],
          ].map(([t, b]) => (
            <div key={t} className="px-2 py-2">
              <p className="font-semibold text-forest">{t}</p>
              <p className="mt-1 text-sm text-ink-soft">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Link
            href="/marketplace"
            className="group rounded-[32px] bg-forest p-8 text-cream transition-transform hover:-translate-y-0.5 sm:p-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tape">
              Marketplace
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">
              Furniture that actually arrives
            </h2>
            <p className="mt-3 max-w-md text-cream/80">
              Browse sofas, appliances and more. Pay the seller, then book a
              mover to collect from their home and drop at yours.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-medium">
              Open the marketplace <ArrowRight size={16} />
            </span>
          </Link>
          <Link
            href="/moves"
            className="group rounded-[32px] bg-tape p-8 text-ink transition-transform hover:-translate-y-0.5 sm:p-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest-deep">
              Moves
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">
              Need a van this weekend?
            </h2>
            <p className="mt-3 max-w-md text-ink/80">
              Studio, one-bed, or a few awkward pieces. Post the load size and
              book someone whose diary and vehicle match.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-medium">
              Book a move <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps. No borrowed Transit."
          body="Built for the moment you realise the Facebook sofa will not fit in a Prius."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-[24px] border border-line bg-cream p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage text-forest">
                <s.icon size={20} />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Step {i + 1}
              </p>
              <h3 className="font-display mt-1 text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow="Marketplace" title="Out this week" />
          <Button href="/marketplace" variant="ghost" size="sm">
            See all <ArrowRight size={16} />
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-sage/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Drivers"
              title="People with vans, ready this week"
              body="They set the rate. You see the vehicle, the hours they work, and what they have already hauled."
            />
            <Button href="/movers" variant="outline" size="sm">
              Browse movers
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featuredMovers.map((m) => {
              const stats = moverRating(reviews, m.userId);
              return (
                <MoverCard
                  key={m.id}
                  mover={m}
                  user={users.find((u) => u.id === m.userId)}
                  rating={stats.rating}
                  reviewCount={stats.count}
                  jobs={jobsDone(bookings, m.userId)}
                />
              );
            })}
          </div>
          <div className="mt-8 rounded-[24px] border border-forest/15 bg-cream p-6 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-2xl">Got spare hours and a vehicle?</p>
              <p className="mt-1 text-sm text-ink-soft">
                Register your van size and weekly availability. Jobs come to you.
              </p>
            </div>
            <Button href="/movers/join" className="mt-4 sm:mt-0">
              Drive with Haulsy
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
