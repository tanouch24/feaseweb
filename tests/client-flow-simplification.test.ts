import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("simplified client flow", () => {
  it("keeps payment authorization on the existing approval gate", () => {
    const adminReview = source("app/api/admin/prospects/[id]/review/route.ts");
    const checkout = source("app/api/billing/checkout/route.ts");
    const detail = source("components/admin/ProspectReviewDetail.tsx");
    expect(detail).toContain("Demander le paiement");
    expect(adminReview).toContain('validationStatus = parsed.data.action === "approve" ? "approved"');
    expect(checkout).toContain('validation_status !== "approved"');
    expect(checkout).not.toContain('status: "paye"');
  });

  it("enforces the monthly request check on the server and keeps human client labels", () => {
    const route = source("app/api/client/requests/route.ts");
    const clientView = source("components/client/ClientSpaceSections.tsx");
    expect(route).toContain('count: "exact"');
    expect(route).toContain('code: "monthly_limit_reached"');
    expect(clientView).toContain('"Demande reçue"');
    expect(clientView).toContain('"En cours"');
    expect(clientView).toContain('"Terminée"');
  });

  it("keeps the logout chain server-backed", () => {
    const logout = source("components/layout/LogoutButton.tsx");
    const route = source("app/api/auth/logout/route.ts");
    const auth = source("lib/authz.ts");
    expect(logout).toContain('fetch("/api/auth/logout"');
    expect(logout).toContain('router.replace("/connexion")');
    expect(route).toContain("supabase.auth.signOut()");
    expect(auth).toContain('redirect("/connexion")');
  });
});
