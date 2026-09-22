"use client";

import { useCallback, useState } from "react";

export function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);

  const ref = useCallback(
    (node: Element | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      }, options);

      observer.observe(node);
    },
    [options]
  );

  return { ref, inView };
}
