"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

export function RevealOnScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView({ threshold: 0.15 });

  return (
    <div
      ref={ref as (node: HTMLDivElement | null) => void}
      className={`transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}
