/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { feasewebConfig } from "@/lib/feaseweb-config";

export const metadata: Metadata = {
  title: "Mentions légales — FeaseWeb",
  description: "Mentions légales du site FeaseWeb.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout title="Mentions légales">
      <p>
        Les informations d'identification actuellement vérifiées sont les suivantes.
      </p>
      <dl className="grid gap-3 sm:grid-cols-[180px_1fr]"><dt>Exploitant</dt><dd>{feasewebConfig.operator.name}</dd><dt>Statut</dt><dd>{feasewebConfig.operator.status}</dd><dt>Nom commercial</dt><dd>{feasewebConfig.operator.tradeName}</dd><dt>SIREN</dt><dd>{feasewebConfig.operator.siren}</dd><dt>SIRET</dt><dd>{feasewebConfig.operator.siret}</dd><dt>Adresse</dt><dd>{feasewebConfig.operator.address}</dd><dt>Code APE</dt><dd>{feasewebConfig.operator.ape}</dd></dl>
      <p className="border-l-2 border-accent pl-4">Les informations complémentaires obligatoires, notamment l'hébergeur et le directeur de publication, doivent encore être vérifiées avant publication juridique définitive.</p>
    </LegalPageLayout>
  );
}
