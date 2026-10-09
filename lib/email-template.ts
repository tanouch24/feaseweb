/** Gabarit d'e-mail FeaseWeb (HTML + texte), sans dépendance serveur : testable. */
export type EmailContent = {
  greetingName?: string | null;
  title: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

export function buildEmail({ greetingName, title, paragraphs, cta }: EmailContent) {
  const name = greetingName?.trim();
  const greeting = name ? `Bonjour ${name},` : "Bonjour,";
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f5f2;font-family:Arial,Helvetica,sans-serif;color:#172521;line-height:1.6"><div style="max-width:560px;margin:0 auto;padding:32px 24px"><p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0f2a26">FeaseWeb</p><div style="background:#ffffff;border-radius:14px;padding:28px"><h1 style="margin:0 0 16px;font-size:20px;color:#0f2a26">${escapeHtml(title)}</h1><p style="margin:0 0 12px">${escapeHtml(greeting)}</p>${paragraphs.map((p) => `<p style="margin:0 0 12px">${escapeHtml(p)}</p>`).join("")}${cta ? `<p style="margin:24px 0 0"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#1e4a43;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px">${escapeHtml(cta.label)}</a></p>` : ""}</div><p style="margin:20px 0 0;font-size:13px;color:#4d5a55">Votre site internet, sans avoir à vous en occuper.</p></div></body></html>`;
  const text = ["FeaseWeb", "", title, "", greeting, "", ...paragraphs.flatMap((p) => [p, ""]), ...(cta ? [`${cta.label} : ${cta.url}`] : [])].join("\n");
  return { html, text };
}
