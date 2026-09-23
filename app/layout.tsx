import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteUrl } from "@/lib/site-config";
import "./globals.css";

const SITE_URL = siteUrl;

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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FeaseWeb",
  description:
    "Service géré de site internet pour artisans, TPE, commerçants et indépendants. Création ou refonte sans frais, puis un abonnement mensuel tout compris.",
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
