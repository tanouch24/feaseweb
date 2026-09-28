import "server-only";
import { buildClientUpdateEmail } from "@/lib/client-update-email";

type ClientUpdateEmailInput = { firstName?: string | null; email: string; updateType: string; title: string; message: string };
type BrevoResult = { ok: true } | { ok: false; reason: "not_configured" | "request_failed" };

export { buildClientUpdateEmail } from "@/lib/client-update-email";

export async function sendClientUpdateEmail(input: ClientUpdateEmailInput): Promise<BrevoResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;
  if (!apiKey || !senderEmail || !senderName) return { ok: false, reason: "not_configured" };
  const content = buildClientUpdateEmail(input);
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "api-key": apiKey },
      body: JSON.stringify({ sender: { email: senderEmail, name: senderName }, to: [{ email: input.email, name: input.firstName?.trim() || undefined }], subject: "Votre dossier FeaseWeb a été mis à jour", htmlContent: content.html, textContent: content.text }),
    });
    if (!response.ok) {
      console.error("client_update_email_failed", response.status);
      return { ok: false, reason: "request_failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("client_update_email_request_failed", error instanceof Error ? error.name : "unknown");
    return { ok: false, reason: "request_failed" };
  }
}
