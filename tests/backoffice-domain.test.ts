import { describe, expect, it } from "vitest";
import { calculateMrr, demoData, emptyData, formatMoney } from "@/lib/backoffice";

describe("back-office domain", () => {
  it("calculates MRR only from active subscriptions", () => {
    const data = demoData();
    data.subscriptions.push({ id: "inactive", clientId: "client-demo-1", status: "retard", amountCents: 4900, provider: "none", lastPaymentStatus: "echoue" });
    expect(calculateMrr(data)).toBe(4900);
    expect(formatMoney(calculateMrr(data))).toContain("49");
  });

  it("starts with a genuinely empty local dataset", () => {
    expect(emptyData.prospects).toHaveLength(0);
    expect(emptyData.clients).toHaveLength(0);
    expect(emptyData.subscriptions).toHaveLength(0);
  });

  it("marks every seeded record as demonstration data", () => {
    const data = demoData();
    expect(data.prospects.every((prospect) => prospect.notes.some((note) => note.includes("DÉMONSTRATION")))).toBe(true);
    expect(data.domains[0].name).toContain("example.test");
  });
});
