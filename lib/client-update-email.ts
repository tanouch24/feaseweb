export type ClientUpdateEmailContentInput = { updateType: string; title: string; message: string; firstName?: string | null };

const typeMessages: Record<string, string> = {
  information: "Une nouvelle information concernant votre projet est disponible.",
  avancement: "Votre projet vient d'avancer. Une nouvelle mise à jour est disponible.",
  action_requise: "Une action de votre part est nécessaire pour poursuivre votre projet.",
  apercu_disponible: "Une nouvelle version de votre site est disponible dans votre espace.",
  mise_en_ligne: "Votre site vient d'être mis en ligne.",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function textContent(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

export function buildClientUpdateEmail(input: ClientUpdateEmailContentInput) {
  const firstName = escapeHtml(input.firstName?.trim() || "");
  const title = escapeHtml(textContent(input.title));
  const message = escapeHtml(textContent(input.message)).replace(/\n/g, "<br />");
  const intro = escapeHtml(typeMessages[input.updateType] ?? typeMessages.information);
  const dashboardUrl = "https://feaseweb.fr/espace-client";
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f6f7f5;color:#17201d;font-family:Arial,Helvetica,sans-serif;line-height:1.6"><div style="max-width:600px;margin:0 auto;padding:32px 20px"><div style="background:#173b35;color:#edf5ef;padding:24px 28px;font-size:22px;font-weight:700">FeaseWeb</div><div style="background:#fff;padding:32px 28px"><p>${greeting}</p><p>${intro}</p><h1 style="font-size:22px;line-height:1.3;font-weight:600">${title}</h1><p>${message}</p><p style="margin:28px 0"><a href="${dashboardUrl}" style="display:inline-block;background:#d8ae70;color:#173b35;padding:13px 20px;text-decoration:none;font-weight:700">Voir mon dossier</a></p><p style="color:#60706a;font-size:13px">Votre site internet, sans avoir à vous en occuper.</p></div></div></body></html>`;
  const text = [`FeaseWeb`, ``, greeting, ``, textContent(typeMessages[input.updateType] ?? typeMessages.information), ``, textContent(input.title), textContent(input.message), ``, `Voir mon dossier : ${dashboardUrl}`, ``, `FeaseWeb`, `Votre site internet, sans avoir à vous en occuper.`].join("\n");
  return { html, text, dashboardUrl };
}
