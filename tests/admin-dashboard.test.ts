import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { emptyData, type Client, type Payment, type ProjectIntake, type Prospect, type Site } from "@/lib/backoffice";
import { adminDashboardStages, getAdminDashboardSections } from "@/lib/admin-dashboard";

const prospect = (id: string, company: string, appointmentStatus: "scheduled" | "completed", date: string, time: string, validationStatus: "pending" | "approved" = "pending"): Prospect => ({
  id, createdAt: date, firstName: "Jean", lastName: "Dupont", company, email: `${id}@example.test`, phone: "0600000000", activity: "Artisan", city: "Lyon", currentSite: "", hasSite: false, objective: "", message: "", source: "formulaire", status: "nouveau", notes: [],
  review: { appointmentStatus, appointmentDate: date, appointmentTime: time, validationStatus },
});

const client = (id: string, company: string): Client => ({ id, firstName: "Claire", lastName: "Martin", company, email: `${id}@example.test`, phone: "0611111111", startedAt: "2026-09-01", status: "actif", offer: "FeaseWeb — 49 €/mois", accessStatus: "actif", notes: [] });
const payment = (id: string, clientId: string, status: Payment["status"], date: string, provider: Payment["provider"] = "stripe"): Payment => ({ id, clientId, amountCents: 4900, paidAt: date, status, invoice: id, period: "2026-09-01 → 2026-10-01", provider });
const project = (id: string, clientId: string, status: string, currentStep = 8): ProjectIntake => ({ id, userId: `user-${id}`, clientId, firstName: "Claire", lastName: "Martin", company: "Entreprise", email: "client@example.test", phone: "0611111111", activity: "Artisan", hasExistingSite: false, existingSiteUrl: "", existingSiteProject: "", objective: "", pages: [], style: "", palette: "", assets: [], contactChannel: "", contactSlot: "", status, currentStep });
const site = (id: string, clientId: string, status: Site["status"]): Site => ({ id, clientId, name: "Site", slug: id, previewUrl: "", finalDomain: status === "actif" ? "https://example.test" : "", repository: "", host: "", createdAt: "2026-09-01", status, technicalNotes: "" });

describe("simple admin dashboard", () => {
  it("shows scheduled appointments sorted and flags overdue appointments", () => {
    const data = { ...emptyData, prospects: [prospect("next", "Prochain", "scheduled", "2026-10-01", "14:30"), prospect("late", "En retard", "scheduled", "2026-09-29", "09:00")] };
    const sections = getAdminDashboardSections(data, new Date("2026-09-30T12:00:00"));
    expect(sections["Rendez-vous à faire"].map((item) => item.company)).toEqual(["En retard", "Prochain"]);
    expect(sections["Rendez-vous à faire"][0].overdue).toBe(true);
    expect(sections["Rendez-vous à faire"][1].appointmentTime).toBe("14:30");
  });

  it("separates completed appointments and approved dossiers awaiting payment", () => {
    const data = { ...emptyData, prospects: [prospect("done", "Rendez-vous fait", "completed", "2026-09-28", "10:00"), prospect("approved", "Paiement attendu", "completed", "2026-09-27", "11:00", "approved")] };
    const sections = getAdminDashboardSections(data);
    expect(sections["Paiements à demander"].map((item) => item.company)).toEqual(["Rendez-vous fait"]);
    expect(sections["Paiements en attente"].map((item) => item.company)).toEqual(["Paiement attendu"]);
  });

  it("uses Stripe-persisted payments and gives failed payments priority", () => {
    const paid = client("paid", "Premier paiement");
    const building = client("building", "Site à faire");
    const live = client("live", "Site fait");
    const failed = client("failed", "Prélèvement rejeté");
    const data = { ...emptyData, clients: [paid, building, live, failed], payments: [payment("p1", "paid", "paye", "2026-09-20"), payment("p2", "building", "paye", "2026-09-20"), payment("p3", "live", "paye", "2026-09-20"), payment("p4", "failed", "echoue", "2026-09-27")], projectIntakes: [project("project-building", "building", "building"), project("project-live", "live", "live")], sites: [site("site-live", "live", "actif")] };
    const sections = getAdminDashboardSections(data);
    expect(sections["Paiements reçus"].map((item) => item.company)).toEqual(["Premier paiement"]);
    expect(sections["Sites à faire"].map((item) => item.company)).toEqual(["Site à faire"]);
    expect(sections["Sites en ligne"].map((item) => item.company)).toEqual(["Site fait"]);
    expect(sections["Paiements rejetés"].map((item) => item.company)).toEqual(["Prélèvement rejeté"]);
    expect(sections["Paiements rejetés"][0].paymentDate).toBe("2026-09-27");
  });

  it("keeps one normal primary stage per client", () => {
    const one = client("one", "Un seul dossier");
    const data = { ...emptyData, clients: [one], payments: [payment("p1", "one", "paye", "2026-09-20")], projectIntakes: [project("project-one", "one", "subscription_active")] };
    const sections = getAdminDashboardSections(data);
    expect(adminDashboardStages.filter((stage) => sections[stage].some((item) => item.company === "Un seul dossier"))).toEqual(["Paiements reçus"]);
  });

  it("does not introduce a manual payment override in the dashboard", () => {
    const source = readFileSync(resolve(process.cwd(), "components/admin/AdminApp.tsx"), "utf8");
    expect(source).not.toContain("Marquer payé");
    expect(source).not.toContain("Paiement OK");
  });
});
