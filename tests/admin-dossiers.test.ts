import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("admin dossier workspace", () => {
  it("uses the dossier list as the admin home without prospect/client navigation language", () => {
    const page = read("app/admin/page.tsx");
    const list = read("components/admin/AdminOperationalViews.tsx");
    expect(page).toContain("DossiersPage");
    expect(list).toContain("admin-dossiers-table");
    expect(list).toContain("Paiement");
    expect(list).toContain("Rendez-vous");
  });

  it("keeps payment, tasks, notes and client requests inside one dossier", () => {
    const detail = read("components/admin/DossierDetail.tsx");
    expect(detail).toContain("PAIEMENT");
    expect(detail).toContain("À FAIRE");
    expect(detail).toContain("NOTE INTERNE");
    expect(detail).toContain("DEMANDER AU CLIENT");
    expect(detail).toContain("createClientUpdate");
    expect(detail).toContain("setRequestStatus");
  });

  it("lets the admin complete a site only from the dossier", () => {
    const detail = read("components/admin/DossierDetail.tsx");
    expect(detail).toContain("Marquer le site comme terminé");
    expect(detail).toContain('markSiteDone(site.id)');
    expect(detail).toContain('setSiteStatus(siteId, "actif")');
    expect(detail).toContain("site.finalDomain.trim()");
  });
});
