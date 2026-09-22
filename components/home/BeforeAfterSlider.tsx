"use client";

import { useState } from "react";
import { MockupFrame } from "@/components/ui/MockupFrame";

function BeforeSitePreview() {
  return (
    <div
      className="flex h-full w-full flex-col bg-[#eaeaea] p-4"
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
      <div className="mt-3 flex h-16 w-24 items-center justify-center border border-gray-400 bg-gray-300 text-center text-[10px] text-gray-500">
        photo.jpg
      </div>
      <p className="mt-4 text-[10px] text-gray-500">
        Optimisé pour Internet Explorer — 800x600
      </p>
    </div>
  );
}

function AfterSitePreview() {
  return (
    <div className="flex h-full w-full flex-col bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="font-serif text-base text-ink">Dupont Plomberie</span>
        <span className="rounded-sm bg-brand px-3 py-1.5 text-xs font-medium text-white">
          Devis gratuit
        </span>
      </div>
      <p className="mt-6 font-serif text-2xl text-ink">
        Plombier à Lyon,
        <br />
        disponible 7j/7
      </p>
      <p className="mt-2 max-w-xs text-sm text-ink-soft">
        Dépannage rapide, devis clair, intervention le jour même.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-16 rounded-sm bg-gradient-to-br from-brand/25 via-brand/10 to-bg-alt" />
        <div className="h-16 rounded-sm bg-gradient-to-br from-accent/25 via-accent/10 to-bg-alt" />
      </div>
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
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
          >
            <AfterSitePreview />
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
