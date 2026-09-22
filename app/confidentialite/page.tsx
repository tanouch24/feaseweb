/* eslint-disable react/no-unescaped-entities */
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
        FeaseWeb reçoit les informations transmises dans le formulaire de prise
        de contact afin d'étudier une demande de création ou de refonte de site.
        Ces informations sont destinées à FeaseWeb et ne sont pas utilisées pour
        afficher des métriques ou des publicités.
      </p>
      <p>
        Le formulaire demande notamment une identité, une entreprise, un email
        et les éléments utiles au projet. Le détail des durées de conservation,
        des sous-traitants et des modalités d'exercice des droits doit être
        complété et validé avant la mise en production juridique du service.
      </p>
    </LegalPageLayout>
  );
}
