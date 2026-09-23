import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { AccountCreationForm } from "@/components/onboarding/AccountCreationForm";
import { OnboardingConfigurator } from "@/components/onboarding/OnboardingConfigurator";

export const metadata: Metadata = {
  title: "Créer mon site — 0 € de frais de création | FeaseWeb",
  description:
    "Parlez-nous de votre entreprise : FeaseWeb prépare votre site, sans frais de création. Vous validez avant toute mise en ligne.",
  alternates: { canonical: "/creer-mon-site" },
};

export const dynamic = "force-dynamic";

export default async function CreerMonSitePage() {
  const current = await getAuthenticatedProfile();
  if (current.role === "admin") redirect("/admin");
  if (!current.user) return <main className="mx-auto max-w-2xl px-6 py-16 md:py-24"><p className="text-xs font-medium uppercase tracking-widest text-brand-dark">Votre projet FeaseWeb</p><h1 className="mt-3 font-serif text-3xl text-ink md:text-4xl">Créez votre espace FeaseWeb</h1><p className="mt-4 text-ink-soft">Configurez votre projet en quelques minutes. Nous nous occupons ensuite de la création de votre site.</p><div className="mt-10"><AccountCreationForm /></div></main>;
  const supabase = await createClient();
  const { data: project } = supabase ? await supabase.from("project_intakes").select("*").eq("user_id", current.user.id).maybeSingle() : { data: null };
  if (!project) redirect("/espace-client");
  if (project.completed_at) redirect("/espace-client");
  return <main className="mx-auto max-w-6xl px-6 py-16 md:py-24"><div className="mx-auto max-w-3xl"><OnboardingConfigurator initial={project} /></div></main>;
}
