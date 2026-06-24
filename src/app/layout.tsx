import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synaptec — Neuropsychological evaluations with a two-week turnaround",
  description:
    "Synaptec provides neuropsychological evaluations for college and grad students with a two-week turnaround: online forms, a virtual clinician evaluation, and a report with a treatment plan and recommendations."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
