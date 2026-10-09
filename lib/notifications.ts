import "server-only";
import { appUrl, notifyFeaseWeb, sendEmail } from "@/lib/emails";

/**
 * Tous les e-mails du parcours client, au même endroit.
 * Chaque fonction est sans échec : un e-mail raté est journalisé, l'action
 * de l'utilisateur continue (voir sendEmail).
 */

type Person = { email?: string | null; firstName?: string | null; company?: string | null };

const who = (p: Person) => [p.firstName, p.company ? `(${p.company})` : ""].filter(Boolean).join(" ") || p.email || "Un contact";
const frDate = (date: string, time?: string | null) => {
  const d = new Date(`${date}T12:00:00`);
  const day = Number.isNaN(d.getTime()) ? date : new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(d);
  return time ? `${day} à ${time.slice(0, 5).replace(":", "h")}` : day;
};

// --- Nouveaux contacts ---------------------------------------------------

export async function onLeadReceived(lead: Person & { existingSiteUrl?: string | null; message?: string | null; source?: string | null; phone?: string | null }) {
  await notifyFeaseWeb(`Nouvelle demande : ${who(lead)}`, [
    lead.existingSiteUrl ? `Refonte du site ${lead.existingSiteUrl}` : "Nouvelle demande de contact",
    `E-mail : ${lead.email ?? "—"} · Téléphone : ${lead.phone ?? "—"}`,
    lead.message ? `Message : ${lead.message}` : "",
    "Pensez à l'inviter à créer son espace depuis sa fiche dossier.",
  ], "/admin/dossiers");
  if (lead.email) {
    await sendEmail({ email: lead.email, name: lead.firstName }, "Nous avons bien reçu votre demande", {
      greetingName: lead.firstName,
      title: "Votre demande est bien arrivée",
      paragraphs: ["Merci pour votre message. FeaseWeb revient vers vous rapidement, en général sous un jour ouvré."],
    });
  }
}

export async function onAccountCreated(person: Person & { phone?: string | null }) {
  await notifyFeaseWeb(`Nouvel espace créé : ${who(person)}`, [`E-mail : ${person.email ?? "—"} · Téléphone : ${person.phone ?? "—"}`, "Le prospect doit encore configurer son projet."], "/admin/dossiers");
}

export async function onProjectConfigured(person: Person) {
  await notifyFeaseWeb(`Projet configuré : ${who(person)}`, ["Le prospect a terminé la configuration de son site. Il peut maintenant réserver un rendez-vous."], "/admin/dossiers");
}

// --- Rendez-vous ---------------------------------------------------------

export async function onAppointmentBooked(person: Person, date: string, time: string, phone?: string | null) {
  await notifyFeaseWeb(`Rendez-vous réservé : ${who(person)}`, [`Le ${frDate(date, time)}`, `Téléphone : ${phone ?? "—"}`], "/admin");
  if (person.email) {
    await sendEmail({ email: person.email, name: person.firstName }, "Votre rendez-vous FeaseWeb est confirmé", {
      greetingName: person.firstName,
      title: "Rendez-vous confirmé",
      paragraphs: [`Nous vous appellerons le ${frDate(date, time)}.`, "Vous pouvez le déplacer ou l'annuler depuis votre espace."],
      cta: { label: "Voir mon espace", url: appUrl("/espace-client") },
    });
  }
}

export async function onAppointmentScheduledByAdmin(person: Person, date: string, time: string) {
  if (!person.email) return;
  await sendEmail({ email: person.email, name: person.firstName }, "Votre rendez-vous avec FeaseWeb", {
    greetingName: person.firstName,
    title: "Un rendez-vous a été fixé",
    paragraphs: [`FeaseWeb vous appellera le ${frDate(date, time)} pour parler de votre site.`, "Si ce moment ne vous convient pas, choisissez-en un autre depuis votre espace."],
    cta: { label: "Voir mon espace", url: appUrl("/espace-client") },
  });
}

// --- Messages et demandes ------------------------------------------------

export async function onProspectMessage(person: Person, message: string) {
  await notifyFeaseWeb(`Message de ${who(person)}`, [message], "/admin/dossiers");
}

export async function onModificationRequest(person: Person, title: string, message: string) {
  await notifyFeaseWeb(`Demande de modification : ${who(person)}`, [title, message], "/admin/dossiers");
}

// --- Paiement ------------------------------------------------------------

export async function onPaymentRequested(person: Person) {
  if (!person.email) return;
  await sendEmail({ email: person.email, name: person.firstName }, "Votre site FeaseWeb est prêt à être lancé", {
    greetingName: person.firstName,
    title: "Votre projet est validé",
    paragraphs: ["Nous avons validé votre projet. Il ne reste qu'à activer votre abonnement (49 € par mois, tout compris) pour que nous démarrions la création de votre site."],
    cta: { label: "Activer mon abonnement", url: appUrl("/espace-client#paiement") },
  });
}

export async function onFirstPaymentReceived(person: Person) {
  await notifyFeaseWeb(`Paiement reçu : ${who(person)}`, ["Premier paiement confirmé. Le site est à créer."], "/admin");
  if (!person.email) return;
  await sendEmail({ email: person.email, name: person.firstName }, "Bienvenue chez FeaseWeb", {
    greetingName: person.firstName,
    title: "Votre abonnement est actif",
    paragraphs: ["Merci ! Nous démarrons la création de votre site.", "Prochaine étape : envoyez-nous vos textes, photos et logo depuis votre espace. Plus vite nous les avons, plus vite votre site est en ligne."],
    cta: { label: "Envoyer mes contenus", url: appUrl("/espace-client/production") },
  });
}

export async function onPaymentFailed(person: Person) {
  await notifyFeaseWeb(`Paiement échoué : ${who(person)}`, ["Le prélèvement mensuel n'a pas abouti. Stripe va retenter automatiquement."], "/admin");
  if (!person.email) return;
  await sendEmail({ email: person.email, name: person.firstName }, "Votre paiement FeaseWeb n'a pas abouti", {
    greetingName: person.firstName,
    title: "Paiement à régulariser",
    paragraphs: ["Le dernier prélèvement de votre abonnement n'a pas abouti.", "Mettez à jour votre moyen de paiement pour que votre site continue d'être suivi."],
    cta: { label: "Mettre à jour mon paiement", url: appUrl("/espace-client#paiement") },
  });
}

export async function onSubscriptionCanceled(person: Person) {
  await notifyFeaseWeb(`Abonnement résilié : ${who(person)}`, ["L'abonnement Stripe est terminé. Vérifiez la suite à donner au site (transfert, archivage)."], "/admin");
  if (!person.email) return;
  await sendEmail({ email: person.email, name: person.firstName }, "Votre abonnement FeaseWeb est terminé", {
    greetingName: person.firstName,
    title: "Abonnement terminé",
    paragraphs: ["Votre abonnement FeaseWeb a pris fin.", "Si c'est une erreur, ou si vous souhaitez le reprendre, répondez simplement à cet e-mail."],
  });
}
