import "server-only";
import { buildEmail, type EmailContent } from "@/lib/email-template";
import { siteUrl } from "@/lib/site-config";

type EmailResult = { ok: true } | { ok: false; reason: "not_configured" | "request_failed" };

export const appUrl = (path: string) => `${siteUrl.replace(/\/$/, "")}${path}`;

/** Envoi transactionnel via Brevo. Ne lève jamais : un e-mail raté ne doit pas casser l'action. */
export async function sendEmail(to: { email: string; name?: string | null }, subject: string, content: EmailContent): Promise<EmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;
  if (!apiKey || !senderEmail || !senderName) return { ok: false, reason: "not_configured" };
  const { html, text } = buildEmail(content);
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "api-key": apiKey },
      body: JSON.stringify({ sender: { email: senderEmail, name: senderName }, to: [{ email: to.email, name: to.name?.trim() || undefined }], subject, htmlContent: html, textContent: text }),
    });
    if (!response.ok) {
      console.error("email_failed", subject, response.status);
      return { ok: false, reason: "request_failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("email_request_failed", subject, error instanceof Error ? error.name : "unknown");
    return { ok: false, reason: "request_failed" };
  }
}

/**
 * Alerte interne pour l'équipe FeaseWeb. Destinataire : FEASEWEB_ADMIN_EMAIL,
 * à défaut l'expéditeur Brevo.
 */
export async function notifyFeaseWeb(subject: string, lines: string[], adminPath = "/admin"): Promise<EmailResult> {
  const to = process.env.FEASEWEB_ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL;
  if (!to) return { ok: false, reason: "not_configured" };
  return sendEmail({ email: to }, `[FeaseWeb] ${subject}`, {
    title: subject,
    paragraphs: lines.filter(Boolean),
    cta: { label: "Ouvrir le back-office", url: appUrl(adminPath) },
  });
}
