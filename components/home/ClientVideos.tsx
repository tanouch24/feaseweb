"use client";

import { useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { clientVideos, type ClientVideo } from "@/lib/client-videos";

function VideoCard({ video }: { video: ClientVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="min-w-0">
      <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-night">
        <video
          ref={ref}
          src={video.src}
          poster={video.poster}
          preload="none"
          playsInline
          controls={playing}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          className="h-full w-full object-cover"
        />
        {!playing && (
          <button
            type="button"
            onClick={() => ref.current?.play()}
            className="absolute inset-0 flex items-end bg-gradient-to-t from-night/85 via-night/10 to-transparent p-5 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent-soft"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent text-night">
                <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
              <span>
                <span className="block font-semibold">{video.name}</span>
                <span className="block text-sm text-white/75">
                  {video.trade}, {video.city}
                </span>
              </span>
            </span>
            <span className="sr-only">Lire la vidéo de {video.name}</span>
          </button>
        )}
      </div>
      <figcaption className="mt-4 text-[17px] leading-snug text-ink">
        « {video.quote} »
        {video.siteUrl && (
          <a
            href={video.siteUrl}
            target="_blank"
            rel="noopener"
            className="mt-2 block text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
          >
            Voir son site
          </a>
        )}
      </figcaption>
    </figure>
  );
}

export function ClientVideos({ videos = clientVideos }: { videos?: ClientVideo[] }) {
  if (videos.length === 0) return null;

  return (
    <section id="clients" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Ils en parlent mieux que nous" />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.src} video={video} />
          ))}
        </div>
      </div>
    </section>
  );
}
