import { describe, expect, it } from "vitest";
import { addCalendarDays, clientOrderTimeline } from "@/lib/client-order-timeline";

describe("client order timeline", () => {
  it("uses real appointment and payment state without exposing database statuses", () => {
    const stages = clientOrderTimeline({ hasProject: true, appointmentStatus: "scheduled", appointmentDate: "2026-09-30", appointmentTime: "14:30", paymentConfirmed: false, live: false });
    expect(stages.map((stage) => stage.label)).toEqual(["Site demandé", "Rendez-vous", "Paiement", "Site en création", "Site livré"]);
    expect(stages[1].detail).toContain("30 septembre 2026");
    expect(stages[2].state).toBe("current");
    expect(stages[3].state).toBe("upcoming");
  });

  it("calculates an explicitly estimated delivery date only from a real payment date", () => {
    const stages = clientOrderTimeline({ hasProject: true, appointmentStatus: "completed", paymentConfirmed: true, paymentDate: "2026-09-28T12:00:00.000Z", live: false });
    expect(stages[2].state).toBe("complete");
    expect(stages[3].state).toBe("current");
    expect(stages[4].detail).toContain("3 octobre 2026");
    expect(addCalendarDays("not-a-date")).toBeNull();
  });

  it("marks a real live site as delivered", () => {
    const stages = clientOrderTimeline({ hasProject: true, paymentConfirmed: true, paymentDate: "2026-09-28", live: true });
    expect(stages.every((stage) => stage.state === "complete")).toBe(true);
    expect(stages[4].detail).toBe("Votre site est en ligne");
  });
});
