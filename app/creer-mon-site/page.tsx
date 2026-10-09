import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { AccountCreationForm } from "@/components/onboarding/AccountCreationForm";
import { SignupAside } from "@/components/onboarding/SignupAside";
import { OnboardingConfigurator } from "@/components/onboarding/OnboardingConfigurator";
import { mapProjectIntake, onboardingProjectSelect } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Créer mon site — 0 € de frais de création | FeaseWeb",
  description:
    "Parlez-nous de votre entreprise : FeaseWeb prépare votre site, sans frais de création. Vous validez avant toute mise en ligne.",
  alternates: { canonical: "/creer-mon-site" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CreerMonSitePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const current = await getAuthenticatedProfile();
  if (current.role === "admin") redirect("/admin");
  if (!current.user)
    return (
      <main className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-brand">Votre projet FeaseWeb</p>
            <h1 className="mt-2 font-serif text-[2.2rem] leading-[1.05] text-ink md:text-[3rem]">
              Créez votre espace FeaseWeb
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-soft">
              Configurez votre projet en quelques minutes. Nous nous occupons
              ensuite de la création de votre site.
            </p>
            <div className="mt-10">
              <AccountCreationForm initialError={params.error === "invalid_link" ? "Ce lien de confirmation est invalide ou a expiré." : ""} />
            </div>
          </div>
          <SignupAside mode="create" />
        </div>
      </main>
    );
  const supabase = await createClient();
  const { data: project } = supabase ? await supabase.from("project_intakes").select(onboardingProjectSelect).eq("user_id", current.user.id).maybeSingle() : { data: null };
  if (!project) redirect("/espace-client");
  if (project.completed_at && (current.role === "client" || project.project_status !== "project_configured")) redirect("/espace-client");
  return <main className="mx-auto max-w-6xl px-6 py-16 md:py-24"><div className="mx-auto max-w-3xl"><OnboardingConfigurator initial={mapProjectIntake(project)} /></div></main>;
}
