"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
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
      <div className="mt-2 overflow-hidden whitespace-nowrap border-2 border-gray-400 bg-[#ffff99] px-1 py-0.5 text-[11px]">
        <span className="old-marquee inline-block">*** PROMO *** Devis gratuit *** Nous intervenons pour tous vos problemes ***</span>
      </div>
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
        Optimisé pour Internet Explorer — 800x600 · Visiteurs :{" "}
        <span className="bg-black px-1 font-mono text-[#00ff00]">001234</span>
      </p>
    </div>
  );
}

export function BeforeAfterSlider() {
  const [percent, setPercent] = useState(50);
  const [focused, setFocused] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.45 });
  const touched = useRef(false);

  // À la première apparition, le nouveau site balaie l'ancien puis s'arrête au
  // milieu. Une seule fois, interrompu dès que le visiteur touche le curseur.
  useEffect(() => {
    if (!inView || touched.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const keyframes = [
      { at: 0, value: 0 },
      { at: 0.65, value: 100 },
      { at: 1, value: 50 },
    ];
    const duration = 2600;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (touched.current) return;
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      const segment = t < keyframes[1].at ? 0 : 1;
      const from = keyframes[segment];
      const to = keyframes[segment + 1];
      const local = ease((t - from.at) / (to.at - from.at));
      setPercent(Math.round(from.value + (to.value - from.value) * local));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const delay = setTimeout(() => { frame = requestAnimationFrame(tick); }, 250);
    return () => { clearTimeout(delay); cancelAnimationFrame(frame); };
  }, [inView]);

  return (
    <MockupFrame>
      <div ref={ref as (node: HTMLDivElement | null) => void} className="overflow-hidden rounded-md border border-line shadow-sm">
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
            onChange={(event) => { touched.current = true; setPercent(Number(event.target.value)); }}
            onPointerDown={() => { touched.current = true; }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Comparer l'ancien site et le site FeaseWeb"
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
        <div className="flex items-center justify-between border-t border-line bg-white px-4 py-2 text-xs text-ink-soft">
          <span>Avant</span>
          <span>Après FeaseWeb</span>
        </div>
      </div>
    </MockupFrame>
  );
}
