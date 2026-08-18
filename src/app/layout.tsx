import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Haulsy — Buy bulky. We bring it home.",
    template: "%s · Haulsy",
  },
  description:
    "A marketplace for furniture and large items, with movers who pick up and deliver. Or book a van to move house.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas font-sans text-ink">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
