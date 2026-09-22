import { SectionHeading } from "@/components/ui/SectionHeading";

const foundations = [
  "Indexation",
  "Structure",
  "Contenus",
  "Balises",
  "Performance",
  "Visibilité Google — suivie dans l'espace client",
];

export function SEOSection() {
  return (
    <section id="seo" className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading title="Un beau site ne suffit pas. Il faut aussi qu'on puisse le trouver." />
        <p className="mt-4 max-w-xl text-ink-soft">
          Le référencement est inclus dans votre abonnement : FeaseWeb travaille
          les fondations techniques de votre site et suit son évolution dans le
          temps.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {foundations.map((item) => (
            <li key={item} className="flex items-start gap-2 text-ink-soft">
              <span className="mt-1 text-accent">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
