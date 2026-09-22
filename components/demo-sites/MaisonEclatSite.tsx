import Image from "next/image";
import { demoSiteImages } from "@/lib/demo-site-images";

const soins = ["Soin du visage", "Massage relaxant", "Épilation"];

export function MaisonEclatSite({
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
    <div className="bg-[#fbf3ef] font-serif text-[#3a2e2c]">
      <header
        className={`flex items-center justify-center border-b border-[#e7d9d1] ${
          isDetail ? "py-4" : "py-2.5"
        }`}
      >
        <span
          className={`tracking-[0.15em] text-[#3a2e2c] ${
            isDetail ? "text-lg" : "text-xs"
          }`}
        >
          Maison Éclat
        </span>
      </header>

      <div className={`text-center ${isDetail ? "px-8 py-10" : "px-5 py-5"}`}>
        <div
          className={`relative mx-auto overflow-hidden rounded-xl ${
            isDetail ? "h-48 w-full" : "mx-auto h-20 w-32"
          }`}
        >
          <Image
            src={demoSiteImages.beautyHero.src}
            alt={demoSiteImages.beautyHero.alt}
            fill
            sizes={isDetail ? "60vw" : "200px"}
            className="object-cover"
            priority={priority}
          />
        </div>
        <p
          className={`mx-auto mt-4 leading-snug ${
            isDetail ? "max-w-sm text-3xl" : "text-base"
          }`}
        >
          Prenez soin de vous.
        </p>
        {isDetail && (
          <p className="mx-auto mt-3 max-w-sm text-sm text-[#6b5a56]">
            Institut de beauté et de bien-être — soins du visage, massages et
            épilation, dans un cadre pensé pour la détente.
          </p>
        )}
        <span
          className={`mt-4 inline-block rounded-full bg-[#c98a6b] font-sans font-medium text-white ${
            isDetail ? "px-6 py-2.5 text-sm" : "px-4 py-1.5 text-[10px]"
          }`}
        >
          Réserver un soin
        </span>

        <div
          className={`mx-auto mt-6 max-w-xs divide-y divide-[#e7d9d1] text-left font-sans ${
            isDetail ? "max-w-sm" : ""
          }`}
        >
          {soins.map((soin) => (
            <p
              key={soin}
              className={`py-2 text-[#4a3c39] ${isDetail ? "text-sm" : "text-[11px]"}`}
            >
              {soin}
            </p>
          ))}
        </div>

        {scrollPreview && (
          <div className="mt-4 border-t border-[#e7d9d1] pt-4 font-sans text-[10px] text-[#8a7570]">
            Ouvert du mardi au samedi — sur rendez-vous
          </div>
        )}

        {isDetail && (
          <div className="mt-10 border-t border-[#e7d9d1] pt-6 font-sans text-xs text-[#8a7570]">
            Maison Éclat — Institut de beauté et bien-être
          </div>
        )}
      </div>
    </div>
  );
}
