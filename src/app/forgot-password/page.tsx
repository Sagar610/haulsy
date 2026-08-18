"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { looksLikePhone } from "@/lib/phone";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ForgotForm() {
  const { requestOtp, resetPassword } = useStore();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/login";
  const [step, setStep] = useState<"ask" | "code">("ask");
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await requestOtp({ target, purpose: "reset" });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setStep("code");
    setInfo(
      res.sms
        ? "Code sent by SMS."
        : res.demoCode
          ? `SMS is not available for this number (free Textbelt quota is 1/day, and 555 demo numbers cannot receive texts). Your code is ${res.demoCode}.`
          : "Enter the code we sent.",
    );
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const res = resetPassword(target, code, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Account
      </p>
      <h1 className="font-display mt-2 text-4xl">Reset password</h1>
      <p className="mt-2 text-ink-soft">
        Use the email or mobile on the account. We send a one-time code.
      </p>

      {step === "ask" ? (
        <form onSubmit={send} className="mt-8 space-y-4" noValidate>
          <Field
            label="Email or mobile"
            hint={
              looksLikePhone(target)
                ? "A code will be sent by SMS when the free quota allows."
                : undefined
            }
          >
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="you@email.com or 416…"
              required
            />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={save} className="mt-8 space-y-4" noValidate>
          {info ? <p className="rounded-xl bg-sage px-3 py-2 text-sm text-forest">{info}</p> : null}
          <Field label="One-time code">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              required
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full">
            Save new password
          </Button>
          <button
            type="button"
            className="w-full text-sm text-forest"
            onClick={() => {
              setStep("ask");
              setError("");
              setInfo("");
            }}
          >
            Use a different email or number
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-ink-soft">
        <Link href="/login" className="font-medium text-forest">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotForm />
    </Suspense>
  );
}
