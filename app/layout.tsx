import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITR Ledger — Income Tax Estimator (FY 2025-26)",
  description:
    "Estimate your Indian income tax under the old and new regimes for FY 2025-26 (AY 2026-27). For estimation only — file your actual return on the official e-filing portal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-text antialiased">{children}</body>
    </html>
  );
}
