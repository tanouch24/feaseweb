import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("admin sidebar accessibility", () => {
  it("keeps the account actions visible outside the scrollable navigation", () => {
    const admin = source("components/admin/AdminApp.tsx");
    const styles = source("app/globals.css");

    expect(admin).toContain('className="admin-sidebar-navigation"');
    expect(admin).toContain('className="admin-sidebar-actions space-y-3"');
    expect(admin).toContain('className="admin-sidebar-nav mt-5 space-y-1"');
    expect(admin).toContain('import { LogoutButton } from "@/components/layout/LogoutButton"');
    expect(admin).toContain('className="admin-mobile-logout"');
    expect(styles).toContain("height: 100dvh");
    expect(styles).toContain("overflow: hidden");
    expect(styles).toContain(".admin-sidebar-nav { min-height: 0; overflow-y: auto");
    expect(styles).toContain(".admin-sidebar-actions { flex: 0 0 auto");
  });

  it("keeps logout as a real sign-out action with a protected redirect", () => {
    const admin = source("components/admin/AdminApp.tsx");
    const logout = source("components/layout/LogoutButton.tsx");

    expect(admin).toContain('import { LogoutButton } from "@/components/layout/LogoutButton"');
    expect(logout).toContain("supabase?.auth.signOut()");
    expect(logout).toContain('fetch("/api/auth/logout"');
    expect(logout).toContain('window.location.replace("/connexion")');
    expect(logout).toContain("Se déconnecter");
  });
});
