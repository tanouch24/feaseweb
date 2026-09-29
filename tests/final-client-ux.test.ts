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
    expect((onboarding.match(/model-(classic|modern|premium|local|minimal|impact)/g) ?? []).length).toBe(6);
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
});
