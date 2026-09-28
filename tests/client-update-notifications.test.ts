import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildClientUpdateEmail } from "@/lib/client-update-email";
import { whatsappContactUrl, whatsappNumber, whatsappPrefilledMessage } from "@/lib/whatsapp";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("client update notifications", () => {
  it("builds escaped HTML and a plain text email with a fixed dashboard link", () => {
    const email = buildClientUpdateEmail({ firstName: "Ada", updateType: "information", title: "<script>alert(1)</script>", message: "Texte <b>admin</b>\nDeuxième ligne" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.text).toContain("Texte <b>admin</b>");
    expect(email.dashboardUrl).toBe("https://feaseweb.fr/espace-client");
  });

  it("keeps Brevo server-only and the recipient server-derived", () => {
    const route = source("app/api/admin/client-updates/route.ts");
    const brevo = source("lib/brevo.ts");
    expect(route).toContain("requireApiAdmin");
    expect(route).toContain('select("id, email, first_name, last_name")');
    expect(route).not.toContain("recipient_email");
    expect(route).not.toContain("to:");
    expect(brevo).toContain("process.env.BREVO_API_KEY");
    expect(brevo).not.toContain("NEXT_PUBLIC_BREVO_API_KEY");
    expect(brevo).toContain("api.brevo.com/v3/smtp/email");
    expect(route.indexOf("insert(")).toBeLessThan(route.indexOf("const notification = await notifyUpdate"));
    expect(route).toContain("notification_status");
  });

  it("uses a persistent idempotency key and preserves the update on email failure", () => {
    const route = source("app/api/admin/client-updates/route.ts");
    const migration = source("supabase/migrations/20260928143000_client_update_email_notifications.sql");
    expect(route).toContain("Idempotency-Key");
    expect(route).toContain("emailFailureMessage");
    expect(route).toContain('notification_status: "failed"');
    expect(migration).toContain("idempotency_key uuid");
    expect(migration).toContain("client_updates_admin_idempotency_idx");
  });

  it("provides only a voluntary WhatsApp contact link without client data", () => {
    const page = source("components/client/ClientSpaceSections.tsx");
    expect(whatsappNumber).toBe("33751526253");
    expect(whatsappContactUrl).toContain("wa.me/33751526253");
    expect(whatsappContactUrl).toContain(encodeURIComponent(whatsappPrefilledMessage));
    expect(page).toContain("whatsappContactUrl");
    expect(page).toContain('target="_blank" rel="noopener noreferrer"');
    expect(page).not.toContain("client_id");
  });
});
