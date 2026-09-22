import { StatusPill } from "@/components/ui/StatusPill";

const sidebarItems = [
  "Accueil",
  "Mon site",
  "Mes demandes",
  "Mon référencement",
  "Factures & abonnement",
  "Support",
];

const chartBars = [40, 55, 48, 62, 70, 66, 78];

export function DashboardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
      <div className="flex">
        <aside className="hidden w-44 flex-col gap-1 border-r border-line bg-bg-alt p-4 sm:flex">
          {sidebarItems.map((item, index) => (
            <span
              key={item}
              className={`rounded-sm px-3 py-2 text-sm ${
                index === 0 ? "bg-white text-ink" : "text-ink-soft"
              }`}
            >
              {item}
            </span>
          ))}
        </aside>
        <div className="flex-1 p-6">
          <p className="text-sm text-ink-soft">Bonjour</p>
          <p className="font-serif text-xl text-ink">Dupont Plomberie</p>
          <div
            className={`mt-6 grid gap-4 ${
              compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            <div className="rounded-md border border-line p-4">
              <p className="text-xs text-ink-soft">Mon site</p>
              <div className="mt-2">
                <StatusPill label="En ligne" tone="positive" />
              </div>
            </div>
            <div className="rounded-md border border-line p-4">
              <p className="text-xs text-ink-soft">Visibilité Google</p>
              <svg viewBox="0 0 70 32" className="mt-2 h-8 w-full" aria-hidden="true">
                {chartBars.map((value, index) => (
                  <rect
                    key={index}
                    x={index * 10}
                    y={32 - value * 0.32}
                    width={6}
                    height={value * 0.32}
                    className="fill-brand/70"
                  />
                ))}
              </svg>
            </div>
            <div className="rounded-md border border-line p-4">
              <p className="text-xs text-ink-soft">Mes demandes</p>
              <p className="mt-2 text-sm text-ink">1 modification en cours</p>
            </div>
            <div className="rounded-md border border-line p-4">
              <p className="text-xs text-ink-soft">Abonnement</p>
              <p className="mt-2 text-sm text-ink">49 €/mois — Actif</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
