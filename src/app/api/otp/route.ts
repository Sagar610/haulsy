import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { phone?: string; message?: string };
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!phone || !message) {
    return NextResponse.json({ ok: false, error: "Missing phone" }, { status: 400 });
  }

  const key = process.env.TEXTBELT_KEY || "textbelt";
  try {
    const res = await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message, key }),
    });
    const data = (await res.json()) as {
      success?: boolean;
      quotaRemaining?: number;
      error?: string;
    };
    return NextResponse.json({
      ok: Boolean(data.success),
      quotaRemaining: data.quotaRemaining ?? 0,
      error: data.error,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      error: "Could not reach the SMS service",
    });
  }
}
