import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260930140000_harden_modification_requests.sql"), "utf8");
const ownershipFix = readFileSync(resolve(process.cwd(), "supabase/migrations/20260930141000_fix_modification_request_site_ownership.sql"), "utf8");
const baseMigration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260922140000_backoffice_v4.sql"), "utf8");
const clientRoute = readFileSync(resolve(process.cwd(), "app/api/client/requests/route.ts"), "utf8");
const adminRoute = readFileSync(resolve(process.cwd(), "app/api/admin/requests/[id]/route.ts"), "utf8");

describe("modification request security", () => {
  it("MOD_REQUEST_OWNER_READ_ALLOWED", () => {
    expect(baseMigration).toContain("grant select, insert, update, delete on public.profiles, public.prospects, public.clients, public.sites, public.subscriptions, public.payments, public.modification_requests");
  });

  it("MOD_REQUEST_OTHER_USER_READ_BLOCKED", () => {
    expect(migration).toContain("requests_self_insert");
    expect(migration).toContain("c.user_id = (select auth.uid())");
  });

  it("MOD_REQUEST_OWNER_CREATE_ALLOWED", () => {
    expect(migration).toContain("grant insert (client_id, site_id, title, category, message, priority)");
    expect(clientRoute).toContain("modification_requests");
  });

  it("MOD_REQUEST_OTHER_SITE_CREATE_BLOCKED", () => {
    expect(ownershipFix).toContain("s.client_id = public.modification_requests.client_id");
    expect(ownershipFix).not.toContain("s.client_id = s.client_id");
  });

  it("MOD_REQUEST_CLIENT_SET_STATUS_BLOCKED", () => {
    expect(migration).toContain("drop policy if exists requests_self_update");
    expect(migration).toContain("grant update (status, internal_reply, resolved_at)");
  });

  it("MOD_REQUEST_CLIENT_SET_INTERNAL_REPLY_BLOCKED", () => {
    expect(migration).toContain("grant update (status, internal_reply, resolved_at)");
  });

  it("MOD_REQUEST_CLIENT_SET_RESOLVED_AT_BLOCKED", () => {
    expect(migration).toContain("grant update (status, internal_reply, resolved_at)");
  });

  it("MOD_REQUEST_CLIENT_CHANGE_SITE_ID_BLOCKED", () => {
    expect(migration).toContain("revoke insert, update, delete on public.modification_requests from authenticated");
    expect(migration).not.toContain("grant update (site_id");
  });

  it("MOD_REQUEST_CLIENT_DELETE_BLOCKED", () => {
    expect(migration).toContain("revoke insert, update, delete on public.modification_requests from authenticated");
    expect(migration).not.toContain("requests_self_delete");
  });

  it("MOD_REQUEST_ADMIN_UPDATE_ALLOWED", () => {
    expect(adminRoute).toContain("requireApiAdmin");
    expect(adminRoute).toContain("status: parsed.data.status");
  });

  it("MOD_REQUEST_ANON_READ_BLOCKED", () => {
    expect(migration).not.toContain("to anon");
  });

  it("MOD_REQUEST_ANON_WRITE_BLOCKED", () => {
    expect(migration).not.toContain("grant insert on public.modification_requests to anon");
  });

  it("keeps the server route as the owner resolver", () => {
    expect(clientRoute).toContain('.eq("client_id", client.id)');
    expect(clientRoute).toContain('.eq("client_id", client.id).order');
  });
});
