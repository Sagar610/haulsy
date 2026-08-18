"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { CITIES } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function SignupForm() {
  const { signup } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "demo123",
    phone: "",
    city: "Toronto",
    role: "buyer" as Role,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = signup({
      ...form,
      role: form.role as Role,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (form.role === "mover") router.push("/movers/join");
    else router.push(next);
  }

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Join
      </p>
      <h1 className="font-display mt-2 text-4xl">Create a Haulsy account</h1>
      <p className="mt-2 text-ink-soft">
        One account can buy, sell, and drive. You can add more roles later.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Full name">
          <Input value={form.name} onChange={set("name")} required />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={set("email")}
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={form.password}
            onChange={set("password")}
            required
          />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={set("phone")} />
        </Field>
        <Field label="City">
          <Select value={form.city} onChange={set("city")}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="I mostly want to">
          <Select value={form.role} onChange={set("role")}>
            <option value="buyer">Buy items and book movers</option>
            <option value="seller">Sell bulky items</option>
            <option value="mover">Drive and take jobs</option>
          </Select>
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg">
          Create account
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-forest">
          Log in
        </a>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
