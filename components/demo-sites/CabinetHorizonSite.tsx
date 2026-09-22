import Image from "next/image";
import { demoSiteImages } from "@/lib/demo-site-images";

const method = [
  { step: "01", label: "Diagnostic" },
  { step: "02", label: "Stratégie" },
  { step: "03", label: "Accompagnement" },
];

export function CabinetHorizonSite({
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
    <div className="bg-white font-sans text-[#1a2338]">
      <header
        className={`flex items-center justify-between border-b-2 border-[#1a2338] px-5 ${
          isDetail ? "py-4" : "py-2.5"
        }`}
      >
        <span
          className={`font-serif tracking-wide text-[#1a2338] ${
            isDetail ? "text-lg" : "text-sm"
          }`}
        >
          Cabinet Horizon
        </span>
        <span
          className={`font-medium uppercase tracking-[0.15em] text-[#8a7a4f] ${
            isDetail ? "text-xs" : "text-[9px]"
          }`}
        >
          Conseil
        </span>
      </header>

      <div
        className={`grid gap-4 sm:grid-cols-2 sm:items-center ${
          isDetail ? "px-8 py-10 md:gap-6" : "px-5 py-4"
        }`}
      >
        <div>
          <p
            className={`font-serif leading-tight text-[#1a2338] ${
              isDetail ? "text-3xl" : "text-lg"
            }`}
          >
            Conseil et accompagnement pour votre entreprise.
          </p>
          {isDetail && (
            <p className="mt-4 max-w-sm text-sm text-[#4b5266]">
              Un cabinet à taille humaine, pour structurer votre stratégie et
              vous accompagner dans la durée.
            </p>
          )}
          <span
            className={`mt-4 inline-block border border-[#1a2338] font-medium text-[#1a2338] ${
              isDetail ? "px-5 py-2.5 text-sm" : "px-3 py-1.5 text-[10px]"
            }`}
          >
            Prendre rendez-vous
          </span>
        </div>
        <div className={`relative overflow-hidden ${isDetail ? "h-48" : "h-20"}`}>
          <Image
            src={demoSiteImages.consultingHero.src}
            alt={demoSiteImages.consultingHero.alt}
            fill
            sizes={isDetail ? "50vw" : "300px"}
            className="object-cover"
            priority={priority}
          />
        </div>
      </div>

      <div className={`grid grid-cols-3 border-t border-[#e4e1d8] ${isDetail ? "px-8 py-6" : "px-5 py-3"}`}>
        {method.map((item) => (
          <div key={item.step} className={isDetail ? "border-l border-[#e4e1d8] pl-4" : ""}>
            <p
              className={`font-serif text-[#8a7a4f] ${isDetail ? "text-xl" : "text-xs"}`}
            >
              {item.step}
            </p>
            <p className={`mt-0.5 text-[#1a2338] ${isDetail ? "text-sm" : "text-[9px]"}`}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {scrollPreview && (
        <div className="border-t border-[#e4e1d8] px-5 py-3 text-[10px] text-[#4b5266]">
          Sur rendez-vous — premier échange offert
        </div>
      )}

      {isDetail && (
        <div className="border-t border-[#e4e1d8] px-8 py-6 text-xs text-[#4b5266]">
          Cabinet Horizon — Conseil et accompagnement professionnel
        </div>
      )}
    </div>
  );
}
