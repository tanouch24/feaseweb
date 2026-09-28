import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export const metadata: Metadata = {
  title: "Politique de cookies — FeaseWeb",
  description: "Politique de cookies du site FeaseWeb.",
  alternates: { canonical: "/cookies" },
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Politique de cookies">
      <p>
        FeaseWeb propose des outils de mesure d’audience et de marketing
        uniquement après votre accord. Vous pouvez refuser, choisir séparément
        les catégories ou modifier votre choix à tout moment avec le bouton
        « Gérer mes cookies ».
      </p>
      <p>
        Les préférences sont conservées dans votre navigateur. Le refus ou
        l’absence de choix empêche le chargement de Google Analytics et du
        Pixel Meta.
      </p>
    </LegalPageLayout>
  );
}
