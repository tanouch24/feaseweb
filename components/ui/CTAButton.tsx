import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-sm px-6 py-3 text-[15px] font-semibold tracking-[-0.005em] transition-[background-color,border-color,color,transform] duration-200 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark focus-visible:outline-brand",
  secondary:
    "border border-ink/20 bg-transparent text-ink hover:border-ink focus-visible:outline-brand",
  // Sur fond vert nuit (accueil, appel final).
  brass:
    "bg-accent text-night hover:bg-accent-soft focus-visible:outline-accent-soft",
  outlineLight:
    "border border-white/30 bg-transparent text-white hover:border-white focus-visible:outline-white",
} as const;

export function CTAButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]}`}>
      {children}
    </Link>
  );
}
