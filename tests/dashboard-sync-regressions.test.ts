import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("dashboard synchronization regressions", () => {
  it("resolves the client site from the authenticated intake/client chain", () => {
    const page = source("app/espace-client/page.tsx");
    expect(page).toContain("createAdminClient");
    expect(page).toContain('.eq("user_id", current.user.id)');
    expect(page).toContain('.eq("client_id", client.id)');
    expect(page).toContain('from("sites").select("id, name, domain, preview_url, production_url, status, created_at, launched_at")');
    expect(page).toContain('from("client_updates")');
  });

  it("persists and returns site URL fields from the admin site endpoint", () => {
    const route = source("app/api/admin/sites/[id]/route.ts");
    expect(route).toContain("createAdminClient");
    expect(route).toContain("patch.domain = parsed.data.domain");
    expect(route).toContain("patch.production_url = parsed.data.productionUrl");
    expect(route).toContain("select(\"id, client_id, domain, production_url, status, launched_at\")");
    expect(route).toContain("idempotencyKey = id");
  });

  it("keeps site links available for construction and live states", () => {
    const sections = source("components/client/ClientSpaceSections.tsx");
    expect(sections).toContain("siteUrl ? \"Votre site est en construction\"");
    expect(sections).toContain('href={siteUrl}');
    expect(sections).toContain('site?.status === "actif"');
  });

  it("opens the existing appointment picker from the single next-action CTA", () => {
    const sections = source("components/client/ClientSpaceSections.tsx");
    const appointment = source("components/client/ClientAppointmentCard.tsx");
    expect(sections).toContain('cta: "Choisir mon rendez-vous"');
    expect(sections).toContain('href: "#rendez-vous"');
    expect(appointment).toContain('window.location.hash !== "#rendez-vous"');
    expect(appointment).toContain("setExpanded(true)");
    expect(appointment).toContain("scrollIntoView");
  });

  it("creates an idempotent site-live notification only on the live transition", () => {
    const route = source("app/api/admin/sites/[id]/route.ts");
    expect(route).toContain('parsed.data.status === "actif" && before.status !== "actif"');
    expect(route).toContain('update_type: "mise_en_ligne"');
    expect(route).toContain("visible_to_client: true");
    expect(route).toContain("notification_status");
  });

  it("defines project_intake as the progressive canonical relation without removing legacy links", () => {
    const migration = source("supabase/migrations/20260930120000_project_intake_canonical_links.sql");
    expect(migration).toContain("add column if not exists project_intake_id uuid");
    expect(migration).toContain("sites_project_intake_id_fkey");
    expect(migration).toContain("client_updates_project_intake_id_fkey");
    expect(migration).toContain("alter table public.sites alter column client_id drop not null");
    expect(migration).toContain("alter table public.client_updates alter column client_id drop not null");
    expect(migration).toContain("sites_self_select");
    expect(migration).toContain("client_updates_self_select");
    expect(migration).toContain("sites_project_or_client_check");
    expect(migration).toContain("client_updates_project_or_client_check");
    expect(migration).toContain("client_updates_intake_idempotency_idx");
  });

  it("allows admin-created updates to resolve an intake without a client row", () => {
    const route = source("app/api/admin/client-updates/route.ts");
    const readRoute = source("app/api/client/updates/read/route.ts");
    expect(route).toContain('project_intake_id: intake?.id ?? null');
    expect(route).toContain('from("project_intakes")');
    expect(readRoute).toContain('current.role !== "client" && current.role !== "prospect"');
    expect(readRoute).toContain('from("project_intakes")');
    expect(readRoute).toContain("candidate.project_intake_id === intake.id");
  });

  it("uses only deterministic legacy reconciliation passes", () => {
    const migration = source("supabase/migrations/20260930120000_project_intake_canonical_links.sql");
    expect(migration).toContain("p.prospect_id = c.prospect_id");
    expect(migration).toContain("lower(trim(p.email)) = lower(trim(c.email))");
    expect(migration).toContain("where project_intake_id is null");
    expect(migration).toContain("canonical post-strategy unresolved");
  });

  it("preserves the intake and site through both conversion branches", () => {
    const migration = source("supabase/migrations/20260930120000_project_intake_canonical_links.sql");
    expect(migration).toContain("update public.project_intakes set client_id = c.id where id = intake.id");
    expect(migration).toContain("insert into public.sites (project_intake_id, client_id");
    expect(migration).toContain("coalesce(project_intake_id, intake.id)");
  });
});
