import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Three families, self-hosted by next/font — subset, preloaded, no layout shift,
 * and no runtime request to Google. Loading these from a stylesheet link instead
 * would cost a render-blocking round trip on every page.
 *
 *   display — page titles, KPI numerals, card headings
 *   sans    — everything dense: tables, forms, labels
 *   mono    — phone numbers, references, timestamps
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Gehox",
    template: "%s · Gehox",
  },
  description:
    "Every WhatsApp property inquiry your AI agent handled, in one place.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f3ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
