"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { PageLoader, SectionHeading } from "@/components/ui/Media";
import { CITIES } from "@/lib/constants";
import { livePayments } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const { currentUser, hydrated, updateAccount, logout } = useStore();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (hydrated && !currentUser) router.replace("/login?next=/account");
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) return <PageLoader />;

  const live = livePayments();

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    updateAccount({
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      city: String(data.get("city") ?? currentUser?.city ?? "Toronto"),
      password: String(data.get("password") || currentUser?.password || ""),
    });
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Account"
        title={currentUser.name}
        body={currentUser.email}
      />

      <div
        className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
          live
            ? "bg-sage text-forest"
            : "border border-line bg-cream text-ink-soft"
        }`}
      >
        {live
          ? "Live Stripe keys detected. Checkout charges real cards."
          : "Demo accounts. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY in .env.local to leave demo payments."}
      </div>

      <form onSubmit={save} className="mt-8 space-y-4">
        <Field label="Name">
          <Input name="name" defaultValue={currentUser.name} required />
        </Field>
        <Field label="Phone">
          <Input name="phone" defaultValue={currentUser.phone} />
        </Field>
        <Field label="City">
          <Select name="city" defaultValue={currentUser.city}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Password" hint="Stored on this device in the demo.">
          <Input
            name="password"
            type="password"
            defaultValue={currentUser.password}
          />
        </Field>
        {saved ? (
          <p className="text-sm text-forest">Saved on this device.</p>
        ) : null}
        <Button type="submit" className="w-full">
          Save account
        </Button>
      </form>

      <div className="mt-8 flex gap-2">
        <Button href="/dashboard" variant="outline">
          Dashboard
        </Button>
        <Button variant="ghost" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
