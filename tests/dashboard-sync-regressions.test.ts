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
    expect(route).toContain("select(\"id, project_intake_id, client_id, domain, production_url, status, launched_at\")");
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

  it("saves a site URL through the dossier identity and rereads the persisted row", () => {
    const route = source("app/api/admin/project-intakes/[id]/site/route.ts");
    const store = source("lib/backoffice-store.tsx");
    const dossier = source("components/admin/DossierDetail.tsx");
    expect(route).toContain('eq("project_intake_id", intake.id)');
    expect(route).toContain('insert({ project_intake_id: intake.id');
    expect(route).toContain("select(siteSelect).single()");
    expect(store).toContain("/api/admin/project-intakes/${projectIntakeId}/site");
    expect(dossier).toContain("saveSiteForProject(project.id, siteDomain.trim())");
  });

  it("keeps the client site and live notification intake-scoped", () => {
    const page = source("app/espace-client/page.tsx");
    const liveRoute = source("app/api/admin/sites/[id]/route.ts");
    expect(page).toContain('eq("project_intake_id", intake.id)');
    expect(page).toContain("project_intake_id.eq.${intake.id}");
    expect(liveRoute).toContain("before.project_intake_id ?? intake?.id ?? null");
    expect(liveRoute).toContain('idempotencyKey = id');
  });

  it("keeps the timeline connector at marker level and cards content-sized", () => {
    const css = source("app/globals.css");
    expect(css).toContain("client-project-timeline-item:not(:last-child)::after { top: 14px; }");
    expect(css).toContain("client-dashboard-grid > div > .client-card, .client-space-simple .client-dashboard-grid > section { height: auto");
    expect(css).toContain("client-project-grid { align-items: start; }");
  });

  it("aggregates preclient support messages into admin requests by intake", () => {
    const mapper = source("lib/backoffice-mappers.ts");
    const requests = source("components/admin/RequestsPageV6.tsx");
    expect(mapper).toContain('id: `support:${intake.id}`');
    expect(mapper).toContain("projectIntakeId: intake.id");
    expect(mapper).toContain("const requests = [...modificationRequests, ...messageRequests, ...supportMessages]");
    expect(requests).toContain('href={`/admin/dossiers/${dossierId}`}');
    expect(requests).toContain('request.id.startsWith("support:")');
  });

  it("maps required actions to working client actions", () => {
    const sections = source("components/client/ClientSpaceSections.tsx");
    const form = source("components/client/ClientRequestForm.tsx");
    expect(sections).toContain('kind: "payment"');
    expect(sections).toContain("StartSubscriptionButton label={item.cta}");
    expect(sections).toContain('href: "#rendez-vous"');
    expect(sections).toContain('href: "#message-client"');
    expect(form).toContain('window.location.hash === `#${openHash}`');
    expect(sections).not.toContain('href: "#notifications", cta: "Répondre"');
  });

  it("keeps a single payment CTA when payment is the next action", () => {
    const sections = source("components/client/ClientSpaceSections.tsx");
    expect(sections).toContain('nextAction?.kind === "payment"');
    expect(sections).toContain("Paiement à effectuer");
    expect(sections).toContain('StartSubscriptionButton label={item.cta}');
  });

  it("stores client messages as an intake-first durable history", () => {
    const migration = source("supabase/migrations/20260930130000_project_messages.sql");
    const route = source("app/api/onboarding/support/route.ts");
    const bootstrap = source("app/api/admin/bootstrap/route.ts");
    expect(migration).toContain("create table if not exists public.project_messages");
    expect(migration).toContain("project_messages_legacy_source_idx");
    expect(migration).toContain("project_messages_owner_insert");
    expect(migration).toContain("project_messages_owner_select");
    expect(route).toContain('from("project_messages").insert');
    expect(route).toContain('project_intake_id: intake.id');
    expect(bootstrap).toContain('"project_messages"');
  });

  it("exposes unread project messages in admin and marks them read explicitly", () => {
    const mapper = source("lib/backoffice-mappers.ts");
    const shell = source("components/admin/AdminApp.tsx");
    const requests = source("components/admin/RequestsPageV6.tsx");
    const readRoute = source("app/api/admin/project-messages/[id]/read/route.ts");
    expect(mapper).toContain('source: "project_message"');
    expect(shell).toContain("unreadRequests");
    expect(requests).toContain("markProjectMessageRead");
    expect(readRoute).toContain('update({ read_at: new Date().toISOString() })');
  });
});
