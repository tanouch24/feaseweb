"use client";

import { useCallback, useRef, useState } from "react";

export function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Valeurs primitives : un nouvel objet `options` à chaque rendu ne recrée pas l'observateur.
  const thresholdKey = JSON.stringify(options?.threshold ?? 0);
  const rootMargin = options?.rootMargin;

  const ref = useCallback(
    (node: Element | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        },
        { threshold: JSON.parse(thresholdKey) as number | number[], rootMargin }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [thresholdKey, rootMargin]
  );

  return { ref, inView };
}
