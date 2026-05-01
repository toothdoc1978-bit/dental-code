import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { MobileBottomCTA } from "@/components/MobileBottomCTA";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Dentist in Bastrop, LA | ${site.practiceName} | ${site.seoName}`,
    template: `%s | ${site.practiceName}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.practiceName,
    title: `Dentist in Bastrop, LA | ${site.practiceName} | ${site.seoName}`,
    description: site.description,
    images: ["/og/default.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-brand-700 focus:shadow-soft"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" className="pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomCTA />
        <JsonLd />
      </body>
    </html>
  );
}
