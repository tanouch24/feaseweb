import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("client updates lifecycle safeguards", () => {
  it("reuses the existing table and adds only read/action fields", () => {
    const migration = source("supabase/migrations/20260928120000_client_updates_actions_read_state.sql");
    expect(migration).toContain("alter table public.client_updates");
    expect(migration).toContain("update_type");
    expect(migration).toContain("action_type");
    expect(migration).toContain("read_at");
    expect(migration).toContain("revoke all on public.client_updates from anon");
    expect(migration).not.toContain("create table");
  });

  it("keeps update creation admin-only and actions allowlisted", () => {
    const route = source("app/api/admin/client-updates/route.ts");
    const validation = source("lib/validation.ts");
    expect(route).toContain("requireApiAdmin");
    expect(validation).toContain("voir_apercu");
    expect(validation).toContain("completer_informations");
    expect(validation).toContain("voir_projet");
    expect(validation).not.toContain("actionUrl");
  });

  it("marks updates read only through an authenticated client-scoped server route", () => {
    const route = source("app/api/client/updates/read/route.ts");
    expect(route).toContain('current.role !== "client" && current.role !== "prospect"');
    expect(route).toContain('eq("user_id", current.user.id)');
    expect(route).toContain('candidate.project_intake_id === intake.id');
    expect(route).toContain('candidate.client_id === client.id');
    expect(route).toContain('eq("id", updateId)');
    expect(route).toContain("updateId");
    expect(route).toContain('is("read_at", null)');
  });

  it("does not hide resend failures behind a success response", () => {
    const route = source("app/api/onboarding/confirmation/resend/route.ts");
    expect(route).toContain("status: 502");
    expect(route).toContain("Impossible de renvoyer");
  });

  it("performs an explicit Supabase sign out in the admin shell", () => {
    const admin = source("components/admin/AdminApp.tsx");
    const logout = source("components/layout/LogoutButton.tsx");
    expect(admin).toContain('import { LogoutButton } from "@/components/layout/LogoutButton"');
    expect(logout).toContain("supabase?.auth.signOut()");
    expect(logout).toContain('fetch("/api/auth/logout"');
    expect(logout).toContain('window.location.replace("/connexion")');
  });

  it("keeps notifications visible until the client opens one", () => {
    const notifications = source("components/client/ClientNotifications.tsx");
    expect(notifications).toContain('client-unread-badge');
    expect(notifications).toContain('JSON.stringify({ updateId: id })');
    expect(notifications).toContain('Voir la demande');
    expect(notifications).toContain('readAt: new Date().toISOString()');
  });

  it("exposes the admin request flow without creating a parallel system", () => {
    const dossier = source("components/admin/DossierDetail.tsx");
    expect(dossier).toContain("Demander une information au client");
    expect(dossier).toContain('updateType: "action_requise"');
    expect(dossier).toContain("clientMessage");
  });
});
