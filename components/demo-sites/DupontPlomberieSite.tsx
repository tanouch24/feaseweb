import Image from "next/image";
import { demoSiteImages } from "@/lib/demo-site-images";

const services = [
  { label: "Dépannage urgence", detail: "Intervention en moins d'1h" },
  { label: "Installation sanitaire", detail: "Salle de bain, chauffe-eau" },
  { label: "Rénovation", detail: "Devis gratuit sous 24h" },
];

export function DupontPlomberieSite({
  variant = "thumbnail",
  scrollPreview = false,
  priority = false,
}: {
  variant?: "thumbnail" | "detail";
  scrollPreview?: boolean;
  /** Only true for the single above-the-fold instance (the Hero). */
  priority?: boolean;
}) {
  const isDetail = variant === "detail";

  return (
    <div className="bg-white font-sans text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <span className={`font-bold text-blue-800 ${isDetail ? "text-lg" : "text-sm"}`}>
          Dupont Plomberie
        </span>
        <span
          className={`rounded-md bg-blue-700 px-3 py-1.5 font-medium text-white ${
            isDetail ? "text-sm" : "text-[11px]"
          }`}
        >
          06 12 34 56 78
        </span>
      </header>

      <div className={isDetail ? "px-8 py-10" : "px-5 py-4"}>
        <div className={`grid gap-4 sm:grid-cols-2 sm:items-center ${isDetail ? "md:gap-6" : ""}`}>
          <div>
            <p
              className={`font-medium uppercase tracking-wide text-blue-700 ${
                isDetail ? "text-xs" : "text-[10px]"
              }`}
            >
              Plombier agréé — Lyon et alentours
            </p>
            <p
              className={`mt-2 font-extrabold leading-tight text-slate-900 ${
                isDetail ? "text-4xl" : "text-xl"
              }`}
            >
              Un dépannage rapide, 7j/7.
            </p>
            {isDetail && (
              <p className="mt-4 max-w-sm text-slate-600">
                Fuite, chauffe-eau en panne, canalisation bouchée : nous
                intervenons le jour même dans tout le secteur.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`rounded-md bg-blue-700 font-semibold text-white ${
                  isDetail ? "px-5 py-2.5 text-sm" : "px-3 py-1.5 text-[11px]"
                }`}
              >
                Appeler
              </span>
              <span
                className={`rounded-md border border-blue-700 font-semibold text-blue-700 ${
                  isDetail ? "px-5 py-2.5 text-sm" : "px-3 py-1.5 text-[11px]"
                }`}
              >
                Demander un devis
              </span>
            </div>
          </div>
          <div className={`relative overflow-hidden rounded-md ${isDetail ? "h-56" : "h-16"}`}>
            <Image
              src={demoSiteImages.plumbingHero.src}
              alt={demoSiteImages.plumbingHero.alt}
              fill
              sizes={isDetail ? "50vw" : "300px"}
              className="object-cover"
              priority={priority}
            />
          </div>
        </div>

        <div
          className={`${scrollPreview ? "mt-6" : "mt-5"} grid grid-cols-3 gap-2 ${
            isDetail ? "gap-4" : ""
          }`}
        >
          {services.map((service) => (
            <div
              key={service.label}
              className={`rounded-md bg-slate-50 ${isDetail ? "p-4" : "p-2"}`}
            >
              <p
                className={`font-semibold text-slate-800 ${
                  isDetail ? "text-sm" : "text-[10px]"
                }`}
              >
                {service.label}
              </p>
              {isDetail && (
                <p className="mt-1 text-xs text-slate-500">{service.detail}</p>
              )}
            </div>
          ))}
        </div>

        {scrollPreview && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-blue-700">
              Zone d&apos;intervention
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Lyon, Villeurbanne, Vénissieux et alentours — 20km.
            </p>
          </div>
        )}

        {isDetail && (
          <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-500">
            Dupont Plomberie — Plombier agréé, Lyon · Zone d&apos;intervention
            20km
          </div>
        )}
      </div>
    </div>
  );
}
