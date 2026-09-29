import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("production UX guardrails", () => {
  it("keeps cookie preferences out of a permanent floating control", () => {
    const consent = source("components/analytics/TrackingConsent.tsx");
    const footer = source("components/layout/Footer.tsx");
    expect(consent).not.toContain("Gérer mes cookies</button>");
    expect(footer).toContain("Préférences cookies");
    expect(consent).toContain("feaseweb-open-consent");
  });

  it("keeps the client surface simple and the payment action server-driven", () => {
    const client = source("components/client/ClientSpaceSections.tsx");
    const paymentDetail = source("components/admin/ProspectReviewDetail.tsx");
    expect(client).toContain("client-project-timeline");
    expect(client).toContain("ClientRequestForm");
    expect(paymentDetail).toContain("Demander le paiement");
    expect(paymentDetail).toContain("canRequestPayment");
  });
});
