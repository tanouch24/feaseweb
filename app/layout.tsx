import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrackingConsent } from "@/components/analytics/TrackingConsent";
import { siteUrl } from "@/lib/site-config";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";
import "./globals.css";

const SITE_URL = siteUrl;

const bricolage = localFont({
  src: "./fonts/BricolageGrotesque-Variable.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "FeaseWeb — Votre site internet, sans avoir à vous en occuper",
  description:
    "FeaseWeb crée ou refait votre site, l'héberge, le maintient et travaille son référencement. 0 € de frais de création, puis 49 €/mois tout compris.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "FeaseWeb",
    title: "FeaseWeb — Votre site internet, sans avoir à vous en occuper",
    description: "Création ou refonte sans frais, puis 49 €/mois tout compris avec SEO inclus.",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: "FeaseWeb — Votre site internet, sans avoir à vous en occuper", description: "Création ou refonte sans frais, puis 49 €/mois tout compris." },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={bricolage.variable}>
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Header />
        {children}
        <Footer />
        <TrackingConsent />
      </body>
    </html>
  );
}
