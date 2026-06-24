import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synaptec — Virtual neuropsych evaluations in 15 days. Launching Fall 2026.",
  description:
    "The waitlist for neuropsychological testing is 6 months. Synaptec is launching a 100% virtual, clinician-signed evaluation in 15 days. Join the priority waitlist for Fall 2026."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
