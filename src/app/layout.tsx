import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PsychU Screening MVP",
  description: "Accessible screening, clinician triage, and student-controlled sharing for university pilots."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
