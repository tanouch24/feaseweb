"use client";

import { StatusPill } from "@/components/ui/StatusPill";
import { useInView } from "@/hooks/useInView";
import {
  HomeIcon,
  GlobeIcon,
  RequestIcon,
  ChartIcon,
  InvoiceIcon,
  SupportIcon,
} from "@/components/ui/icons";

const sidebarItems = [
  { label: "Accueil", Icon: HomeIcon },
  { label: "Mon site", Icon: GlobeIcon },
  { label: "Mes demandes", Icon: RequestIcon },
  { label: "Mon référencement", Icon: ChartIcon },
  { label: "Factures & abonnement", Icon: InvoiceIcon },
  { label: "Support", Icon: SupportIcon },
];

export function DashboardPreview({ compact = false }: { compact?: boolean }) {
  const { ref, inView } = useInView({ threshold: 0.3 });

  return (
    <div
      ref={ref as (node: HTMLDivElement | null) => void}
      className="overflow-hidden rounded-lg border border-line bg-white shadow-sm"
    >
      <div className="flex">
        <aside className="hidden w-48 flex-col gap-1 border-r border-line bg-bg-alt p-4 sm:flex">
          {sidebarItems.map(({ label, Icon }, index) => (
            <span
              key={label}
              className={`flex items-center gap-2 rounded-sm px-3 py-2 text-sm ${
                index === 0 ? "bg-white text-ink" : "text-ink-soft"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </span>
          ))}
        </aside>
        <div className="flex-1 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-sm text-ink-soft">Bonjour</p>
              <p className="font-serif text-xl text-ink">Dupont Plomberie</p>
            </div>
            <span className="rounded-sm bg-bg-alt px-2 py-1 text-[11px] text-ink-soft">
              Données de démonstration
            </span>
          </div>
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
              <svg viewBox="0 0 100 40" className="mt-2 h-10 w-full" aria-hidden="true">
                <polyline
                  points="0,32 15,27 30,29 45,19 60,15 75,17 100,6"
                  fill="none"
                  stroke="var(--color-brand)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: inView ? 0 : 1,
                    transition: "stroke-dashoffset 1.1s ease-out",
                  }}
                />
              </svg>
              <p
                className={`mt-1 text-[11px] text-ink-soft transition-opacity duration-500 ${
                  inView ? "opacity-100" : "opacity-0"
                }`}
                style={{ transitionDelay: "900ms" }}
              >
                En progression
              </p>
            </div>
            <div className="rounded-md border border-line p-4">
              <p className="text-xs text-ink-soft">Mes demandes</p>
              <p className="mt-2 text-sm text-ink">1 modification en cours</p>
              <p className="mt-1 text-[11px] text-ink-soft">
                Dernière action : titre de la page « Dépannage plomberie Lyon »
                optimisé
              </p>
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
