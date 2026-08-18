"use client";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { CITIES } from "@/lib/constants";
import { looksLikePhone } from "@/lib/phone";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function SignupForm() {
  const { signup, signupWithOtp, requestOtp, loginGoogle } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "demo123",
    phone: "",
    city: "Toronto",
    role: "buyer" as Role,
  });

  function after(role: Role) {
    if (role === "mover") router.push("/movers/join");
    else router.push(next);
  }

  const phoneSignup = looksLikePhone(form.phone) && !form.email.trim();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (phoneSignup) {
      if (!otpSent) {
        setBusy(true);
        const res = await requestOtp({ target: form.phone, purpose: "signup" });
        setBusy(false);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setOtpSent(true);
        setInfo(
          res.sms
            ? "Code sent by SMS."
            : res.demoCode
              ? `Demo code: ${res.demoCode}`
              : "Enter the code.",
        );
        return;
      }
      const made = signupWithOtp({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        city: form.city,
        role: form.role,
        code,
      });
      if (!made.ok) {
        setError(made.error);
        return;
      }
      after(form.role);
      return;
    }

    const res = signup({
      ...form,
      role: form.role as Role,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    after(form.role);
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
        Email and password, Google, or mobile with a one-time code.
      </p>

      <div className="mt-6">
        <GoogleButton
          onProfile={(profile) => {
            const res = loginGoogle(profile);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            router.push(next);
          }}
        />
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Full name">
          <Input value={form.name} onChange={set("name")} required />
        </Field>
        <Field label="Email" hint="Skip this if you join with a mobile number.">
          <Input
            type="text"
            inputMode="email"
            autoComplete="username"
            value={form.email}
            onChange={set("email")}
          />
        </Field>
        <Field label="Mobile">
          <Input
            value={form.phone}
            onChange={set("phone")}
            inputMode="tel"
            placeholder="416-555-0199"
          />
        </Field>
        {phoneSignup && otpSent ? (
          <Field label="SMS code">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              required
            />
          </Field>
        ) : null}
        {!phoneSignup ? (
          <Field label="Password">
            <Input
              type="password"
              value={form.password}
              onChange={set("password")}
              required
            />
          </Field>
        ) : null}
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
        {info ? <p className="text-sm text-forest">{info}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {phoneSignup && !otpSent
            ? busy
              ? "Sending…"
              : "Send mobile code"
            : "Create account"}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <a
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-medium text-forest"
        >
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
