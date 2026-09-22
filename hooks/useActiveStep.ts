"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks which step in a scroll-driven sequence is currently centered in
 * the viewport. Attach `setStepRef(index)` to each step's container; the
 * step whose element crosses the vertical center band becomes `active`.
 */
export function useActiveStep(count: number) {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = stepRefs.current.findIndex((el) => el === entry.target);
          if (index !== -1) setActive(index);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  const setStepRef = (index: number) => (el: HTMLDivElement | null) => {
    stepRefs.current[index] = el;
  };

  return { active, setStepRef };
}
