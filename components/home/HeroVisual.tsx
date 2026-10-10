import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { demoSiteImages } from "@/lib/demo-site-images";

const statusItems = [
  "Site en ligne",
  "SEO actif",
  "SSL sécurisé",
  "Maintenance active",
  "Mobile optimisé",
];

/**
 * « Le site qui se construit » : chaque pièce de la maquette apparaît en
 * squelette gris, prend sa vraie forme, puis les étapes se cochent et le site
 * passe « En ligne ». Animation 100 % CSS (classes .build-* dans globals.css),
 * jouée une fois au chargement ; sans animation, la maquette est terminée.
 */
function Bit({ children, inAt, skinAt, className = "" }: { children: ReactNode; inAt: number; skinAt: number; className?: string }) {
  return (
    <div className={`build-bit ${className}`} style={{ "--in": `${inAt}s`, "--skin": `${skinAt}s` } as CSSProperties}>
      {children}
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="relative min-w-0">
      <div className="overflow-hidden rounded-md bg-white text-slate-900 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="ml-2 min-w-0 truncate rounded bg-white px-2.5 py-0.5 text-[11px] text-slate-500">
            dupontplomberie.feaseweb.fr
          </span>
        </div>
        <div className="grid gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <Bit inAt={0.4} skinAt={1.4}><span className="text-sm font-bold text-blue-800">Dupont Plomberie</span></Bit>
            <Bit inAt={0.5} skinAt={1.55}><span className="block rounded-md bg-blue-700 px-3 py-1.5 text-[11px] font-medium text-white">06 12 34 56 78</span></Bit>
          </div>
          <div className="grid items-center gap-4 sm:grid-cols-[1.1fr_1fr]">
            <div className="min-w-0">
              <Bit inAt={0.6} skinAt={1.7}><p className="text-[10px] font-medium tracking-wide text-blue-700">PLOMBIER AGRÉÉ · LYON ET ALENTOURS</p></Bit>
              <Bit inAt={0.7} skinAt={1.85} className="mt-2"><p className="text-xl leading-tight font-extrabold sm:text-2xl">Un dépannage rapide, 7j/7.</p></Bit>
              <Bit inAt={0.8} skinAt={2} className="mt-2"><p className="text-[12px] leading-snug text-slate-600">Fuite, chauffe-eau en panne : intervention le jour même.</p></Bit>
              <div className="mt-3 flex flex-wrap gap-2">
                <Bit inAt={0.9} skinAt={2.15}><span className="block rounded-md bg-blue-700 px-3 py-1.5 text-[11px] font-semibold text-white">Appeler</span></Bit>
                <Bit inAt={0.95} skinAt={2.25}><span className="block rounded-md border border-blue-700 px-3 py-1.5 text-[11px] font-semibold text-blue-700">Demander un devis</span></Bit>
              </div>
            </div>
            <Bit inAt={0.75} skinAt={2.4} className="relative aspect-[4/3] overflow-hidden rounded-md">
              <Image
                src={demoSiteImages.plumbingHero.src}
                alt={demoSiteImages.plumbingHero.alt}
                fill
                priority
                sizes="(min-width: 1024px) 260px, 45vw"
                className="object-cover object-[center_35%]"
              />
            </Bit>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["Dépannage", 1.05, 2.5], ["Installation", 1.1, 2.6], ["Rénovation", 1.15, 2.7]].map(([label, inAt, skinAt]) => (
              <Bit key={label as string} inAt={inAt as number} skinAt={skinAt as number}>
                <span className="block rounded-md border border-slate-200 px-2.5 py-2 text-[11px] font-semibold">{label}</span>
              </Bit>
            ))}
          </div>
        </div>
      </div>

      <span className="build-live absolute -top-3 right-4 rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-night" style={{ "--in": "4s" } as CSSProperties}>
        En ligne ✓
      </span>

      <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5" aria-label="Inclus dans le service">
        {statusItems.map((label, index) => (
          <li key={label} className="build-chip flex items-center gap-1.5 text-[13px] font-medium text-white/75" style={{ "--in": `${2.9 + index * 0.2}s` } as CSSProperties}>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
            </svg>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
