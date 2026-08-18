import { Logo } from "@/components/layout/Logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            Buy bulky finds without borrowing a van. Haulsy matches the size of
            the thing to someone with the right vehicle, then they bring it to
            your door.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">
            Product
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/marketplace" className="hover:text-ink">
                Marketplace
              </Link>
            </li>
            <li>
              <Link href="/moves" className="hover:text-ink">
                Book a move
              </Link>
            </li>
            <li>
              <Link href="/movers" className="hover:text-ink">
                Find movers
              </Link>
            </li>
            <li>
              <Link href="/movers/join" className="hover:text-ink">
                Drive with Haulsy
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-ink">
                Your account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">
            Demo
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              Payments: Stripe when keys are set, otherwise a demo card.
            </li>
            <li>Maps: OpenStreetMap. Distance sets the haul fee.</li>
            <li>Password for seed accounts: demo123</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-ink-soft sm:px-6">
          Haulsy — haul + easy. Maps via OpenStreetMap. Stripe is optional.
        </p>
      </div>
    </footer>
  );
}
