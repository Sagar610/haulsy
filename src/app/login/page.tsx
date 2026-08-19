"use client";

import { AuthScreen } from "@/components/auth/AuthScreen";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

const demos = [
  { email: "admin@haulsy.test", name: "Admin", role: "Operations" },
  { email: "madhavi.buyer@haulsy.test", name: "Madhavi", role: "Buyer" },
  { email: "dharmesh.seller@haulsy.test", name: "Dharmesh", role: "Seller" },
  { email: "aisha.mover@haulsy.test", name: "Aisha", role: "Mover" },
];

function LoginForm() {
  const { login, loginGoogle, requestOtp, loginWithOtp } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const onGoogle = useCallback(
    (profile: {
      email: string;
      googleId: string;
      name: string;
      avatar?: string;
    }) => {
      const res = loginGoogle(profile);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const dest =
        next === "/dashboard" &&
        profile.email.toLowerCase() === "admin@haulsy.test"
          ? "/admin"
          : next;
      router.push(dest);
    },
    [loginGoogle, next, router],
  );

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
        ? "We sent a code to your mobile."
        : res.demoCode
          ? `Demo code: ${res.demoCode}`
          : "Enter the code.",
    );
  }

  function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
    <AuthScreen>
      <div>
        <h1 className="font-display text-[2rem] leading-tight tracking-tight text-ink">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Welcome back. Use Google, email, or a mobile code.
        </p>

        <div className="mt-8">
          <GoogleButton onProfile={onGoogle} />
        </div>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
            or
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div
          className="grid grid-cols-2 rounded-xl bg-canvas-2 p-1"
          role="tablist"
          aria-label="Sign-in method"
        >
          {(
            [
              ["password", "Email"],
              ["otp", "Mobile"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === id
                  ? "bg-cream text-ink shadow-[0_1px_2px_rgba(26,26,26,0.06)]"
                  : "text-ink-soft hover:text-ink"
              }`}
              onClick={() => {
                setMode(id);
                setError("");
                setInfo("");
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "password" ? (
          <form onSubmit={submitPassword} className="mt-5 space-y-4" noValidate>
            <Field label="Email or mobile">
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                placeholder="you@email.com"
                required
              />
            </Field>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-medium text-ink">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-forest hover:text-forest-deep"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-11"
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-ink-soft hover:text-ink"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error ? (
              <p
                className="rounded-xl border border-danger/15 bg-danger/5 px-3 py-2 text-sm text-danger"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg">
              Sign in
            </Button>
          </form>
        ) : (
          <form
            onSubmit={otpSent ? submitOtp : sendOtp}
            className="mt-5 space-y-4"
            noValidate
          >
            <Field
              label="Mobile number"
              hint={otpSent ? undefined : "Use a 10-digit Canadian mobile number."}
            >
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="416 555 0101"
                required
              />
            </Field>
            {otpSent ? (
              <Field label="One-time code">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  required
                />
              </Field>
            ) : null}
            {info ? (
              <p className="rounded-xl border border-forest/15 bg-sage px-3 py-2 text-sm text-forest">
                {info}
              </p>
            ) : null}
            {error ? (
              <p
                className="rounded-xl border border-danger/15 bg-danger/5 px-3 py-2 text-sm text-danger"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {otpSent ? "Sign in" : busy ? "Sending…" : "Send code"}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-ink-soft">
          New to Haulsy?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="font-semibold text-forest hover:text-forest-deep"
          >
            Create an account
          </Link>
        </p>

        <details className="group mt-10 border-t border-line pt-5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden">
            Preview with a demo account
            <ChevronDown
              size={16}
              className="ml-auto transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {demos.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => useDemo(d.email)}
                className="rounded-xl border border-line bg-cream px-3 py-2.5 text-left transition-colors hover:border-forest/25 hover:bg-white"
              >
                <span className="block text-sm font-medium text-ink">{d.name}</span>
                <span className="mt-0.5 block text-[11px] text-ink-soft">
                  {d.role}
                </span>
              </button>
            ))}
          </div>
        </details>
      </div>
    </AuthScreen>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
