"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const demos = [
  { email: "madhavi.buyer@haulsy.test", label: "Madhavi · buyer" },
  { email: "dharmesh.seller@haulsy.test", label: "Dharmesh · seller" },
  { email: "aisha.mover@haulsy.test", label: "Aisha · mover" },
];

function LoginForm() {
  const { login } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(next);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Welcome back
      </p>
      <h1 className="font-display mt-2 text-4xl">Log in to Haulsy</h1>
      <p className="mt-2 text-ink-soft">
        Demo accounts share the password <strong>demo123</strong>.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg">
          Log in
        </Button>
      </form>
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Try a demo person
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword("demo123");
              }}
              className="rounded-2xl border border-line bg-cream px-4 py-3 text-left text-sm hover:border-forest/30"
            >
              <span className="font-medium">{d.label}</span>
              <span className="mt-0.5 block text-xs text-ink-soft">
                {d.email}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-8 text-center text-sm text-ink-soft">
        New here?{" "}
        <a
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="font-medium text-forest"
        >
          Create an account
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
