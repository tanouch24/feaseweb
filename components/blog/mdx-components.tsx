import type { ReactNode } from "react";
import Link from "next/link";

export const mdxComponents = {
  h2: ({ children }: { children: ReactNode }) => (
    <h2 className="mt-10 font-serif text-2xl text-ink">{children}</h2>
  ),
  h3: ({ children }: { children: ReactNode }) => (
    <h3 className="mt-8 font-serif text-xl text-ink">{children}</h3>
  ),
  p: ({ children }: { children: ReactNode }) => (
    <p className="mt-4 leading-relaxed text-ink-soft">{children}</p>
  ),
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="mt-4 space-y-2 text-ink-soft">{children}</ul>
  ),
  li: ({ children }: { children: ReactNode }) => (
    <li className="flex gap-2">
      <span className="mt-1 text-accent">✓</span>
      <span>{children}</span>
    </li>
  ),
  a: ({ href, children }: { href?: string; children: ReactNode }) => (
    <Link
      href={href ?? "#"}
      className="text-brand-dark underline underline-offset-2 hover:text-brand"
    >
      {children}
    </Link>
  ),
  strong: ({ children }: { children: ReactNode }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
};
