import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { availableAppointmentSlots, isBookableAppointment } from "@/lib/appointment-availability";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("final client UX safeguards", () => {
  it("supports multiple objectives without removing legacy storage", () => {
    const onboarding = source("components/onboarding/OnboardingConfigurator.tsx");
    const model = source("lib/onboarding.ts");
    const validation = source("lib/validation.ts");
    expect(onboarding).toContain("Quels sont vos objectifs ?");
    expect(onboarding).toContain("Vous pouvez sélectionner plusieurs réponses.");
    expect(onboarding).toContain('multi("primaryObjectives", value)');
    expect(onboarding).not.toContain("Quel est votre objectif principal ?");
    expect(model).toContain("primary_objectives");
    expect(validation).toContain("primaryObjectives");
    const migration = source("supabase/migrations/20260929160000_onboarding_multiple_objectives.sql");
    expect(migration).toContain("add column if not exists primary_objectives");
    expect(migration).not.toContain("drop column");
  });

  it("keeps six distinct visual models and no color step or daypart step", () => {
    const onboarding = source("components/onboarding/OnboardingConfigurator.tsx");
    const styles = source("app/globals.css");
    const modelVariants = new Set(onboarding.match(/model-(classic|modern|premium|local|minimal|impact)/g) ?? []);
    expect(modelVariants.size).toBe(6);
    expect(onboarding).toContain("styleDirections");
    expect(onboarding).toContain("Quels styles vous plaisent ?");
    expect(onboarding).not.toContain(">Photo<");
    expect(onboarding).not.toContain("colorMood");
    expect(onboarding).not.toContain("matin");
    expect(onboarding).not.toContain("Après-midi");
    expect(styles).toContain(".model-modern");
    expect(styles).toContain(".model-premium");
    expect(styles).toContain(".model-local");
    expect(styles).toContain(".model-minimal");
    expect(styles).toContain(".model-impact");
  });

  it("uses server-verifiable appointment rules and rejects past slots", () => {
    const route = source("app/api/prospect/appointment/route.ts");
    const slots = availableAppointmentSlots("2026-09-28", new Date("2026-09-28T18:00:00"));
    expect(slots).toEqual([]);
    expect(isBookableAppointment("2026-09-28", "09:00", new Date("2026-09-28T18:00:00"))).toBe(false);
    expect(route).toContain("isBookableAppointment");
    expect(route).toContain("Ce créneau n'est plus disponible");
  });

  it("preserves the validated client timeline and adds client messaging surfaces", () => {
    const sections = source("components/client/ClientSpaceSections.tsx");
    const notifications = source("components/client/ClientNotifications.tsx");
    const form = source("components/client/ClientRequestForm.tsx");
    expect(sections).toContain("ProjectTimeline");
    expect(sections).toContain("ClientNotifications");
    expect(sections).toContain("ClientRequestForm compact");
    expect(notifications).toContain("client-unread-badge");
    expect(notifications).toContain("updateId: id");
    expect(form).toContain("Envoyer un message à FeaseWeb");
    expect(form).toContain("/api/client/requests");
  });

  it("keeps the dashboard composition compact and moves profile out of the main flow", () => {
    const sections = source("components/client/ClientSpaceSections.tsx");
    const page = source("app/espace-client/page.tsx");
    const profile = source("components/client/ClientProfileCard.tsx");
    const styles = source("app/globals.css");
    expect(sections).toContain("client-contact-panel");
    expect(sections).not.toContain("client-whatsapp-card");
    expect(page).not.toContain("<ClientProfileCard />");
    expect(profile).toContain("client-profile-drawer");
    expect(profile).toContain("client-profile-form");
    expect(styles).toContain(".client-contact-panel");
    expect(styles).toContain(".client-profile-drawer");
  });
});

describe("appointment slots use Paris time", () => {
  it("refuses a slot already past in Paris even when the server clock is UTC", () => {
    // 08:30 UTC = 10:30 à Paris (heure d'été) : 10:00 est passé, 11:00 non.
    const now = new Date("2026-09-28T08:30:00Z");
    expect(isBookableAppointment("2026-09-28", "10:00", now)).toBe(false);
    expect(isBookableAppointment("2026-09-28", "11:00", now)).toBe(true);
  });
  it("uses the Paris calendar day around midnight UTC", () => {
    // 22:30 UTC le dimanche = 00:30 lundi à Paris : lundi est déjà « aujourd'hui ».
    expect(availableAppointmentSlots("2026-09-28", new Date("2026-09-27T22:30:00Z"))[0]).toBe("09:00");
  });
});
