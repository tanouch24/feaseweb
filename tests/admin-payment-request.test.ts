import { describe, expect, it } from "vitest";
import { canRequestPayment } from "@/lib/admin-payment-request";

describe("admin payment request presentation", () => {
  it("shows the action only after a completed appointment and before payment", () => {
    expect(canRequestPayment({ validationStatus: "pending", prospectStatus: "qualifie", paymentConfirmed: false })).toBe(true);
    expect(canRequestPayment({ validationStatus: undefined, prospectStatus: "gagne", paymentConfirmed: false })).toBe(true);
    expect(canRequestPayment({ validationStatus: "pending", prospectStatus: "qualifie", paymentConfirmed: false })).toBe(true);
    expect(canRequestPayment({ validationStatus: "approved", prospectStatus: "qualifie", paymentConfirmed: false })).toBe(false);
    expect(canRequestPayment({ validationStatus: "pending", prospectStatus: "qualifie", paymentConfirmed: true })).toBe(false);
    expect(canRequestPayment({ validationStatus: "pending", prospectStatus: "perdu", paymentConfirmed: false })).toBe(false);
  });
});
