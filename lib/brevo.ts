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

type ClientRequestEmailInput = { firstName?: string | null; email: string; title: string; status: "received" | "completed" };

export async function sendClientRequestEmail(input: ClientRequestEmailInput): Promise<BrevoResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;
  if (!apiKey || !senderEmail || !senderName) return { ok: false, reason: "not_configured" };
  const escape = (value: string) => value.replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
  const safeName = escape(input.firstName?.trim() || "");
  const safeTitle = escape(input.title.trim());
  const intro = input.status === "completed" ? "Votre demande FeaseWeb a été traitée." : "Votre demande a bien été reçue par FeaseWeb.";
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { accept: "application/json", "content-type": "application/json", "api-key": apiKey }, body: JSON.stringify({ sender: { email: senderEmail, name: senderName }, to: [{ email: input.email, name: safeName || undefined }], subject: input.status === "completed" ? "Votre demande FeaseWeb a été traitée" : "Votre demande FeaseWeb a bien été reçue", htmlContent: `<!doctype html><html lang="fr"><body style="font-family:Arial,Helvetica,sans-serif;color:#17201d;line-height:1.6"><h1 style="color:#173b35">FeaseWeb</h1><p>${safeName ? `Bonjour ${safeName},` : "Bonjour,"}</p><p>${intro}</p><p><strong>${safeTitle}</strong></p><p><a href="https://feaseweb.fr/espace-client">Voir mon dossier</a></p><p>Votre site internet, sans avoir à vous en occuper.</p></body></html>`, textContent: `FeaseWeb\n\n${safeName ? `Bonjour ${safeName},` : "Bonjour,"}\n\n${intro}\n\n${safeTitle}\n\nVoir mon dossier : https://feaseweb.fr/espace-client` }) });
    if (!response.ok) { console.error("client_request_email_failed", response.status); return { ok: false, reason: "request_failed" }; }
    return { ok: true };
  } catch (error) { console.error("client_request_email_request_failed", error instanceof Error ? error.name : "unknown"); return { ok: false, reason: "request_failed" }; }
}
