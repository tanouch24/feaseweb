"use client";

import { useParallax } from "@/hooks/useParallax";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { CheckIcon } from "@/components/ui/icons";

const statusItems = [
  "Site en ligne",
  "SEO actif",
  "SSL sécurisé",
  "Maintenance active",
  "Mobile optimisé",
];

export function HeroVisual() {
  const { ref, offset } = useParallax(10);

  return (
    <div ref={ref} className="relative pb-8 sm:pb-52">
      <div
        style={{ transform: `translate(${offset.x * 0.5}px, ${offset.y * 0.5}px)` }}
      >
        <div className="animate-rise" style={{ animationDelay: "260ms" }}>
          <MockupFrame>
            <SiteMockup
              businessName="Dupont Plomberie"
              tagline="Dépannage 7j/7 dans tout le secteur"
              animate
            />
          </MockupFrame>
        </div>
      </div>
      <div
        className="absolute left-6 top-48 hidden sm:block"
        style={{ transform: `translate(${offset.x * 1.2}px, ${offset.y * 1.2}px)` }}
      >
        <div className="animate-rise" style={{ animationDelay: "520ms" }}>
          <PhoneMockup businessName="Dupont Plomberie" />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-line pt-5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:mt-0 sm:border-t-0 sm:pt-0">
        {statusItems.map((label, index) => (
          <span
            key={label}
            className="animate-rise flex items-center gap-1.5 text-xs font-medium text-ink-soft"
            style={{ animationDelay: `${700 + index * 110}ms` }}
          >
            <CheckIcon className="h-3.5 w-3.5 text-brand" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
