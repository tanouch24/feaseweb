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

export const metadata: Metadata = { title: "Espace client — FeaseWeb", description: "Suivez le travail réalisé par FeaseWeb sur votre site.", alternates: { canonical: "/espace-client" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EspaceClientPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  const current = await requireClientSpace();
  const supabase = await createClient();
  if (!supabase) return <main className="client-space"><header className="client-header"><div><p className="client-eyebrow">ESPACE CLIENT FEASEWEB</p><h1>Votre espace est indisponible.</h1><p>Réessayez dans quelques instants.</p></div><LogoutButton /></header></main>;

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const secureRead = createAdminClient() ?? supabase;
  // Resolve the authenticated user's intake first, then its linked client.
  // Every following read is anchored to this server-side identity chain.
  const { data: intake } = await secureRead.from("project_intakes").select(`id, client_id, ${onboardingProjectSelect}`).eq("user_id", current.user.id).maybeSingle();
  const { data: linkedClient } = intake?.client_id ? await secureRead.from("clients").select("id, user_id, first_name, last_name, company, email, phone, status, started_at").eq("id", intake.client_id).maybeSingle() : { data: null };
  const { data: userClient } = linkedClient ? { data: null } : await secureRead.from("clients").select("id, user_id, first_name, last_name, company, email, phone, status, started_at").eq("user_id", current.user.id).maybeSingle();
  const client = linkedClient ?? userClient;
  const project = intake ? mapProjectIntake(intake) : null;
  if (!client && !project) return <main className="client-space"><header className="client-header"><div><p className="client-eyebrow">MON ESPACE FEASEWEB</p><h1>Commencez votre projet FeaseWeb</h1><p>Configurez votre site pour que FeaseWeb puisse préparer la suite.</p></div><ClientHeaderActions updates={[]} /></header><section className="client-card client-empty"><a className="client-button" href="/creer-mon-site">Configurer mon site</a><p className="client-muted-note">Vous pourrez ensuite suivre votre rendez-vous, votre paiement et la création de votre site ici.</p></section><ClientRequestForm compact supportOnly /></main>;

  const { data: intakeSite } = intake ? await secureRead.from("sites").select("id, name, domain, preview_url, production_url, status, created_at, launched_at").eq("project_intake_id", intake.id).order("created_at").limit(1).maybeSingle() : { data: null };
  const { data: legacySite } = !intakeSite && client ? await secureRead.from("sites").select("id, name, domain, preview_url, production_url, status, created_at, launched_at").eq("client_id", client.id).order("created_at").limit(1).maybeSingle() : { data: null };
  const site = intakeSite ?? legacySite;
  const [{ data: subscription }, { data: payments }, { data: updates }, { data: requests }, { data: seoActions }, { data: appointment }, { data: validation }] = await Promise.all([
    client ? secureRead.from("subscriptions").select("status, amount_cents, currency, next_billing_at, cancel_at_period_end, canceled_at, provider").eq("client_id", client.id).maybeSingle() : Promise.resolve({ data: null }),
    client ? secureRead.from("payments").select("id, amount_cents, status, created_at, invoice_reference, period_start, period_end").eq("client_id", client.id).order("created_at", { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
    intake ? secureRead.from("client_updates").select("id, update_type, action_type, title, description, status, activity_date, created_at, read_at").eq("visible_to_client", true).or(`project_intake_id.eq.${intake.id}${client ? `,client_id.eq.${client.id}` : ""}`).order("activity_date", { ascending: false }).order("created_at", { ascending: false }).limit(20) : client ? secureRead.from("client_updates").select("id, update_type, action_type, title, description, status, activity_date, created_at, read_at").eq("client_id", client.id).eq("visible_to_client", true).order("activity_date", { ascending: false }).order("created_at", { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
    client ? secureRead.from("modification_requests").select("id, title, category, message, status, created_at, resolved_at").eq("client_id", client.id).order("created_at", { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
    site ? secureRead.from("seo_actions").select("id, date, action, description, status").eq("site_id", site.id).order("date", { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
    project ? secureRead.from("project_appointments").select("appointment_status, appointment_date, appointment_time").eq("project_intake_id", intake!.id).maybeSingle() : Promise.resolve({ data: null }),
    project ? secureRead.from("project_validations").select("validation_status").eq("project_intake_id", intake!.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  const statusEvent = project && (project.projectStatus === "preview_ready" || project.projectStatus === "live") ? (project.projectStatus === "preview_ready" ? "preview_ready" : "site_live") : null;
  const onboardingComplete = project ? isOnboardingComplete(project) : false;
  return <main className="client-space client-space-v2 client-space-simple">{statusEvent && <TrackingEvent name={statusEvent} eventId={`project_status:${intake?.id}:${statusEvent}`} />}<SubscriptionPaidTracker enabled={subscription?.status === "actif" && (payments ?? []).some((payment) => payment.status === "paye")} /><header className="client-app-header"><div className="client-app-topline"><ClientHeaderActions updates={updates ?? []} firstName={current.profile?.first_name} /></div><div className="client-app-greeting"><p className="client-eyebrow">MON ESPACE FEASEWEB</p><h1>Bonjour{current.profile?.first_name ? ` ${current.profile.first_name}` : ""}</h1><p>Voici où en est votre projet.</p></div></header>{checkout === "success" && <div className="client-alert" role="status">Votre demande d'abonnement a bien été reçue. Le statut se met à jour après confirmation de Stripe.</div>}{checkout === "cancelled" && <div className="client-alert muted" role="status">Le paiement a été annulé. Votre dossier est conservé.</div>}{!onboardingComplete && <section className="client-card client-empty"><p className="client-eyebrow">À FINALISER</p><h2>Finalisez votre demande</h2><p className="client-muted-note">Quelques informations manquent encore pour préparer votre site.</p><a className="client-button" href="/creer-mon-site">Continuer ma configuration</a></section>}<ClientSpaceSections client={client} profile={current.profile} project={project} site={site} subscription={subscription} payments={payments ?? []} updates={updates ?? []} requests={requests ?? []} seoActions={seoActions ?? []} appointment={appointment} validation={validation} projectComplete={onboardingComplete} /></main>;
}
