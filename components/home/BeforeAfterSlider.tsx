"use client";

import { useState } from "react";
import Image from "next/image";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { DupontPlomberieSite } from "@/components/demo-sites/DupontPlomberieSite";
import { demoSiteImages } from "@/lib/demo-site-images";

function BeforeSitePreview() {
  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto bg-[#eaeaea] p-4"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <p className="text-[11px] text-gray-600 underline">
        accueil - prestations - contact
      </p>
      <p className="mt-3 text-lg font-bold text-blue-800 underline">
        DUPONT PLOMBERIE - Plombier a Lyon
      </p>
      <p className="mt-2 text-[12px] leading-tight text-gray-700">
        Bienvenue sur notre site. Nous intervenons pour tous vos problemes de
        plomberie. Devis gratuit au 04.XX.XX.XX.XX.
      </p>
      <div className="relative mt-3 h-16 w-24 overflow-hidden border border-gray-400">
        <Image
          src={demoSiteImages.plumbingHero.src}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
          style={{ filter: "grayscale(0.4) contrast(0.85) brightness(0.95)" }}
        />
      </div>
      <p className="mt-4 text-[10px] text-gray-500">
        Optimisé pour Internet Explorer — 800x600
      </p>
    </div>
  );
}

export function BeforeAfterSlider() {
  const [percent, setPercent] = useState(50);
  const [focused, setFocused] = useState(false);

  return (
    <MockupFrame>
      <div className="overflow-hidden rounded-md border border-line shadow-sm">
        <div className="flex items-center gap-2 border-b border-line bg-bg-alt px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
          </div>
          <div className="ml-2 flex-1 truncate rounded-sm bg-white px-3 py-1 text-[11px] text-ink-soft">
            dupont-plomberie.fr
          </div>
        </div>
        <div className="relative h-72 select-none sm:h-80">
          <div className="absolute inset-0">
            <BeforeSitePreview />
          </div>
          <div
            className="absolute inset-0 overflow-y-auto"
            style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
          >
            <DupontPlomberieSite variant="detail" />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{ left: `${percent}%` }}
          >
            <div className="h-full w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" />
            <span
              className={`absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md transition-shadow ${
                focused ? "ring-2 ring-brand ring-offset-2" : ""
              }`}
            >
              ↔
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={percent}
            onChange={(event) => setPercent(Number(event.target.value))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Comparer l'ancien site et le site FeaseWeb"
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
        <div className="flex items-center justify-between border-t border-line bg-white px-4 py-2 text-xs text-ink-soft">
          <span>Avant</span>
          <span>Après — FeaseWeb</span>
        </div>
      </div>
    </MockupFrame>
  );
}
