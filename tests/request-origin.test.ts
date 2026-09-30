import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { isAllowedRequestOrigin, validateRequestOrigin } from "@/lib/request-origin";
import { proxy } from "@/proxy";

vi.mock("server-only", () => ({}));

describe("request origin protection", () => {
  it("SAME_ORIGIN_ALLOWED", () => {
    expect(isAllowedRequestOrigin("https://feaseweb.fr")).toBe(true);
  });

  it("EVIL_ORIGIN_BLOCKED", () => {
    expect(isAllowedRequestOrigin("https://evil.example")).toBe(false);
  });

  it("PREFIX_SPOOF_BLOCKED", () => {
    expect(isAllowedRequestOrigin("https://feaseweb.fr.evil.example")).toBe(false);
  });

  it("SUFFIX_SPOOF_BLOCKED", () => {
    expect(isAllowedRequestOrigin("https://evilfeaseweb.fr")).toBe(false);
  });

  it("SUBDOMAIN_SPOOF_BLOCKED", () => {
    expect(isAllowedRequestOrigin("https://evil.feaseweb.fr")).toBe(false);
  });

  it("INVALID_ORIGIN_BLOCKED", () => {
    expect(isAllowedRequestOrigin("not-an-origin")).toBe(false);
  });

  it("MISSING_ORIGIN_POLICY_TESTED", async () => {
    const response = validateRequestOrigin(new Request("https://feaseweb.fr/api/test", { method: "POST" }));
    expect(response?.status).toBe(403);
    expect(await response?.json()).toEqual({ error: "Origine de requête interdite." });
  });

  it("LOCAL_DEV_ORIGIN_ALLOWED", () => {
    expect(isAllowedRequestOrigin("http://localhost:3000")).toBe(true);
    expect(isAllowedRequestOrigin("http://127.0.0.1:3000")).toBe(true);
  });

  it("ORIGIN_COMPARISON_IS_STRICT", () => {
    expect(isAllowedRequestOrigin("https://feaseweb.fr:443")).toBe(false);
    expect(isAllowedRequestOrigin("https://feaseweb.fr/")).toBe(false);
  });

  it("CLIENT_MUTATION_CROSS_SITE_BLOCKED", async () => {
    const response = await proxy(new NextRequest("https://feaseweb.fr/api/client/requests", { method: "POST", headers: { Origin: "https://evil.example" } }));
    expect(response.status).toBe(403);
  });

  it("ADMIN_MUTATION_CROSS_SITE_BLOCKED", async () => {
    const response = await proxy(new NextRequest("https://feaseweb.fr/api/admin/sites", { method: "POST", headers: { Origin: "https://evil.example" } }));
    expect(response.status).toBe(403);
  });

  it("BILLING_CHECKOUT_CROSS_SITE_BLOCKED", async () => {
    const response = await proxy(new NextRequest("https://feaseweb.fr/api/billing/checkout", { method: "POST", headers: { Origin: "https://evil.example" } }));
    expect(response.status).toBe(403);
  });

  it("BILLING_PORTAL_CROSS_SITE_BLOCKED", async () => {
    const response = await proxy(new NextRequest("https://feaseweb.fr/api/billing/portal", { method: "POST", headers: { Origin: "https://evil.example" } }));
    expect(response.status).toBe(403);
  });

  it("AUTH_FLOW_NOT_BROKEN", async () => {
    const response = await proxy(new NextRequest("https://feaseweb.fr/api/auth/login", { method: "POST", headers: { Origin: "https://feaseweb.fr" } }));
    expect(response.status).toBe(200);
  });

  it("STRIPE_WEBHOOK_ORIGIN_EXEMPT", async () => {
    const response = await proxy(new NextRequest("https://feaseweb.fr/api/stripe/webhook", { method: "POST", headers: { Origin: "https://evil.example" } }));
    expect(response.status).toBe(200);
  });
});
