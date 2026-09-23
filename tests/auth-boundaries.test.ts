import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("server auth boundaries", () => {
  it("protects admin layout before rendering the client console", () => {
    const source = readFileSync(resolve(process.cwd(), "app/admin/layout.tsx"), "utf8");
    expect(source).toContain("await requireAdmin()");
    expect(source).toContain("BackofficeProvider");
  });

  it("does not use localStorage in the remote back-office store", () => {
    const source = readFileSync(resolve(process.cwd(), "lib/backoffice-store.tsx"), "utf8");
    expect(source).not.toContain("localStorage");
    expect(source).toContain("/api/admin/bootstrap");
  });

  it("keeps server secrets out of the public environment namespace", () => {
    const source = readFileSync(resolve(process.cwd(), "lib/supabase/config.ts"), "utf8");
    expect(source).toContain("SUPABASE_SECRET_KEY");
    expect(source).not.toContain("NEXT_PUBLIC_SUPABASE_SECRET_KEY");
  });

  it("protects activity writes and client requests on the server", () => {
    const adminRoute = readFileSync(resolve(process.cwd(), "app/api/admin/client-updates/route.ts"), "utf8");
    const clientRoute = readFileSync(resolve(process.cwd(), "app/api/client/requests/route.ts"), "utf8");
    expect(adminRoute).toContain("requireApiAdmin");
    expect(clientRoute).toContain("requireClient");
    expect(clientRoute).not.toContain("internal_notes");
  });

  it("keeps internal activity and notes out of the client RLS path", () => {
    const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260923180000_client_service_activity.sql"), "utf8");
    expect(migration).toContain("visible_to_client = true");
    expect(migration).toContain("client_updates_self_select");
    expect(migration).not.toContain("client_updates_self_insert");
    expect(migration).not.toContain("internal_notes");
  });
});
