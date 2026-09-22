import Image from "next/image";
import { demoSiteImages } from "@/lib/demo-site-images";

const realisations = [
  { src: demoSiteImages.roofingHero, label: "Toiture ardoise — Villeurbanne" },
  { src: demoSiteImages.roofingDetail, label: "Zinguerie — Écully" },
];

export function AtelierToitureSite({
  variant = "thumbnail",
  scrollPreview = false,
  priority = false,
}: {
  variant?: "thumbnail" | "detail";
  scrollPreview?: boolean;
  priority?: boolean;
}) {
  const isDetail = variant === "detail";

  return (
    <div className="bg-stone-950 font-sans text-stone-100">
      <header
        className={`flex items-center justify-between border-b border-stone-800 px-5 ${
          isDetail ? "py-4" : "py-3"
        }`}
      >
        <span
          className={`font-semibold uppercase tracking-[0.2em] text-stone-100 ${
            isDetail ? "text-sm" : "text-[11px]"
          }`}
        >
          Atelier Toiture
        </span>
        <span
          className={`border border-orange-500 font-medium uppercase tracking-wide text-orange-400 ${
            isDetail ? "px-4 py-1.5 text-xs" : "px-2 py-1 text-[9px]"
          }`}
        >
          Devis
        </span>
      </header>

      <div className={`relative ${isDetail ? "h-64" : "h-28"}`}>
        <Image
          src={demoSiteImages.roofingHero.src}
          alt={demoSiteImages.roofingHero.alt}
          fill
          sizes={isDetail ? "100vw" : "300px"}
          className="object-cover"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        <div className={`absolute bottom-0 left-0 p-5 ${isDetail ? "pb-6" : "pb-3"}`}>
          <p
            className={`font-medium uppercase tracking-[0.15em] text-orange-400 ${
              isDetail ? "text-xs" : "text-[9px]"
            }`}
          >
            Couverture · Zinguerie · Rénovation
          </p>
          <p
            className={`mt-1 font-semibold leading-tight text-white ${
              isDetail ? "text-3xl" : "text-lg"
            }`}
          >
            Une toiture faite pour durer.
          </p>
        </div>
      </div>

      <div className={isDetail ? "px-8 py-8" : "px-5 py-4"}>
        {isDetail && (
          <p className="max-w-md text-sm text-stone-300">
            Diagnostic, rénovation complète ou zinguerie sur mesure : nos
            couvreurs interviennent avec les matériaux adaptés à votre région.
          </p>
        )}
        <p
          className={`mt-4 font-medium uppercase tracking-wide text-stone-400 ${
            isDetail ? "text-xs" : "text-[9px]"
          }`}
        >
          Réalisations
        </p>
        <div className={`mt-2 grid grid-cols-2 gap-2 ${isDetail ? "gap-4" : ""}`}>
          {realisations.map((item) => (
            <div
              key={item.label}
              className={`relative overflow-hidden ${isDetail ? "h-32" : "h-14"}`}
            >
              <Image
                src={item.src.src}
                alt={item.src.alt}
                fill
                sizes={isDetail ? "25vw" : "150px"}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {scrollPreview && (
          <div className="mt-4 flex items-center justify-between border-t border-stone-800 pt-4">
            <p className="text-[10px] text-stone-400">
              Intervention sous 48h — devis gratuit
            </p>
            <span className="border border-orange-500 px-2 py-1 text-[9px] font-medium uppercase tracking-wide text-orange-400">
              Contact
            </span>
          </div>
        )}

        {isDetail && (
          <div className="mt-10 border-t border-stone-800 pt-6 text-xs text-stone-500">
            Atelier Toiture — Couverture, zinguerie et rénovation
          </div>
        )}
      </div>
    </div>
  );
}
