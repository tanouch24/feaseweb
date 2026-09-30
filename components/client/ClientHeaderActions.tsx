import { ClientNotifications } from "@/components/client/ClientNotifications";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { ClientProfileCard } from "@/components/client/ClientProfileCard";
import { Logo } from "@/components/layout/Logo";

type Update = { id: string; update_type?: string; action_type?: string | null; title: string; description: string; read_at?: string | null };

export function ClientHeaderActions({ updates, firstName }: { updates: Update[]; firstName?: string | null }) {
  return <>
    <div className="client-app-brand"><Logo /><nav aria-label="Navigation de l'espace client"><a href="#mon-site">Mon site</a><a href="#suivi-site">Suivi</a></nav></div>
    <div className="client-header-actions">
    <ClientNotifications updates={updates.map((update) => ({ id: update.id, updateType: update.update_type as never, actionType: update.action_type as never, title: update.title, description: update.description, readAt: update.read_at }))} variant="header" />
    <ClientProfileCard drawer label={firstName ? `${firstName} ▾` : "Mon profil"} />
    <LogoutButton className="client-logout-button" />
    </div>
  </>;
}
