/* eslint-disable react/no-unescaped-entities */
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
        Le site FeaseWeb n'active pas volontairement de cookie publicitaire ou
        analytique dans cette version.
      </p>
      <p>
        Si des outils de mesure ou de personnalisation sont ajoutés plus tard,
        leurs finalités, durées et modalités de consentement seront documentées
        avant activation.
      </p>
    </LegalPageLayout>
  );
}
