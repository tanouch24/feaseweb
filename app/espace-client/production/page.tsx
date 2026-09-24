import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { mapProjectIntake, onboardingProjectSelect } from "@/lib/onboarding";
import { ProductionDossierForm } from "@/components/client/ProductionDossierForm";
import { ClientSpaceNavigation } from "@/components/client/ClientSpaceSections";
import { LogoutButton } from "@/components/layout/LogoutButton";

export const metadata: Metadata = { title: "Dossier de production — FeaseWeb", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ProductionDossierPage() {
  const current = await requireClient();
  const supabase = await createClient();
  if (!supabase) return <main className="client-space"><h1>Votre dossier est momentanément indisponible.</h1></main>;
  const { data: intake } = await supabase.from("project_intakes").select(`id, ${onboardingProjectSelect}`).eq("user_id", current.user.id).maybeSingle();
  if (!intake) redirect("/espace-client");
  return <main className="client-space client-space-v2"><header className="client-header"><div><p className="client-eyebrow">ESPACE CLIENT FEASEWEB</p><h1>Compléter mon dossier de production</h1><p>Préparons les informations nécessaires à la création de votre site.</p></div><LogoutButton /></header><ClientSpaceNavigation /><ProductionDossierForm project={mapProjectIntake(intake)} /></main>;
}
