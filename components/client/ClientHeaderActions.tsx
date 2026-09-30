import { ClientNotifications } from "@/components/client/ClientNotifications";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { ClientProfileCard } from "@/components/client/ClientProfileCard";

type Update = { id: string; update_type?: string; action_type?: string | null; title: string; description: string; read_at?: string | null };

export function ClientHeaderActions({ updates }: { updates: Update[] }) {
  return <div className="client-header-actions">
    <ClientNotifications updates={updates.map((update) => ({ id: update.id, updateType: update.update_type as never, actionType: update.action_type as never, title: update.title, description: update.description, readAt: update.read_at }))} variant="header" />
    <ClientProfileCard drawer />
    <LogoutButton className="client-logout-button" />
  </div>;
}
