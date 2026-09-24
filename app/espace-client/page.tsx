/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { requireClientSpace } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { ProspectProjectDashboard } from "@/components/client/ProspectProjectDashboard";
import { ClientSpaceNavigation, ClientSpaceSections, ProductionDossierCard } from "@/components/client/ClientSpaceSections";
import { mapProjectIntake, onboardingProjectSelect } from "@/lib/onboarding";
import { calculateProductionCompleteness, mapProductionDossier, productionDossierSelect, type ProductionAccess, type ProductionMedia } from "@/lib/production";

export const metadata: Metadata = { title: "Espace client — FeaseWeb", description: "Suivez le travail réalisé par FeaseWeb sur votre site.", alternates: { canonical: "/espace-client" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EspaceClientPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  const current = await requireClientSpace();
  const supabase = await createClient();
  const { data: intake } = supabase ? await supabase.from("project_intakes").select(onboardingProjectSelect).eq("user_id", current.user.id).maybeSingle() : { data: null };
  if (current.role === "prospect" && intake) return <ProspectProjectDashboard project={mapProjectIntake(intake)} checkout={checkout} />;

  if (!supabase) return <main className="client-space"><header className="client-header"><div><p className="client-eyebrow">ESPACE CLIENT FEASEWEB</p><h1>Votre espace est indisponible.</h1><p>Réessayez dans quelques instants.</p></div><LogoutButton /></header></main>;

  const { data: client } = await supabase.from("clients").select("id, first_name, last_name, company, email, phone, status, started_at").eq("user_id", current.user.id).maybeSingle();
  if (!client) return <main className="client-space"><header className="client-header"><div><p className="client-eyebrow">ESPACE CLIENT FEASEWEB</p><h1>Votre espace est prêt.</h1><p>Aucun dossier client n'est encore associé à ce compte.</p></div><LogoutButton /></header><ClientSpaceNavigation /><section className="client-card client-empty"><p>Les informations de votre projet apparaîtront ici dès que le dossier sera associé.</p></section></main>;

  const { data: site } = await supabase.from("sites").select("id, name, domain, preview_url, production_url, status, created_at, launched_at").eq("client_id", client.id).order("created_at").limit(1).maybeSingle();
  const [{ data: subscription }, { data: payments }, { data: updates }, { data: requests }, { data: seoActions }, { data: seoMetrics }] = await Promise.all([
    supabase.from("subscriptions").select("status, amount_cents, currency, next_billing_at, cancel_at_period_end, canceled_at, provider").eq("client_id", client.id).maybeSingle(),
    supabase.from("payments").select("id, amount_cents, status, created_at, invoice_reference, period_start, period_end").eq("client_id", client.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("client_updates").select("id, category, title, description, status, activity_date, created_at").eq("client_id", client.id).eq("visible_to_client", true).order("activity_date", { ascending: false }).order("created_at", { ascending: false }).limit(20),
    supabase.from("modification_requests").select("id, title, category, message, status, created_at, resolved_at").eq("client_id", client.id).order("created_at", { ascending: false }).limit(50),
    site ? supabase.from("seo_actions").select("id, date, action, description, status").eq("site_id", site.id).order("date", { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
    site ? supabase.from("seo_metrics").select("id, clicks, impressions, ctr, average_position, synced_at").eq("site_id", site.id).order("synced_at", { ascending: false }).limit(12) : Promise.resolve({ data: [] }),
  ]);

  const project = intake ? mapProjectIntake(intake) : null;
  const [{ data: production }, { data: access }, { data: media }] = await Promise.all([
    supabase.from("production_dossiers").select(productionDossierSelect).eq("client_id", client.id).maybeSingle(),
    intake ? supabase.from("project_access_requirements").select("category, status, client_choice, client_note").eq("project_intake_id", (intake as unknown as { id: string }).id) : Promise.resolve({ data: [] }),
    supabase.from("project_media").select("id, original_name, media_type, mime_type, size_bytes, status, created_at").eq("client_id", client.id),
  ]);
  const completeness = project ? calculateProductionCompleteness(production ? mapProductionDossier(production) : null, project, (access ?? []) as ProductionAccess[], (media ?? []) as ProductionMedia[]) : null;
  return <main className="client-space client-space-v2"><header className="client-header"><div><p className="client-eyebrow">ESPACE CLIENT FEASEWEB</p><h1>Votre espace de suivi</h1><p>Suivez la production, les interventions et votre abonnement depuis un même endroit.</p></div><LogoutButton /></header>{checkout === "success" && <div className="client-alert" role="status">Votre demande d'abonnement a bien été reçue. Le statut se met à jour après confirmation de Stripe.</div>}{checkout === "cancelled" && <div className="client-alert muted" role="status">Le paiement a été annulé. Votre dossier est conservé.</div>}{project && <ProductionDossierCard completeness={completeness} />}<ClientSpaceSections client={client} profile={current.profile} project={project} site={site} subscription={subscription} payments={payments ?? []} updates={updates ?? []} requests={requests ?? []} seoActions={seoActions ?? []} seoMetrics={seoMetrics ?? []} /></main>;
}
