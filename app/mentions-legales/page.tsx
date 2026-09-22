import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export const metadata: Metadata = {
  title: "Mentions légales — FeaseWeb",
  description: "Mentions légales du site FeaseWeb.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout title="Mentions légales">
      <p>
        Cette page présente les mentions légales du site FeaseWeb. Le contenu
        ci-dessous est une maquette de démonstration.
      </p>
      <p>
        [TODO: contenu juridique à rédiger et valider avant mise en
        production — raison sociale, forme juridique, SIREN, adresse du
        siège, capital social, nom du directeur de publication, coordonnées
        de l&apos;hébergeur.]
      </p>
    </LegalPageLayout>
  );
}
