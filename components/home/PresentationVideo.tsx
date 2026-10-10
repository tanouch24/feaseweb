"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Vidéo de présentation (20 s, sans son), réalisée avec Remotion dans le
 * projet séparé ~/Developer/feaseweb-video. Elle ne se charge qu'à l'approche
 * de la section, tourne en boucle et peut être mise en pause. Si l'appareil
 * demande moins d'animations, elle ne démarre pas toute seule.
 */
export function PresentationVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, inView } = useInView({ threshold: 0.35 });
  const [playing, setPlaying] = useState(false);

  // play() ne renvoie pas de promesse sur certains navigateurs anciens.
  const start = (video: HTMLVideoElement) => {
    const result = video.play() as Promise<void> | undefined;
    result?.catch(() => setPlaying(false));
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    start(video);
  }, [inView]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) start(video);
    else video.pause();
  };

  return (
    <section className="px-3 py-6 md:px-5 md:py-8" aria-labelledby="presentation-title">
      <div ref={ref as (node: HTMLDivElement | null) => void} className="mx-auto max-w-6xl px-3 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="presentation-title" className="font-serif text-[2rem] leading-[1.05] text-ink md:text-[2.75rem]">
            FeaseWeb en 20 secondes
          </h2>
          <button
            type="button"
            onClick={toggle}
            className="min-h-11 rounded-sm border border-ink/20 px-4 text-[15px] font-semibold text-ink transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {playing ? "Mettre en pause" : "Lire la vidéo"}
          </button>
        </div>
        <div className="mt-8 overflow-hidden rounded-lg bg-night shadow-[0_30px_60px_-30px_rgba(15,42,38,0.55)]">
          <video
            ref={videoRef}
            className="block aspect-video w-full"
            poster="/videos/feaseweb-presentation-poster.jpg"
            muted
            loop
            playsInline
            preload="none"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label="Présentation de FeaseWeb : un site créé ou refait, en ligne sur ordinateur et mobile, pour chaque métier, avec hébergement, maintenance et référencement compris, pour 0 € de création puis 49 € par mois."
          >
            <source src="/videos/feaseweb-presentation.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
