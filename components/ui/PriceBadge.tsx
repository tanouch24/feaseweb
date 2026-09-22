export function PriceBadge({
  variant = "hero",
}: {
  variant?: "hero" | "compact";
}) {
  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-3 rounded-md border border-line bg-white px-4 py-2.5">
        <span className="text-sm text-ink-soft">0 € de création</span>
        <span className="h-4 w-px bg-line" />
        <span className="font-serif text-lg text-brand-dark">
          49 €<span className="text-sm text-ink-soft">/mois</span>
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col gap-3 rounded-md border border-line bg-white px-6 py-5 sm:flex-row sm:items-center sm:gap-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-soft">
          Création ou refonte
        </p>
        <p className="font-serif text-2xl text-ink">0 €</p>
      </div>
      <span className="hidden h-10 w-px bg-line sm:block" />
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-soft">
          Ensuite, tout compris
        </p>
        <p className="font-serif text-2xl text-brand-dark">
          49 €<span className="text-base text-ink-soft"> / mois</span>
        </p>
      </div>
    </div>
  );
}
