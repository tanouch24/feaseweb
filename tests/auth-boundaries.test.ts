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

  it("uses one role-aware server-rendered connection entry point", () => {
    const page = readFileSync(resolve(process.cwd(), "app/connexion/page.tsx"), "utf8");
    const loginRoute = readFileSync(resolve(process.cwd(), "app/api/auth/login/route.ts"), "utf8");
    const redirectRoute = readFileSync(resolve(process.cwd(), "app/api/auth/redirect/route.ts"), "utf8");

    expect(page).toContain("await getAuthenticatedProfile()");
    expect(page).toContain('redirect("/admin")');
    expect(page).toContain('redirect("/espace-client")');
    expect(loginRoute).toContain('profile?.role !== "admin" && profile?.role !== "client"');
    expect(loginRoute).toContain("await supabase.auth.signOut()");
    expect(redirectRoute).toContain('reason=role');
  });

  it("keeps the canonical URL environment-driven and adds baseline web headers", () => {
    const siteConfig = readFileSync(resolve(process.cwd(), "lib/site-config.ts"), "utf8");
    const layout = readFileSync(resolve(process.cwd(), "app/layout.tsx"), "utf8");
    const robots = readFileSync(resolve(process.cwd(), "app/robots.ts"), "utf8");
    const sitemap = readFileSync(resolve(process.cwd(), "app/sitemap.ts"), "utf8");
    const nextConfig = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");

    expect(siteConfig).toContain("NEXT_PUBLIC_APP_URL");
    expect(siteConfig).toContain("https://fease.fr");
    expect(layout).toContain('import { siteUrl } from "@/lib/site-config"');
    expect(robots).toContain("siteUrl");
    expect(sitemap).toContain("siteUrl");
    expect(nextConfig).toContain("X-Content-Type-Options");
    expect(nextConfig).toContain("Referrer-Policy");
  });
});
