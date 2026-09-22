import type { Metadata } from "next";
import { requireClient } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/layout/LogoutButton";

export const metadata: Metadata = {
  title: "Espace client — FeaseWeb",
  description:
    "Suivez l'état de votre site, votre référencement et vos demandes de modification depuis votre espace client FeaseWeb.",
  alternates: { canonical: "/espace-client" },
};
export const dynamic = "force-dynamic";

export default async function EspaceClientPage() {
  const current = await requireClient();
  const supabase = await createClient();
  const { data: client } = supabase ? await supabase.from("clients").select("company, status").eq("user_id", current.user.id).maybeSingle() : { data: null };
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">Espace client</p>
      <h1 className="mt-3 font-serif text-3xl text-ink md:text-4xl">Votre site, toujours sous contrôle.</h1>
      {client ? <div className="mt-10 rounded-lg border border-line bg-white p-8"><p className="font-serif text-2xl text-ink">{client.company}</p><p className="mt-2 text-ink-soft">Statut : {client.status}</p><p className="mt-6 text-sm text-ink-soft">Les demandes, le suivi du site et les informations d&apos;abonnement seront disponibles ici au fur et à mesure de leur branchement.</p></div> : <div className="mt-10 rounded-lg border border-line bg-white p-8"><p className="font-serif text-xl text-ink">Votre espace est prêt.</p><p className="mt-2 text-ink-soft">Aucun site n&apos;est encore associé à ce compte.</p></div>}
      <LogoutButton />
    </main>
  );
}
