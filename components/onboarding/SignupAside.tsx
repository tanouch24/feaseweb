import { CheckIcon } from "@/components/ui/icons";

const nextSteps = {
  create: [
    "Vous créez votre espace, en deux minutes.",
    "Vous décrivez votre activité : métier, zone, style.",
    "FeaseWeb prépare votre site.",
    "Vous le voyez et le validez avant de vous engager.",
  ],
  redesign: [
    "Vous nous donnez l'adresse de votre site actuel.",
    "FeaseWeb l'analyse et prépare sa refonte.",
    "Vous voyez le nouveau site avant de vous engager.",
    "On le met en ligne et on s'en occupe ensuite.",
  ],
} as const;

/** Colonne de réassurance des pages d'inscription. */
export function SignupAside({ mode }: { mode: "create" | "redesign" }) {
  return (
    <aside className="rounded-lg bg-night p-7 text-white md:p-8 lg:sticky lg:top-28">
      <div className="flex items-baseline justify-between gap-4 border-b border-white/15 pb-5">
        <span className="text-white/70">{mode === "create" ? "Création" : "Refonte"}</span>
        <span className="font-serif text-3xl font-semibold">0 €</span>
      </div>
      <div className="flex items-baseline justify-between gap-4 pt-5">
        <span className="text-white/70">Ensuite, tout compris</span>
        <span className="font-serif text-3xl font-semibold text-accent">
          49 €<span className="text-base font-medium text-white/60"> par mois</span>
        </span>
      </div>

      <p className="mt-9 font-semibold">Ce qui se passe ensuite</p>
      <ol className="mt-4 grid gap-4">
        {nextSteps[mode].map((step, index) => (
          <li key={step} className="flex gap-3 text-white/80">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-accent-soft">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <ul className="mt-9 grid gap-2.5 border-t border-white/15 pt-6 text-sm text-white/70">
        {[
          "Aucune carte bancaire pour commencer",
          "Hébergement, maintenance et SEO compris",
          "Petites modifications incluses",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-accent" />
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}
