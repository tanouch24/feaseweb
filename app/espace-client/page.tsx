/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { requireClientSpace } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { ClientSpaceSections } from "@/components/client/ClientSpaceSections";
import { ClientRequestForm } from "@/components/client/ClientRequestForm";
import { ClientHeaderActions } from "@/components/client/ClientHeaderActions";
import { isOnboardingComplete, mapProjectIntake, onboardingProjectSelect } from "@/lib/onboarding";
import { SubscriptionPaidTracker } from "@/components/analytics/TrackingEvent";
import { TrackingEvent } from "@/components/analytics/TrackingEvent";
import { ClientProfileCard } from "@/components/client/ClientProfileCard";

export const metadata: Metadata = { title: "Espace client — FeaseWeb", description: "Suivez le travail réalisé par FeaseWeb sur votre site.", alternates: { canonical: "/espace-client" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EspaceClientPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  const current = await requireClientSpace();
  const supabase = await createClient();
  if (!supabase) return <main className="client-space"><header className="client-header"><div><p className="client-eyebrow">ESPACE CLIENT FEASEWEB</p><h1>Votre espace est indisponible.</h1><p>Réessayez dans quelques instants.</p></div><LogoutButton /></header></main>;

  // The intake belongs to the authenticated user before any Stripe conversion.
  // It is the continuity anchor for the whole user space; a clients row is optional.
  const { data: intake } = await supabase.from("project_intakes").select(`id, ${onboardingProjectSelect}`).eq("user_id", current.user.id).maybeSingle();
  const { data: client } = await supabase.from("clients").select("id, first_name, last_name, company, email, phone, status, started_at").eq("user_id", current.user.id).maybeSingle();
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const secureRead = createAdminClient() ?? supabase;
  const project = intake ? mapProjectIntake(intake) : null;
  if (!client && !project) return <main className="client-space"><header className="client-header"><div><p className="client-eyebrow">MON ESPACE FEASEWEB</p><h1>Commencez votre projet FeaseWeb</h1><p>Configurez votre site pour que FeaseWeb puisse préparer la suite.</p></div><ClientHeaderActions updates={[]} /></header><section className="client-card client-empty"><a className="client-button" href="/creer-mon-site">Configurer mon site</a><p className="client-muted-note">Vous pourrez ensuite suivre votre rendez-vous, votre paiement et la création de votre site ici.</p></section><ClientRequestForm compact supportOnly /></main>;

  const { data: site } = client ? await supabase.from("sites").select("id, name, domain, preview_url, production_url, status, created_at, launched_at").eq("client_id", client.id).order("created_at").limit(1).maybeSingle() : { data: null };
  const [{ data: subscription }, { data: payments }, { data: updates }, { data: requests }, { data: seoActions }, { data: appointment }, { data: validation }] = await Promise.all([
    client ? supabase.from("subscriptions").select("status, amount_cents, currency, next_billing_at, cancel_at_period_end, canceled_at, provider").eq("client_id", client.id).maybeSingle() : Promise.resolve({ data: null }),
    client ? supabase.from("payments").select("id, amount_cents, status, created_at, invoice_reference, period_start, period_end").eq("client_id", client.id).order("created_at", { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
    client ? supabase.from("client_updates").select("id, update_type, action_type, title, description, status, activity_date, created_at, read_at").eq("client_id", client.id).eq("visible_to_client", true).order("activity_date", { ascending: false }).order("created_at", { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
    client ? supabase.from("modification_requests").select("id, title, category, message, status, created_at, resolved_at").eq("client_id", client.id).order("created_at", { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
    site ? supabase.from("seo_actions").select("id, date, action, description, status").eq("site_id", site.id).order("date", { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
    project ? secureRead.from("project_appointments").select("appointment_status, appointment_date, appointment_time").eq("project_intake_id", intake!.id).maybeSingle() : Promise.resolve({ data: null }),
    project ? secureRead.from("project_validations").select("validation_status").eq("project_intake_id", intake!.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  const statusEvent = project && (project.projectStatus === "preview_ready" || project.projectStatus === "live") ? (project.projectStatus === "preview_ready" ? "preview_ready" : "site_live") : null;
  const onboardingComplete = project ? isOnboardingComplete(project) : false;
  return <main className="client-space client-space-v2 client-space-simple">{statusEvent && <TrackingEvent name={statusEvent} eventId={`project_status:${intake?.id}:${statusEvent}`} />}<SubscriptionPaidTracker enabled={subscription?.status === "actif" && (payments ?? []).some((payment) => payment.status === "paye")} /><header className="client-header"><div><p className="client-eyebrow">MON ESPACE FEASEWEB</p><h1>Mon site FeaseWeb</h1><p>Bonjour{current.profile?.first_name ? ` ${current.profile.first_name}` : ""}. Voici le suivi de votre site, en quelques étapes.</p></div><ClientHeaderActions updates={updates ?? []} /></header>{checkout === "success" && <div className="client-alert" role="status">Votre demande d'abonnement a bien été reçue. Le statut se met à jour après confirmation de Stripe.</div>}{checkout === "cancelled" && <div className="client-alert muted" role="status">Le paiement a été annulé. Votre dossier est conservé.</div>}{!onboardingComplete && <section className="client-card client-empty"><p className="client-eyebrow">À FINALISER</p><h2>Finalisez votre demande</h2><p className="client-muted-note">Quelques informations manquent encore pour préparer votre site.</p><a className="client-button" href="/creer-mon-site">Continuer ma configuration</a></section>}<ClientSpaceSections client={client} profile={current.profile} project={project} site={site} subscription={subscription} payments={payments ?? []} updates={updates ?? []} requests={requests ?? []} seoActions={seoActions ?? []} appointment={appointment} validation={validation} projectComplete={onboardingComplete} /><div id="mon-profil"><ClientProfileCard /></div></main>;
}
