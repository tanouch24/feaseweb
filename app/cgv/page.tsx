/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export const metadata: Metadata = {
  title: "Conditions générales de vente — FeaseWeb",
  description: "Conditions générales de vente du service FeaseWeb.",
  alternates: { canonical: "/cgv" },
};

export default function CGVPage() {
  return (
    <LegalPageLayout title="Conditions générales de vente">
      <p>
        FeaseWeb propose actuellement une formule de service géré à 49 €/mois,
        sans frais de création ou de refonte. Le référencement SEO est inclus.
      </p>
      <p>
        Les modalités d'engagement, de résiliation, de transfert, de garanties
        et de responsabilités seront définies dans les CGV contractuelles avant
        toute souscription. Aucun frais de transfert ou de rachat n'est annoncé
        ici tant que cette décision n'est pas arrêtée.
      </p>
    </LegalPageLayout>
  );
}
