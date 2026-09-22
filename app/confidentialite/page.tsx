import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité — FeaseWeb",
  description: "Politique de confidentialité du site FeaseWeb.",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout title="Politique de confidentialité">
      <p>
        Cette page décrit comment FeaseWeb traite les données personnelles de
        ses clients et visiteurs. Le contenu ci-dessous est une maquette de
        démonstration.
      </p>
      <p>
        [TODO: politique de confidentialité complète à rédiger et valider
        avant mise en production — données collectées, finalités, durées de
        conservation, sous-traitants, coordonnées du DPO, droits RGPD.]
      </p>
    </LegalPageLayout>
  );
}
