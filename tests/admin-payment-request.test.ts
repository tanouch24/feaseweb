import { describe, expect, it } from "vitest";
import { canRequestPayment } from "@/lib/admin-payment-request";

describe("admin payment request presentation", () => {
  it("shows the action only after a completed appointment and before payment", () => {
    expect(canRequestPayment({ appointmentStatus: "completed", validationStatus: "pending", prospectStatus: "qualifie", paymentConfirmed: false })).toBe(true);
    expect(canRequestPayment({ appointmentStatus: "scheduled", validationStatus: "pending", prospectStatus: "qualifie", paymentConfirmed: false })).toBe(false);
    expect(canRequestPayment({ appointmentStatus: "completed", validationStatus: "approved", prospectStatus: "qualifie", paymentConfirmed: false })).toBe(false);
    expect(canRequestPayment({ appointmentStatus: "completed", validationStatus: "pending", prospectStatus: "qualifie", paymentConfirmed: true })).toBe(false);
    expect(canRequestPayment({ appointmentStatus: "completed", validationStatus: "pending", prospectStatus: "perdu", paymentConfirmed: false })).toBe(false);
  });
});
