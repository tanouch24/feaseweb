import { SectionHeading } from "@/components/ui/SectionHeading";

const diyTasks = [
  "Choisir un thème",
  "Construire les pages",
  "Comprendre les réglages",
  "Maintenir le site",
  "Gérer le SEO",
  "Résoudre les problèmes",
];

export function ComparisonBlock() {
  return (
    <section id="tout-compris" className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading title="Vous ne construisez rien. FeaseWeb le fait pour vous." />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-8">
            <p className="text-sm font-medium uppercase tracking-wide text-ink-soft">
              Avec un constructeur classique
            </p>
            <ul className="mt-5 space-y-3 text-ink-soft">
              {diyTasks.map((task) => (
                <li key={task}>— {task}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-brand p-8 text-white">
            <p className="text-sm font-medium uppercase tracking-wide text-white/70">
              Avec FeaseWeb
            </p>
            <p className="mt-5 font-serif text-2xl">
              Vous nous parlez de votre entreprise.
            </p>
            <p className="mt-2 font-serif text-2xl text-white/90">
              On s&apos;occupe du reste.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
