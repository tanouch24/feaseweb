import { describe, expect, it } from "vitest";
import { normalizePublicSiteUrl } from "@/lib/public-site-url";
import { sitePatchSchema } from "@/lib/validation";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("admin/user workflow finalization", () => {
  it("normalizes safe site domains and rejects unsafe protocols", () => {
    expect(normalizePublicSiteUrl("monsite.fr")).toBe("https://monsite.fr");
    expect(normalizePublicSiteUrl("https://monsite.fr")).toBe("https://monsite.fr");
    expect(normalizePublicSiteUrl("javascript:alert(1)")).toBeNull();
    expect(normalizePublicSiteUrl("data:text/html,test")).toBeNull();
    expect(normalizePublicSiteUrl("//malicious.example")).toBeNull();
    expect(sitePatchSchema.safeParse({ domain: "javascript:alert(1)" }).success).toBe(false);
    expect(sitePatchSchema.safeParse({ domain: "//malicious.example" }).success).toBe(false);
  });

  it("keeps pre-conversion messages visible in the dossier and uses one post-conversion request path", () => {
    const support = source("app/api/onboarding/support/route.ts");
    const requests = source("app/api/client/requests/route.ts");
    const dossier = source("components/admin/DossierDetail.tsx");
    const migration = source("supabase/migrations/20260930130000_project_messages.sql");
    expect(support).toContain("support_message");
    expect(support).toContain('from("project_messages").insert');
    expect(requests).toContain("modification_requests");
    expect(migration).toContain("support_message");
    expect(dossier).toContain("data.requests.filter");
    expect(dossier).toContain("MESSAGE DU CLIENT");
  });

  it("aggregates general updates and SEO actions without showing general updates twice", () => {
    const sections = source("components/client/ClientSpaceSections.tsx");
    expect(sections).toContain("ACTIVITÉ DE VOTRE SITE");
    expect(sections).toContain("seo:${action.id}");
    expect(sections).toContain("update:${update.id}");
    expect(sections).toContain('["information", "avancement"]');
  });
});
