import { describe, expect, it } from "vitest";
import { emailSchema, passwordSchema, prospectInputSchema } from "@/lib/validation";

const valid = { firstName: "Léa", lastName: "Dupont", company: "Dupont Plomberie", email: "lea@example.test", phone: "06 12 34 56 78", privacyConsent: true };

describe("server prospect validation", () => {
  it("normalizes valid form values and requires privacy consent", () => {
    const result = prospectInputSchema.safeParse({ ...valid, email: " LEA@EXAMPLE.TEST " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("lea@example.test");
    expect(prospectInputSchema.safeParse({ ...valid, privacyConsent: false }).success).toBe(false);
  });

  it("rejects malformed URLs, phones and oversized fields", () => {
    expect(prospectInputSchema.safeParse({ ...valid, existingSiteUrl: "not-a-url" }).success).toBe(false);
    expect(prospectInputSchema.safeParse({ ...valid, phone: "abc" }).success).toBe(false);
    expect(prospectInputSchema.safeParse({ ...valid, company: "x".repeat(181) }).success).toBe(false);
  });

  it("validates password confirmation without exposing account existence", () => {
    expect(passwordSchema.safeParse({ password: "correct-horse", confirmation: "correct-horse" }).success).toBe(true);
    expect(passwordSchema.safeParse({ password: "short", confirmation: "short" }).success).toBe(false);
    expect(passwordSchema.safeParse({ password: "correct-horse", confirmation: "different" }).success).toBe(false);
    expect(emailSchema.safeParse({ email: " CLIENT@EXAMPLE.TEST " }).success).toBe(true);
  });
});
