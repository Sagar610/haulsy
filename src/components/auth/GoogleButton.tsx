"use client";

import { Button } from "@/components/ui/Button";
import { useRef, useState } from "react";

type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
};

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (opts: {
            client_id: string;
            scope: string;
            callback: (res: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";
let gisLoading: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisLoading) return gisLoading;
  gisLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Could not load Google sign-in.")),
      );
      if (window.google?.accounts?.oauth2) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google sign-in."));
    document.head.appendChild(script);
  });
  return gisLoading;
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleButton({
  onProfile,
  label = "Continue with Google",
}: {
  onProfile: (profile: GoogleProfile) => void;
  label?: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const onProfileRef = useRef(onProfile);
  const clientRef = useRef<TokenClient | null>(null);
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);

  onProfileRef.current = onProfile;

  async function startGoogle() {
    setHint("");
    if (!clientId) {
      setHint(
        "Add NEXT_PUBLIC_GOOGLE_CLIENT_ID from Google Cloud (OAuth web client) to .env.local, then restart.",
      );
      return;
    }

    setBusy(true);
    try {
      await loadGis();
      if (!window.google?.accounts.oauth2) {
        throw new Error("Google sign-in is unavailable.");
      }

      const handleToken = async (res: {
        access_token?: string;
        error?: string;
        error_description?: string;
      }) => {
        if (res.error || !res.access_token) {
          setBusy(false);
          if (res.error === "popup_closed_by_user") return;
          setHint(res.error_description || "Google sign-in was cancelled.");
          return;
        }
        try {
          const userRes = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${res.access_token}` } },
          );
          if (!userRes.ok) throw new Error("Could not read your Google profile.");
          const user = (await userRes.json()) as {
            sub?: string;
            email?: string;
            name?: string;
            picture?: string;
          };
          if (!user.sub || !user.email) {
            throw new Error("Google did not return an email address.");
          }
          onProfileRef.current({
            googleId: user.sub,
            email: user.email,
            name: user.name ?? user.email,
            avatar: user.picture,
          });
        } catch (err) {
          setHint(
            err instanceof Error ? err.message : "Google sign-in failed.",
          );
        } finally {
          setBusy(false);
        }
      };

      if (!clientRef.current) {
        clientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: (res) => {
            void handleToken(res);
          },
          error_callback: (err) => {
            setBusy(false);
            if (err.type === "popup_closed") return;
            setHint(err.message || "Google sign-in was cancelled.");
          },
        });
      }
      clientRef.current.requestAccessToken({ prompt: "" });
    } catch (err) {
      setBusy(false);
      setHint(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full border-line bg-cream text-ink hover:border-forest/35 hover:bg-sage"
        onClick={() => void startGoogle()}
        disabled={busy}
      >
        <GoogleMark />
        {busy ? "Connecting…" : label}
      </Button>
      {hint ? <p className="mt-2 text-center text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}
