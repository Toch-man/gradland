import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { Providers } from "@/app/provider";
import "./globals.css";

// Display serif — used for headlines only
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

// Body/UI sans — used everywhere else
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Gradland — Find your path to it",
  description:
    "Gradland matches your profile to real scholarships, internships, graduate programmes, and admissions abroad — then shows you exactly what's missing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${plexSans.variable}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
