import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        404
      </p>
      <h1 className="font-display mt-3 text-4xl">That page has moved</h1>
      <p className="mt-3 text-ink-soft">
        Try the marketplace, or book a van from the moves page.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/">Home</Button>
        <Button href="/marketplace" variant="outline">
          Marketplace
        </Button>
      </div>
    </div>
  );
}
