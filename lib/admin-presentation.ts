import type { Client, ProjectIntake, Prospect, Site } from "@/lib/backoffice";

export type ProspectBusinessFilter = "all" | "to_call" | "appointments" | "to_validate" | "approved" | "to_complete" | "declined";

export type ProspectBusinessState = {
  label: string;
  nextAction: string;
  filter: Exclude<ProspectBusinessFilter, "all">;
};

export function getProspectBusinessState(prospect: Prospect, project?: ProjectIntake): ProspectBusinessState {
  const review = prospect.review;
  const validation = review?.validationStatus ?? "pending";
  const appointment = review?.appointmentStatus ?? "not_scheduled";
  const complete = Boolean(project && (project.currentStep >= 8 || project.completedAt));

  if (validation === "declined" || prospect.status === "perdu") return { label: "Refusé", nextAction: "Dossier refusé", filter: "declined" };
  if (validation === "needs_information") return { label: "Informations complémentaires nécessaires", nextAction: "Informations à obtenir", filter: "to_complete" };
  if (validation === "approved") return { label: "Validé — en attente d'abonnement", nextAction: "En attente d'abonnement", filter: "approved" };
  if (appointment === "completed") return { label: "Rendez-vous effectué — à valider", nextAction: "Prendre une décision", filter: "to_validate" };
  if (appointment === "scheduled") return { label: "Rendez-vous prévu", nextAction: "Préparer le rendez-vous", filter: "appointments" };
  if (!complete) return { label: "Configuration à terminer", nextAction: "En attente du prospect", filter: "to_complete" };
  return { label: "À appeler", nextAction: "Planifier / appeler", filter: "to_call" };
}

export function getProjectStatusLabel(status?: string): string {
  return ({
    project_configured: "Projet configuré",
    subscription_active: "Abonnement actif",
    preparation: "Préparation du site",
    building: "Site en création",
    preview_ready: "Aperçu prêt",
    client_feedback: "Retour client attendu",
    finalizing: "Finalisation",
    live: "Site en ligne",
  } as Record<string, string>)[status ?? ""] ?? "État à préciser";
}

export function getClientProject(client: Client, projects: ProjectIntake[]) {
  return projects.find((project) => project.clientId === client.id);
}

export function getClientCompleteness(project?: ProjectIntake): string {
  if (!project) return "Dossier à compléter";
  if (project.currentStep >= 8 || project.completedAt) return "Informations reçues";
  return `Configuration en cours · étape ${project.currentStep}/8`;
}

export function getSiteProjectStatus(site: Site, projects: ProjectIntake[]): string {
  const project = projects.find((item) => item.clientId === site.clientId);
  return getProjectStatusLabel(project?.status);
}
