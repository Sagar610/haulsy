"use client";

import { Button } from "@/components/ui/Button";
import { useEffect, useRef, useState } from "react";

type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: {
            client_id: string;
            callback: (res: { credential: string }) => void;
          }) => void;
          renderButton: (
            el: HTMLElement,
            opts: { theme: string; size: string; width: number; text: string },
          ) => void;
        };
      };
    };
  }
}

function decodeJwt(credential: string): GoogleProfile | null {
  try {
    const payload = credential.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    if (!json.sub || !json.email) return null;
    return {
      googleId: json.sub,
      email: json.email,
      name: json.name ?? json.email,
      avatar: json.picture,
    };
  } catch {
    return null;
  }
}

export function GoogleButton({
  onProfile,
  label = "Continue with Google",
}: {
  onProfile: (profile: GoogleProfile) => void;
  label?: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const slot = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!clientId || !slot.current) return;
    const src = "https://accounts.google.com/gsi/client";
    const existing = document.querySelector(`script[src="${src}"]`);
    function boot() {
      if (!window.google || !slot.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => {
          const profile = decodeJwt(res.credential);
          if (profile) onProfile(profile);
        },
      });
      slot.current.innerHTML = "";
      window.google.accounts.id.renderButton(slot.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }
    if (existing) {
      boot();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = boot;
    document.head.appendChild(script);
  }, [clientId, onProfile]);

  if (!clientId) {
    return (
      <div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            setHint(
              "Add NEXT_PUBLIC_GOOGLE_CLIENT_ID from Google Cloud (OAuth web client) to .env.local, then restart.",
            )
          }
        >
          {label}
        </Button>
        {hint ? <p className="mt-2 text-xs text-ink-soft">{hint}</p> : null}
      </div>
    );
  }

  return <div ref={slot} className="flex justify-center" />;
}
