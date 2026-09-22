"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Subtle cursor-based parallax offset, desktop-only. Returns {x, y} in the
 * range roughly [-strength, strength] and a ref to attach to the container
 * the offset is measured against. No-op on touch devices or when the user
 * prefers reduced motion.
 */
export function useParallax(strength = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isCoarsePointer || prefersReducedMotion) return;

    function handleMove(event: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const relX = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const relY = (event.clientY - rect.top - rect.height / 2) / rect.height;
      setOffset({
        x: Math.max(-1, Math.min(1, relX)) * strength,
        y: Math.max(-1, Math.min(1, relY)) * strength,
      });
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [strength]);

  return { ref, offset };
}
