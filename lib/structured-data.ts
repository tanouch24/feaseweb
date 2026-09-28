import { feasewebConfig } from "@/lib/feaseweb-config";
import { siteUrl } from "@/lib/site-config";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: feasewebConfig.brand,
  alternateName: feasewebConfig.operator.tradeName,
  description:
    "Service géré de site internet pour artisans, TPE, commerçants et indépendants. Création ou refonte sans frais, puis un abonnement mensuel tout compris.",
  url: siteUrl,
  identifier: [
    { "@type": "PropertyValue", propertyID: "SIREN", value: feasewebConfig.operator.siren.replaceAll(" ", "") },
    { "@type": "PropertyValue", propertyID: "SIRET", value: feasewebConfig.operator.siret.replaceAll(" ", "") },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "10 rue d’Hanoï",
    postalCode: "69100",
    addressLocality: "Villeurbanne",
    addressCountry: "FR",
  },
} as const;

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: feasewebConfig.brand,
  url: siteUrl,
  inLanguage: "fr-FR",
} as const;
