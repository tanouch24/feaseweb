import { SectionHeading } from "@/components/ui/SectionHeading";

const requests = [
  "Nouveaux horaires",
  "Changement de photo",
  "Nouvelle prestation",
  "Correction d'un texte",
];

const stages = ["Demande envoyée", "En cours", "Terminée"];

export function ModificationFlow() {
  return (
    <section className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading title="Besoin de changer quelque chose ? Demandez-le." />
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {stages.map((stage, index) => (
            <div key={stage} className="flex items-center gap-3">
              <span className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink">
                {stage}
              </span>
              {index < stages.length - 1 && (
                <span className="text-ink-soft">→</span>
              )}
            </div>
          ))}
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {requests.map((request) => (
            <li
              key={request}
              className="rounded-md border border-line bg-white px-4 py-3 text-ink-soft"
            >
              {request}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-ink-soft">Pas besoin de toucher au site vous-même.</p>
      </div>
    </section>
  );
}
