import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Parlez-nous de votre entreprise",
    body: "Quelques questions simples, cinq minutes suffisent.",
  },
  {
    number: "02",
    title: "FeaseWeb prépare votre site",
    body: "Design, contenu, mobile, structure et référencement.",
  },
  {
    number: "03",
    title: "Vous validez",
    body: "Vous voyez le résultat avant toute mise en ligne.",
  },
  {
    number: "04",
    title: "On s'occupe du reste",
    body: "Mise en ligne, hébergement, maintenance, modifications et suivi SEO.",
  },
];

export function ProcessSteps() {
  return (
    <section id="comment-ca-marche" className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Comment ça marche" />
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`rounded-lg p-6 ${
                step.number === "04"
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-ink"
              }`}
            >
              <p
                className={`font-serif text-3xl ${
                  step.number === "04" ? "text-white/70" : "text-line"
                }`}
              >
                {step.number}
              </p>
              <p className="mt-3 font-medium">{step.title}</p>
              <p
                className={`mt-2 text-sm ${
                  step.number === "04" ? "text-white/80" : "text-ink-soft"
                }`}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
