import type { Metadata } from "next";
import { requireClient } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { StartSubscriptionButton, ManageSubscriptionButton } from "@/components/billing/BillingActions";

export const metadata: Metadata = {
  title: "Espace client — FeaseWeb",
  description:
    "Suivez l'état de votre site, votre référencement et vos demandes de modification depuis votre espace client FeaseWeb.",
  alternates: { canonical: "/espace-client" },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  incomplet: "En attente de paiement",
  essai: "Période d'essai",
  actif: "Actif",
  retard: "Paiement en retard",
  impaye: "Impayé",
  incomplet_expire: "Expiré",
  annule: "Annulé",
  en_pause: "En pause",
};

const NEEDS_ATTENTION = new Set(["retard", "impaye"]);

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function EspaceClientPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const current = await requireClient();
  const supabase = await createClient();
  const { data: client } = supabase
    ? await supabase.from("clients").select("id, company, status").eq("user_id", current.user.id).maybeSingle()
    : { data: null };

  const { data: subscription } = client && supabase
    ? await supabase
        .from("subscriptions")
        .select("status, next_billing_at, cancel_at_period_end")
        .eq("client_id", client.id)
        .maybeSingle()
    : { data: null };

  const { data: payments } = client && supabase
    ? await supabase
        .from("payments")
        .select("id, amount_cents, status, created_at, invoice_reference")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: null };

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">Espace client</p>
      <h1 className="mt-3 font-serif text-3xl text-ink md:text-4xl">Votre site, toujours sous contrôle.</h1>

      {checkout === "success" && (
        <div className="mt-8 rounded-lg border border-brand/30 bg-brand/5 p-5 text-brand-dark">
          Paiement reçu, activation en cours. Le statut ci-dessous se met à jour dès la confirmation de Stripe.
        </div>
      )}
      {checkout === "cancelled" && (
        <div className="mt-8 rounded-lg border border-line bg-white p-5 text-ink-soft">
          Le paiement a été annulé. Vous pouvez recommencer à tout moment.
        </div>
      )}

      {client ? (
        <div className="mt-10 rounded-lg border border-line bg-white p-8">
          <p className="font-serif text-2xl text-ink">{client.company}</p>
          <p className="mt-2 text-ink-soft">Statut du dossier : {client.status}</p>

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">Abonnement</p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <p className="font-serif text-xl text-ink">FeaseWeb — 49 €/mois</p>
              <p className="text-ink-soft">
                Statut : {subscription ? STATUS_LABELS[subscription.status] ?? subscription.status : "Aucun abonnement"}
              </p>
            </div>

            {subscription?.next_billing_at && (
              <p className="mt-2 text-sm text-ink-soft">
                {subscription.cancel_at_period_end
                  ? `Se termine le ${formatDate(subscription.next_billing_at)} (annulation programmée).`
                  : `Prochaine échéance : ${formatDate(subscription.next_billing_at)}.`}
              </p>
            )}

            {subscription && NEEDS_ATTENTION.has(subscription.status) && (
              <p className="mt-3 rounded-sm border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-ink">
                Paiement à régulariser — gérez votre moyen de paiement depuis le bouton ci-dessous.
              </p>
            )}

            <div className="mt-5">
              {subscription ? <ManageSubscriptionButton /> : <StartSubscriptionButton />}
            </div>
          </div>

          {payments && payments.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
                Historique des paiements
              </p>
              <ul className="mt-3 divide-y divide-line">
                {payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-ink-soft">{formatDate(payment.created_at)}</span>
                    <span className="text-ink">{(payment.amount_cents / 100).toFixed(2)} €</span>
                    <span className="text-ink-soft">{payment.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-sm text-ink-soft">
            Les demandes et le suivi du site seront disponibles ici au fur et à mesure de leur branchement.
          </p>
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-line bg-white p-8">
          <p className="font-serif text-xl text-ink">Votre espace est prêt.</p>
          <p className="mt-2 text-ink-soft">Aucun site n&apos;est encore associé à ce compte.</p>
        </div>
      )}
      <LogoutButton />
    </main>
  );
}
