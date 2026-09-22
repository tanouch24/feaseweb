import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export const metadata: Metadata = {
  title: "Politique de cookies — FeaseWeb",
  description: "Politique de cookies du site FeaseWeb.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Politique de cookies">
      <p>
        Cette page décrit l&apos;utilisation de cookies sur le site FeaseWeb.
        Le contenu ci-dessous est une maquette de démonstration.
      </p>
      <p>
        [TODO: politique de cookies complète à rédiger et valider avant mise
        en production — liste des cookies utilisés, finalités, durées de
        conservation, gestion du consentement.]
      </p>
    </LegalPageLayout>
  );
}
