"use client";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { looksLikePhone } from "@/lib/phone";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const demos = [
  { email: "admin@haulsy.test", label: "Haulsy · admin" },
  { email: "madhavi.buyer@haulsy.test", label: "Madhavi · buyer" },
  { email: "dharmesh.seller@haulsy.test", label: "Dharmesh · seller" },
  { email: "aisha.mover@haulsy.test", label: "Aisha · mover" },
];

function LoginForm() {
  const { login, loginGoogle, requestOtp, loginWithOtp } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("demo123");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function goAfter(who: string) {
    const dest =
      next === "/dashboard" && who.toLowerCase() === "admin@haulsy.test"
        ? "/admin"
        : next;
    router.push(dest);
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    const res = login(identifier, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    goAfter(identifier);
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await requestOtp({ target: identifier, purpose: "login" });
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
  }

  function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    const res = loginWithOtp(identifier, code);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    goAfter(identifier);
  }

  function useDemo(demoEmail: string) {
    setIdentifier(demoEmail);
    setPassword("demo123");
    setError("");
    const res = login(demoEmail, "demo123");
    if (!res.ok) {
      setError(res.error);
      return;
    }
    goAfter(demoEmail);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Welcome back
      </p>
      <h1 className="font-display mt-2 text-4xl">Log in to Haulsy</h1>
      <p className="mt-2 text-ink-soft">
        Email, mobile, Google, or a one-time code. Demo password{" "}
        <strong>demo123</strong>.
      </p>

      <div className="mt-6">
        <GoogleButton
          onProfile={(profile) => {
            const res = loginGoogle(profile);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            goAfter(profile.email);
          }}
        />
      </div>

      <div className="mt-6 flex gap-2 text-sm">
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${mode === "password" ? "bg-forest text-cream" : "bg-sage text-ink-soft"}`}
          onClick={() => setMode("password")}
        >
          Password
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${mode === "otp" ? "bg-forest text-cream" : "bg-sage text-ink-soft"}`}
          onClick={() => setMode("otp")}
        >
          Mobile code
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={submitPassword} className="mt-5 space-y-4" noValidate>
          <Field label="Email or mobile">
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
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
      ) : (
        <form
          onSubmit={otpSent ? submitOtp : sendOtp}
          className="mt-5 space-y-4"
          noValidate
        >
          <Field label="Mobile number">
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              inputMode="tel"
              placeholder="416-555-0101"
              required
            />
          </Field>
          {otpSent ? (
            <Field label="One-time code">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                required
              />
            </Field>
          ) : null}
          {info ? <p className="text-sm text-forest">{info}</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {otpSent ? "Log in" : busy ? "Sending…" : "Send code"}
          </Button>
          {looksLikePhone(identifier) ? null : otpSent ? null : (
            <p className="text-xs text-ink-soft">Use a 10-digit mobile number.</p>
          )}
        </form>
      )}

      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="font-medium text-forest">
          Forgot password?
        </Link>
      </p>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Try a demo person
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => useDemo(d.email)}
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
