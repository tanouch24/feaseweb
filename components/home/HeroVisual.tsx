"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const statusItems = [
  "Site en ligne",
  "SEO actif",
  "SSL sécurisé",
  "Maintenance active",
  "Mobile optimisé",
];

/**
 * Vidéo du haut de page (8 s en boucle, sans son, sans texte), réalisée avec
 * Remotion dans ~/Developer/feaseweb-video (composition HeroLoop). Son fond
 * est le vert nuit du bloc d'accueil. L'image fixe s'affiche tout de suite ;
 * la vidéo ne se charge qu'une fois la page prête, pour ne pas ralentir
 * l'affichage. Pas de lecture automatique si l'appareil demande moins
 * d'animations.
 */
export function HeroVisual() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = () => {
      video.preload = "auto";
      const result = video.play() as Promise<void> | undefined;
      result?.catch(() => {});
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  return (
    <div className="relative min-w-0">
      <video
        ref={videoRef}
        className="block aspect-[4/3] w-full max-w-full"
        poster="/videos/feaseweb-hero-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        aria-label="Un curseur clique sur le site Dupont Plomberie qui passe en ligne, la version mobile défile, puis quatre sites de métiers s'enchaînent."
      >
        <source src="/videos/feaseweb-hero.mp4" type="video/mp4" />
      </video>

      <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5" aria-label="Inclus dans le service">
        {statusItems.map((label, index) => (
          <li key={label} className="build-chip flex items-center gap-1.5 text-[13px] font-medium text-white/75" style={{ "--in": `${0.6 + index * 0.15}s` } as CSSProperties}>
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
