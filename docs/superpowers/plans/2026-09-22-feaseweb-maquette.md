# FeaseWeb Maquette — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Note on this run:** the user explicitly asked to continue autonomously
> through implementation, QA, and a final art-direction pass without
> stopping for approval between tasks. This plan is executed inline in the
> same session by the same agent that wrote it — task descriptions specify
> exact copy, file paths, props/interfaces, and test assertions for every
> task; JSX composition for purely presentational sections follows the
> content/structure given verbatim rather than being pre-written twice.

**Goal:** Build a fully navigable, visually exceptional Next.js front-end
mockup of the FeaseWeb website — homepage first, then examples/dashboard/
secondary routes — with no real backend, ending in a design pass and QA
sweep, committed locally only (no push).

**Architecture:** Next.js App Router + TypeScript, Tailwind CSS driven by
design tokens (CSS variables), small presentational component library under
`components/`, demo data under `lib/*.demo.ts`, no server data fetching.
Vitest + React Testing Library for the handful of components with real
logic (accordion, mobile nav, reveal hook, lead form) plus one repo-wide
content-guard test enforcing the pricing/proof rules.

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS,
`next/font/google` (Fraunces + Public Sans), Vitest, @testing-library/react,
jsdom.

**Spec:** `docs/superpowers/specs/2026-09-22-feaseweb-homepage-design.md`

## Global Constraints

- Priority order if anything must be traded off: (1) homepage `/` quality,
  (2) responsive (375–1440px, no horizontal overflow), (3) art direction
  quality, (4) `/exemples` + `/espace-client`, (5) secondary routes.
- Only pricing allowed anywhere: **0 € de frais de création ou de refonte**
  then **49 €/mois — tout compris (SEO inclus)**. Forbidden everywhere:
  `39 €`, `78 €`, `98 €`, "SEO +49€", any second pricing tier.
- No fake clients, testimonials, logos, stats, star ratings, or SEO results.
  Every demo site card/page must say "Exemple de site FeaseWeb".
- No real backend: no DB, no auth, no payment integration. Forms show local
  success state only.
- All visible copy in French, no lorem ipsum, no empty marketing buzzwords.
- Design tokens (colors/fonts/radius/spacing) live in one place
  (`app/globals.css` CSS variables + `tailwind.config.ts`), never hardcoded
  hex/px values inside components.
- No git commit until after the QA + art-direction pass (Task 20). No
  `git push` at any point in this plan.
- `prefers-reduced-motion: reduce` disables all reveal/hover motion.

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.eslintrc.json` (or `eslint.config.mjs` per Next's current scaffold), `postcss.config.mjs`, `tailwind.config.ts`, `.gitignore`
- Create: `app/layout.tsx`, `app/page.tsx` (temporary placeholder), `app/globals.css`
- Create: `vitest.config.ts`, `tests/setup.ts`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test` — every later task's "run tests" steps assume these exact script names.

- [ ] **Step 1: Scaffold the app**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
```
Answer prompts as needed; if the directory-not-empty prompt appears because of `docs/`, confirm to continue (it only scaffolds app files, doesn't touch `docs/`).

- [ ] **Step 2: Add test tooling**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Add `test` and `typecheck` scripts**

Edit `package.json` scripts block to:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Create Vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
```

Create `tests/setup.ts`:
```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Verify the toolchain runs**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: all three succeed on the freshly scaffolded app (default Next.js starter content is fine at this point — it gets replaced in later tasks).

- [ ] **Step 6: Commit is deferred**

Do not commit yet — per Global Constraints, the first commit happens after Task 20 (QA + art-direction pass). Continue to Task 2.

---

### Task 2: Design tokens (colors, fonts, radius, spacing)

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx` (font loading)

**Interfaces:**
- Produces: Tailwind color tokens `bg`, `bg-alt`, `ink`, `ink-soft`, `brand`, `brand-dark`, `accent`, `line`; font families `font-serif` (Fraunces) and `font-sans` (Public Sans); radius tokens `rounded-sm/md/lg` mapped to 8/14/24px. Every later component task uses these exact token names — never raw hex or px values.

- [ ] **Step 1: Define CSS variables**

In `app/globals.css`, replace the default Tailwind starter content with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #fbfaf7;
  --color-bg-alt: #f3f1ec;
  --color-ink: #14171a;
  --color-ink-soft: #4a5057;
  --color-brand: #1e4a43;
  --color-brand-dark: #12332e;
  --color-accent: #c98a3e;
  --color-line: #e4e1d8;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

body {
  background-color: var(--color-bg);
  color: var(--color-ink);
}
```

- [ ] **Step 2: Wire tokens into Tailwind**

In `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        "bg-alt": "var(--color-bg-alt)",
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        brand: "var(--color-brand)",
        "brand-dark": "var(--color-brand-dark)",
        accent: "var(--color-accent)",
        line: "var(--color-line)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-public-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "24px",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Load fonts via `next/font/google`**

In `app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "500", "600"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FeaseWeb — Votre site internet, sans avoir à vous en occuper",
  description:
    "FeaseWeb crée ou refait votre site, l'héberge, le maintient et travaille son référencement. 0 € de frais de création, puis 49 €/mois tout compris.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds, fonts resolve, no Tailwind errors.

- [ ] **Step 5: No commit** (per Global Constraints — continue to Task 3)

---

### Task 3: `useInView` hook + `RevealOnScroll` wrapper

**Files:**
- Create: `hooks/useInView.ts`
- Create: `components/ui/RevealOnScroll.tsx`
- Test: `tests/useInView.test.tsx`

**Interfaces:**
- Produces: `useInView(options?: IntersectionObserverInit): { ref: RefCallback<Element>, inView: boolean }` and `<RevealOnScroll className?: string>{children}</RevealOnScroll>` — every homepage section task wraps its root element in `RevealOnScroll`.

- [ ] **Step 1: Write the failing test**

Create `tests/useInView.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

describe("RevealOnScroll", () => {
  it("marks content as visible once it intersects", () => {
    render(
      <RevealOnScroll>
        <p>Contenu révélé</p>
      </RevealOnScroll>
    );
    expect(screen.getByText("Contenu révélé")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useInView`
Expected: FAIL — `@/components/ui/RevealOnScroll` does not exist yet.

- [ ] **Step 3: Implement the hook**

Create `hooks/useInView.ts`:
```typescript
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const elementRef = useRef<Element | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      elementRef.current = node;
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

  useEffect(() => {
    setInView((current) => current);
  }, []);

  return { ref, inView };
}
```

- [ ] **Step 4: Implement `RevealOnScroll`**

Create `components/ui/RevealOnScroll.tsx`:
```tsx
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- useInView`
Expected: PASS.

- [ ] **Step 6: No commit** (continue to Task 4)

---

### Task 4: Shared UI atoms — `Logo` and `CTAButton`

**Files:**
- Create: `components/layout/Logo.tsx`
- Create: `components/ui/CTAButton.tsx`
- Test: `tests/ui-atoms.test.tsx`

**Interfaces:**
- Produces: `<Logo size?: "sm" | "md" | "lg">` and `<CTAButton href: string, variant?: "primary" | "secondary", children: ReactNode>` — every header/hero/CTA task in this plan uses exactly these props.

- [ ] **Step 1: Write the failing test**

Create `tests/ui-atoms.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/layout/Logo";
import { CTAButton } from "@/components/ui/CTAButton";

describe("Logo", () => {
  it("renders the FeaseWeb wordmark", () => {
    render(<Logo />);
    expect(screen.getByText("Fease")).toBeInTheDocument();
    expect(screen.getByText("Web")).toBeInTheDocument();
  });
});

describe("CTAButton", () => {
  it("renders a link with the given label and href", () => {
    render(<CTAButton href="/creer-mon-site">Créer mon site</CTAButton>);
    const link = screen.getByRole("link", { name: "Créer mon site" });
    expect(link).toHaveAttribute("href", "/creer-mon-site");
  });

  it("applies the secondary variant styles", () => {
    render(
      <CTAButton href="/refaire-mon-site" variant="secondary">
        Refaire mon site
      </CTAButton>
    );
    const link = screen.getByRole("link", { name: "Refaire mon site" });
    expect(link.className).toContain("border");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ui-atoms`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `Logo`**

Create `components/layout/Logo.tsx`:
```tsx
import Link from "next/link";

const sizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
} as const;

export function Logo({ size = "md" }: { size?: keyof typeof sizeMap }) {
  return (
    <Link
      href="/"
      className={`font-serif font-medium ${sizeMap[size]} tracking-tight`}
      aria-label="FeaseWeb — retour à l'accueil"
    >
      <span className="text-ink">Fease</span>
      <span className="text-brand">Web</span>
    </Link>
  );
}
```

- [ ] **Step 4: Implement `CTAButton`**

Create `components/ui/CTAButton.tsx`:
```tsx
import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex items-center justify-center rounded-sm px-6 py-3 text-[15px] font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "border border-line text-ink hover:border-ink bg-transparent",
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- ui-atoms`
Expected: PASS.

- [ ] **Step 6: No commit** (continue to Task 5)

---

### Task 5: `Header` with mobile nav

**Files:**
- Create: `components/layout/Header.tsx`
- Test: `tests/header.test.tsx`

**Interfaces:**
- Consumes: `Logo`, `CTAButton` from Task 4.
- Produces: `<Header />` (no props) rendered once in `app/layout.tsx` (wired in Task 12).

Nav links (exact labels/hrefs): "Comment ça marche" → `/#comment-ca-marche`, "Tout compris" → `/#tout-compris`, "Exemples" → `/#exemples`, "Tarif" → `/#tarif`, "FAQ" → `/#faq`. Secondary link "Connexion" → `/connexion`. Primary CTA "Créer mon site" → `/creer-mon-site`.

- [ ] **Step 1: Write the failing test**

Create `tests/header.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/Header";

describe("Header", () => {
  it("shows the primary CTA and nav links on desktop", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Créer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
    expect(screen.getAllByRole("link", { name: "FAQ" })[0]).toHaveAttribute(
      "href",
      "/#faq"
    );
  });

  it("toggles the mobile menu on button click", async () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: /menu/i });
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- header`
Expected: FAIL — `Header` not found.

- [ ] **Step 3: Implement `Header`**

Create `components/layout/Header.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { CTAButton } from "@/components/ui/CTAButton";

const navLinks = [
  { label: "Comment ça marche", href: "/#comment-ca-marche" },
  { label: "Tout compris", href: "/#tout-compris" },
  { label: "Exemples", href: "/#exemples" },
  { label: "Tarif", href: "/#tarif" },
  { label: "FAQ", href: "/#faq" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? "bg-bg/95 backdrop-blur-sm border-line"
          : "bg-bg border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <a href="/connexion" className="text-sm text-ink-soft hover:text-ink">
            Connexion
          </a>
          <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
        </div>
        <button
          type="button"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 bg-ink" />
            <span className="h-0.5 w-5 bg-ink" />
          </div>
        </button>
      </div>
      {mobileOpen && (
        <nav
          data-testid="mobile-nav"
          className="flex flex-col gap-4 border-t border-line bg-bg px-6 py-6 md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-base text-ink"
            >
              {link.label}
            </a>
          ))}
          <a href="/connexion" className="text-base text-ink-soft">
            Connexion
          </a>
          <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- header`
Expected: PASS.

- [ ] **Step 5: No commit** (continue to Task 6)

---

### Task 6: `Footer`

**Files:**
- Create: `components/layout/Footer.tsx`
- Test: `tests/footer.test.tsx`

**Interfaces:**
- Consumes: `Logo` from Task 4.
- Produces: `<Footer />`, rendered once in `app/layout.tsx` (Task 12).

Content: nav links "Offre" (`/#tarif`), "Exemples" (`/#exemples`), "FAQ" (`/#faq`), "Contact" (`/creer-mon-site`), "Connexion" (`/connexion`); legal links "Mentions légales" (`/mentions-legales`), "Confidentialité" (`/confidentialite`), "CGV" (`/cgv`), "Cookies" (`/cookies`); a line noting company legal identifiers are pending: `[TODO: raison sociale, SIREN, adresse, capital social à compléter avant mise en production]`.

- [ ] **Step 1: Write the failing test**

Create `tests/footer.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("links to all legal pages", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Mentions légales" })).toHaveAttribute(
      "href",
      "/mentions-legales"
    );
    expect(screen.getByRole("link", { name: "CGV" })).toHaveAttribute(
      "href",
      "/cgv"
    );
  });

  it("marks missing legal info as TODO instead of inventing it", () => {
    render(<Footer />);
    expect(screen.getByText(/TODO/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- footer`
Expected: FAIL — `Footer` not found.

- [ ] **Step 3: Implement `Footer`**

Create `components/layout/Footer.tsx`:
```tsx
import { Logo } from "@/components/layout/Logo";

const navLinks = [
  { label: "Offre", href: "/#tarif" },
  { label: "Exemples", href: "/#exemples" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/creer-mon-site" },
  { label: "Connexion", href: "/connexion" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGV", href: "/cgv" },
  { label: "Cookies", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-alt">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm text-ink-soft">
              Votre site internet, sans avoir à vous en occuper.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-ink-soft hover:text-ink">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-ink-soft md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-ink">
                {link.label}
              </a>
            ))}
          </div>
          <p>
            © {new Date().getFullYear()} FeaseWeb — [TODO: raison sociale, SIREN,
            adresse, capital social à compléter avant mise en production]
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- footer`
Expected: PASS.

- [ ] **Step 5: No commit** (continue to Task 7)

---

### Task 7: Mockup primitives — `SiteMockup`, `PhoneMockup`, `StatusPill`

**Files:**
- Create: `components/mockups/SiteMockup.tsx`
- Create: `components/mockups/PhoneMockup.tsx`
- Create: `components/ui/StatusPill.tsx`
- Test: `tests/mockups.test.tsx`

**Interfaces:**
- Produces: `<SiteMockup businessName: string, tagline: string>` (renders a fake desktop browser chrome + a mini artisan site layout in pure CSS/HTML), `<PhoneMockup businessName: string>` (same content in a phone frame), `<StatusPill label: string, tone?: "positive" | "neutral">`. Used by Hero (Task 8), DashboardPreview (Task 15), and DemoSiteCard (Task 16).

- [ ] **Step 1: Write the failing test**

Create `tests/mockups.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { StatusPill } from "@/components/ui/StatusPill";

describe("mockup primitives", () => {
  it("renders the business name in the desktop mockup", () => {
    render(<SiteMockup businessName="Dupont Plomberie" tagline="Dépannage 7j/7" />);
    expect(screen.getByText("Dupont Plomberie")).toBeInTheDocument();
  });

  it("renders the business name in the phone mockup", () => {
    render(<PhoneMockup businessName="Dupont Plomberie" />);
    expect(screen.getByText("Dupont Plomberie")).toBeInTheDocument();
  });

  it("renders a status pill label", () => {
    render(<StatusPill label="Site en ligne" tone="positive" />);
    expect(screen.getByText("Site en ligne")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- mockups`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `StatusPill`**

Create `components/ui/StatusPill.tsx`:
```tsx
export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "positive" | "neutral";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium ${
        tone === "positive"
          ? "bg-brand/10 text-brand-dark"
          : "bg-bg-alt text-ink-soft"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "positive" ? "bg-brand" : "bg-ink-soft"
        }`}
      />
      {label}
    </span>
  );
}
```

- [ ] **Step 4: Implement `SiteMockup`**

Create `components/mockups/SiteMockup.tsx` — a fake desktop browser chrome (three dots, URL bar showing `businessname.feaseweb.fr`) containing a miniature one-page artisan site: a header bar, a headline with `businessName`, `tagline` text, and two small rectangular "photo" placeholders (CSS gradient blocks, not real images):
```tsx
export function SiteMockup({
  businessName,
  tagline,
}: {
  businessName: string;
  tagline: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-line bg-bg-alt px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <div className="ml-2 flex-1 truncate rounded-sm bg-white px-3 py-1 text-[11px] text-ink-soft">
          {businessName.toLowerCase().replace(/\s+/g, "")}.feaseweb.fr
        </div>
      </div>
      <div className="px-6 py-8">
        <p className="font-serif text-xl text-ink">{businessName}</p>
        <p className="mt-1 text-sm text-ink-soft">{tagline}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="h-20 rounded-sm bg-gradient-to-br from-brand/15 to-bg-alt" />
          <div className="h-20 rounded-sm bg-gradient-to-br from-accent/15 to-bg-alt" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement `PhoneMockup`**

Create `components/mockups/PhoneMockup.tsx` — a phone-frame div (rounded-lg border, thick top/bottom bezel) containing a stacked mobile version of the same content:
```tsx
export function PhoneMockup({ businessName }: { businessName: string }) {
  return (
    <div className="mx-auto w-40 rounded-lg border border-line bg-white p-2 shadow-sm">
      <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-line" />
      <div className="rounded-md bg-bg-alt px-3 py-4">
        <p className="font-serif text-sm text-ink">{businessName}</p>
        <div className="mt-3 h-14 rounded-sm bg-gradient-to-br from-brand/15 to-white" />
        <div className="mt-2 h-3 w-2/3 rounded-full bg-line" />
        <div className="mt-1.5 h-3 w-1/2 rounded-full bg-line" />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- mockups`
Expected: PASS.

- [ ] **Step 7: No commit** (continue to Task 8)

---

### Task 8: `PriceBadge`

**Files:**
- Create: `components/ui/PriceBadge.tsx`
- Test: `tests/price-badge.test.tsx`

**Interfaces:**
- Produces: `<PriceBadge variant?: "hero" | "compact">` — a self-contained component always rendering exactly "0 € de frais de création" and "49 €/mois — tout compris". Used by Hero (Task 9) and OfferSection (Task 13). No props for the amounts — they are hardcoded here specifically so there is exactly one place in the codebase that can ever state the price.

- [ ] **Step 1: Write the failing test**

Create `tests/price-badge.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceBadge } from "@/components/ui/PriceBadge";

describe("PriceBadge", () => {
  it("always shows the 0€ then 49€/mois pricing, nothing else", () => {
    render(<PriceBadge />);
    expect(screen.getByText(/0\s?€/)).toBeInTheDocument();
    expect(screen.getByText(/49\s?€\s?\/\s?mois/)).toBeInTheDocument();
    expect(screen.queryByText(/39|78|98/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- price-badge`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `PriceBadge`**

Create `components/ui/PriceBadge.tsx`:
```tsx
export function PriceBadge({
  variant = "hero",
}: {
  variant?: "hero" | "compact";
}) {
  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-3 rounded-md border border-line bg-white px-4 py-2.5">
        <span className="text-sm text-ink-soft line-through-none">
          0 € de création
        </span>
        <span className="h-4 w-px bg-line" />
        <span className="font-serif text-lg text-brand-dark">
          49 €<span className="text-sm text-ink-soft">/mois</span>
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col gap-3 rounded-md border border-line bg-white px-6 py-5 sm:flex-row sm:items-center sm:gap-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-soft">
          Création ou refonte
        </p>
        <p className="font-serif text-2xl text-ink">0 €</p>
      </div>
      <span className="hidden h-10 w-px bg-line sm:block" />
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-soft">
          Ensuite, tout compris
        </p>
        <p className="font-serif text-2xl text-brand-dark">
          49 €<span className="text-base text-ink-soft"> / mois</span>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- price-badge`
Expected: PASS.

- [ ] **Step 5: No commit** (continue to Task 9)

---

### Task 9: `Hero` section

**Files:**
- Create: `components/home/Hero.tsx`
- Test: `tests/hero.test.tsx`

**Interfaces:**
- Consumes: `CTAButton` (Task 4), `PriceBadge` (Task 8), `SiteMockup` + `PhoneMockup` + `StatusPill` (Task 7).
- Produces: `<Hero />`, no props, mounted first in `app/page.tsx` (Task 12).

Exact copy: eyebrow `"LE SITE WEB GÉRÉ POUR LES PETITES ENTREPRISES"`; H1 two lines `"Votre site internet."` / `"Sans avoir à vous en occuper."`; subtitle `"FeaseWeb crée ou refait votre site, l'héberge, le maintient et travaille son référencement. Vous vous concentrez sur votre métier."`; primary CTA `"Créer mon site"` → `/creer-mon-site`; secondary CTA `"Refaire mon site"` → `/refaire-mon-site`; reassurance line `"Site • Hébergement • Maintenance • SEO • Modifications"`. Visual side: `SiteMockup` with `businessName="Dupont Plomberie"` `tagline="Dépannage 7j/7 dans tout le secteur"`, a `PhoneMockup` overlapping it, and three `StatusPill`s: "Site en ligne" (positive), "SEO suivi" (neutral), "Maintenance active" (neutral).

- [ ] **Step 1: Write the failing test**

Create `tests/hero.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/home/Hero";

describe("Hero", () => {
  it("shows both CTAs with correct destinations", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Créer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
    expect(screen.getByRole("link", { name: "Refaire mon site" })).toHaveAttribute(
      "href",
      "/refaire-mon-site"
    );
  });

  it("shows the pricing and the product status pills", () => {
    render(<Hero />);
    expect(screen.getByText(/49\s?€\s?\/\s?mois/)).toBeInTheDocument();
    expect(screen.getByText("Site en ligne")).toBeInTheDocument();
    expect(screen.getByText("SEO suivi")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- hero`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `Hero`**

Create `components/home/Hero.tsx`:
```tsx
import { CTAButton } from "@/components/ui/CTAButton";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { StatusPill } from "@/components/ui/StatusPill";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg pt-14 pb-20 md:pt-20 md:pb-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:items-center md:gap-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
            Le site web géré pour les petites entreprises
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.08] text-ink md:text-[3.4rem]">
            Votre site internet.
            <br />
            Sans avoir à vous en occuper.
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-soft">
            FeaseWeb crée ou refait votre site, l&apos;héberge, le maintient et
            travaille son référencement. Vous vous concentrez sur votre métier.
          </p>
          <div className="mt-8">
            <PriceBadge />
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
            <CTAButton href="/refaire-mon-site" variant="secondary">
              Refaire mon site
            </CTAButton>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Site • Hébergement • Maintenance • SEO • Modifications
          </p>
        </div>
        <div className="relative">
          <SiteMockup
            businessName="Dupont Plomberie"
            tagline="Dépannage 7j/7 dans tout le secteur"
          />
          <div className="absolute -bottom-8 -left-6 hidden sm:block">
            <PhoneMockup businessName="Dupont Plomberie" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 sm:mt-10 sm:ml-32">
            <StatusPill label="Site en ligne" tone="positive" />
            <StatusPill label="SEO suivi" />
            <StatusPill label="Maintenance active" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- hero`
Expected: PASS.

- [ ] **Step 5: No commit** (continue to Task 10)

---

### Task 10: `SectionHeading` + `BreakSection` (rupture éditoriale)

**Files:**
- Create: `components/ui/SectionHeading.tsx`
- Create: `components/home/BreakSection.tsx`
- Test: `tests/break-section.test.tsx`

**Interfaces:**
- Produces: `<SectionHeading eyebrow?: string, title: string, id?: string>` (used by most sections from here on) and `<BreakSection />`.

Exact copy for `BreakSection`: title `"Votre métier n'est pas de gérer un site internet."`, body `"Et ça tombe bien : c'est le nôtre."` plus one short supporting sentence: `"Pas de thème à choisir, pas d'hébergeur à surveiller, pas de mise à jour à faire soi-même. Vous travaillez. Nous gérons le web."`

- [ ] **Step 1: Write the failing test**

Create `tests/break-section.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreakSection } from "@/components/home/BreakSection";

describe("BreakSection", () => {
  it("shows the core positioning statement", () => {
    render(<BreakSection />);
    expect(
      screen.getByText("Votre métier n'est pas de gérer un site internet.")
    ).toBeInTheDocument();
    expect(screen.getByText("Et ça tombe bien : c'est le nôtre.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- break-section`
Expected: FAIL.

- [ ] **Step 3: Implement `SectionHeading`**

Create `components/ui/SectionHeading.tsx`:
```tsx
export function SectionHeading({
  eyebrow,
  title,
  id,
}: {
  eyebrow?: string;
  title: string;
  id?: string;
}) {
  return (
    <div id={id} className="max-w-2xl">
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-[2.5rem]">
        {title}
      </h2>
    </div>
  );
}
```

- [ ] **Step 4: Implement `BreakSection`**

Create `components/home/BreakSection.tsx`:
```tsx
export function BreakSection() {
  return (
    <section className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-serif text-3xl leading-tight text-ink md:text-[2.75rem]">
          Votre métier n&apos;est pas de gérer un site internet.
        </p>
        <p className="mt-3 font-serif text-2xl text-brand-dark md:text-3xl">
          Et ça tombe bien : c&apos;est le nôtre.
        </p>
        <p className="mx-auto mt-6 max-w-xl text-base text-ink-soft">
          Pas de thème à choisir, pas d&apos;hébergeur à surveiller, pas de
          mise à jour à faire soi-même. Vous travaillez. Nous gérons le web.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- break-section`
Expected: PASS.

- [ ] **Step 6: No commit** (continue to Task 11)

---

### Task 11: `TwoPathsCards` + `ProcessSteps`

**Files:**
- Create: `components/home/TwoPathsCards.tsx`
- Create: `components/home/ProcessSteps.tsx`
- Test: `tests/paths-and-process.test.tsx`

**Interfaces:**
- Consumes: `CTAButton` (Task 4), `SectionHeading` (Task 10).
- Produces: `<TwoPathsCards />`, `<ProcessSteps />`.

`TwoPathsCards` copy — card A: title `"Je n'ai pas de site"`, line `"On part de zéro."`, body `"FeaseWeb récupère les informations de votre entreprise et prépare votre site."`, CTA `"Créer mon site"` → `/creer-mon-site`. Card B: title `"J'ai déjà un site"`, line `"On peut faire beaucoup mieux."`, body `"Donnez-nous votre adresse actuelle, FeaseWeb prépare sa refonte."`, CTA `"Refaire mon site"` → `/refaire-mon-site`.

`ProcessSteps` copy, id `comment-ca-marche`, heading title `"Comment ça marche"`: 01 `"Parlez-nous de votre entreprise"` / `"Quelques questions simples, cinq minutes suffisent."`; 02 `"FeaseWeb prépare votre site"` / `"Design, contenu, mobile, structure et référencement."`; 03 `"Vous validez"` / `"Vous voyez le résultat avant toute mise en ligne."`; 04 `"On s'occupe du reste"` / `"Mise en ligne, hébergement, maintenance, modifications et suivi SEO."` — step 04 gets a visually distinct treatment (brand-colored card) since the spec calls it the differentiator.

- [ ] **Step 1: Write the failing test**

Create `tests/paths-and-process.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TwoPathsCards } from "@/components/home/TwoPathsCards";
import { ProcessSteps } from "@/components/home/ProcessSteps";

describe("TwoPathsCards", () => {
  it("links each path to its own funnel page", () => {
    render(<TwoPathsCards />);
    expect(screen.getByRole("link", { name: "Créer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
    expect(screen.getByRole("link", { name: "Refaire mon site" })).toHaveAttribute(
      "href",
      "/refaire-mon-site"
    );
  });
});

describe("ProcessSteps", () => {
  it("lists exactly four steps ending with ongoing management", () => {
    render(<ProcessSteps />);
    expect(screen.getByText("Parlez-nous de votre entreprise")).toBeInTheDocument();
    expect(screen.getByText("On s'occupe du reste")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- paths-and-process`
Expected: FAIL.

- [ ] **Step 3: Implement `TwoPathsCards`**

Create `components/home/TwoPathsCards.tsx`:
```tsx
import { CTAButton } from "@/components/ui/CTAButton";

export function TwoPathsCards() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-8">
          <p className="font-serif text-2xl text-ink">Je n&apos;ai pas de site</p>
          <p className="mt-2 text-brand-dark">On part de zéro.</p>
          <p className="mt-4 text-ink-soft">
            FeaseWeb récupère les informations de votre entreprise et prépare
            votre site.
          </p>
          <div className="mt-6">
            <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-8">
          <p className="font-serif text-2xl text-ink">J&apos;ai déjà un site</p>
          <p className="mt-2 text-brand-dark">On peut faire beaucoup mieux.</p>
          <p className="mt-4 text-ink-soft">
            Donnez-nous votre adresse actuelle, FeaseWeb prépare sa refonte.
          </p>
          <div className="mt-6">
            <CTAButton href="/refaire-mon-site" variant="secondary">
              Refaire mon site
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `ProcessSteps`**

Create `components/home/ProcessSteps.tsx`:
```tsx
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Parlez-nous de votre entreprise",
    body: "Quelques questions simples, cinq minutes suffisent.",
  },
  {
    number: "02",
    title: "FeaseWeb prépare votre site",
    body: "Design, contenu, mobile, structure et référencement.",
  },
  {
    number: "03",
    title: "Vous validez",
    body: "Vous voyez le résultat avant toute mise en ligne.",
  },
  {
    number: "04",
    title: "On s'occupe du reste",
    body: "Mise en ligne, hébergement, maintenance, modifications et suivi SEO.",
  },
];

export function ProcessSteps() {
  return (
    <section id="comment-ca-marche" className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Comment ça marche" />
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`rounded-lg p-6 ${
                step.number === "04"
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-ink"
              }`}
            >
              <p
                className={`font-serif text-3xl ${
                  step.number === "04" ? "text-white/70" : "text-line"
                }`}
              >
                {step.number}
              </p>
              <p className="mt-3 font-medium">{step.title}</p>
              <p
                className={`mt-2 text-sm ${
                  step.number === "04" ? "text-white/80" : "text-ink-soft"
                }`}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- paths-and-process`
Expected: PASS.

- [ ] **Step 6: No commit** (continue to Task 12)

---

### Task 12: Assemble the homepage skeleton

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `Header` (5), `Footer` (6), `Hero` (9), `BreakSection` (10), `TwoPathsCards` + `ProcessSteps` (11).
- Produces: a working, navigable homepage with the first five sections in place — later tasks append sections 6–15 here rather than creating new page files.

- [ ] **Step 1: Wire `Header`/`Footer` into the root layout**

In `app/layout.tsx`, import `Header` and `Footer` and render `<Header />{children}<Footer />` inside `<body>`.

- [ ] **Step 2: Build `app/page.tsx` with the sections built so far**

Every section below the Hero is wrapped in `RevealOnScroll` (Task 3) — the
Hero itself is not, since it's visible on load and should never fade in.
Every later "append to homepage" step in Tasks 13–18 follows this same
pattern: wrap the new section in `<RevealOnScroll>` before adding it.

```tsx
import { Hero } from "@/components/home/Hero";
import { BreakSection } from "@/components/home/BreakSection";
import { TwoPathsCards } from "@/components/home/TwoPathsCards";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <RevealOnScroll>
        <BreakSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <TwoPathsCards />
      </RevealOnScroll>
      <RevealOnScroll>
        <ProcessSteps />
      </RevealOnScroll>
    </main>
  );
}
```

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open `http://localhost:3000`, confirm the page renders top to bottom without errors, header sticky behavior works, mobile nav toggles at narrow width (resize browser to ~390px).

- [ ] **Step 4: Run full test suite**

Run: `npm test`
Expected: all tests from Tasks 1–11 PASS.

- [ ] **Step 5: No commit** (continue to Task 13)

---

### Task 13: `OfferSection` (49 €/mois)

**Files:**
- Create: `components/home/OfferSection.tsx`
- Test: `tests/offer-section.test.tsx`
- Modify: `app/page.tsx` (append section)

**Interfaces:**
- Consumes: `SectionHeading` (10), `PriceBadge` (8), `CTAButton` (4).
- Produces: `<OfferSection />`, appended to `app/page.tsx` after `ProcessSteps`.

Section id `tarif`. Title `"49 € / mois. Et on s'occupe du reste."`. Included list (exact items, one offer only): "Site professionnel", "Jusqu'à 5 pages", "Version mobile", "Hébergement", "Sécurité et SSL", "Maintenance", "Sauvegardes", "Formulaire de devis/contact", "Petites modifications", "Référencement SEO", "Suivi de la visibilité Google", "Espace client FeaseWeb". CTA `"Démarrer mon site"` → `/creer-mon-site`.

- [ ] **Step 1: Write the failing test**

Create `tests/offer-section.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfferSection } from "@/components/home/OfferSection";

describe("OfferSection", () => {
  it("lists SEO as included, with no separate SEO price", () => {
    render(<OfferSection />);
    expect(screen.getByText("Référencement SEO")).toBeInTheDocument();
    expect(screen.queryByText(/SEO \+49/)).not.toBeInTheDocument();
  });

  it("has exactly one call to action to start", () => {
    render(<OfferSection />);
    expect(screen.getByRole("link", { name: "Démarrer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- offer-section`
Expected: FAIL.

- [ ] **Step 3: Implement `OfferSection`**

Create `components/home/OfferSection.tsx`:
```tsx
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { CTAButton } from "@/components/ui/CTAButton";

const included = [
  "Site professionnel",
  "Jusqu'à 5 pages",
  "Version mobile",
  "Hébergement",
  "Sécurité et SSL",
  "Maintenance",
  "Sauvegardes",
  "Formulaire de devis/contact",
  "Petites modifications",
  "Référencement SEO",
  "Suivi de la visibilité Google",
  "Espace client FeaseWeb",
];

export function OfferSection() {
  return (
    <section id="tarif" className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <SectionHeading title="49 € / mois. Et on s'occupe du reste." />
        <div className="mt-8 flex justify-center">
          <PriceBadge />
        </div>
        <ul className="mx-auto mt-10 grid gap-3 text-left sm:grid-cols-2">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2 text-ink-soft">
              <span className="mt-1 text-accent">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <CTAButton href="/creer-mon-site">Démarrer mon site</CTAButton>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- offer-section`
Expected: PASS.

- [ ] **Step 5: Append to homepage**

In `app/page.tsx`, import `OfferSection` and render it wrapped in
`<RevealOnScroll>` after the `ProcessSteps` block.

- [ ] **Step 6: No commit** (continue to Task 14)

---

### Task 14: `ComparisonBlock` ("Vous ne construisez rien")

**Files:**
- Create: `components/home/ComparisonBlock.tsx`
- Test: `tests/comparison-block.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `SectionHeading` (10).
- Produces: `<ComparisonBlock />`, appended after `OfferSection`.

Title `"Vous ne construisez rien. FeaseWeb le fait pour vous."`. Left column "Avec un constructeur classique": "Choisir un thème", "Construire les pages", "Comprendre les réglages", "Maintenir le site", "Gérer le SEO", "Résoudre les problèmes". Right column "Avec FeaseWeb": single emphasized statement `"Vous nous parlez de votre entreprise."` then `"On s'occupe du reste."` — no competitor names, no unsourced numbers.

- [ ] **Step 1: Write the failing test**

Create `tests/comparison-block.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComparisonBlock } from "@/components/home/ComparisonBlock";

describe("ComparisonBlock", () => {
  it("contrasts DIY effort with the FeaseWeb promise, without naming competitors", () => {
    render(<ComparisonBlock />);
    expect(screen.getByText("Choisir un thème")).toBeInTheDocument();
    expect(screen.getByText("Vous nous parlez de votre entreprise.")).toBeInTheDocument();
    expect(screen.queryByText(/wordpress|wix|shopify/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- comparison-block`
Expected: FAIL.

- [ ] **Step 3: Implement `ComparisonBlock`**

Create `components/home/ComparisonBlock.tsx`:
```tsx
import { SectionHeading } from "@/components/ui/SectionHeading";

const diyTasks = [
  "Choisir un thème",
  "Construire les pages",
  "Comprendre les réglages",
  "Maintenir le site",
  "Gérer le SEO",
  "Résoudre les problèmes",
];

export function ComparisonBlock() {
  return (
    <section id="tout-compris" className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading title="Vous ne construisez rien. FeaseWeb le fait pour vous." />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-8">
            <p className="text-sm font-medium uppercase tracking-wide text-ink-soft">
              Avec un constructeur classique
            </p>
            <ul className="mt-5 space-y-3 text-ink-soft">
              {diyTasks.map((task) => (
                <li key={task}>— {task}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-brand p-8 text-white">
            <p className="text-sm font-medium uppercase tracking-wide text-white/70">
              Avec FeaseWeb
            </p>
            <p className="mt-5 font-serif text-2xl">
              Vous nous parlez de votre entreprise.
            </p>
            <p className="mt-2 font-serif text-2xl text-white/90">
              On s&apos;occupe du reste.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- comparison-block`
Expected: PASS.

- [ ] **Step 5: Append to homepage**, wrapped in `<RevealOnScroll>` after
`OfferSection`, then **no commit** (continue to Task 15).

---

### Task 15: `DashboardPreview` + `ClientSpaceSection`

**Files:**
- Create: `components/mockups/DashboardPreview.tsx`
- Create: `components/home/ClientSpaceSection.tsx`
- Test: `tests/dashboard-preview.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `StatusPill` (7), `SectionHeading` (10).
- Produces: `<DashboardPreview compact?: boolean>` (compact=true for the homepage teaser, compact=false for the full `/espace-client` page in Task 18) and `<ClientSpaceSection />`.

`DashboardPreview` content: sidebar items "Accueil", "Mon site", "Mes demandes", "Mon référencement", "Factures & abonnement", "Support"; main panel shows "Bonjour Dupont Plomberie", a "Mon site" card with `StatusPill label="En ligne" tone="positive"`, a "Visibilité Google" card with a small inline SVG bar chart (static demo values, no library), a "Mes demandes" card showing "1 modification en cours", an "Abonnement" card showing "49 €/mois — Actif". `ClientSpaceSection` wraps it with id `espace-client`, title `"Votre site, toujours sous contrôle."`.

- [ ] **Step 1: Write the failing test**

Create `tests/dashboard-preview.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPreview } from "@/components/mockups/DashboardPreview";
import { ClientSpaceSection } from "@/components/home/ClientSpaceSection";

describe("DashboardPreview", () => {
  it("shows the site status, requests, and subscription state", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("En ligne")).toBeInTheDocument();
    expect(screen.getByText("1 modification en cours")).toBeInTheDocument();
    expect(screen.getByText(/49\s?€\s?\/\s?mois — Actif/)).toBeInTheDocument();
  });
});

describe("ClientSpaceSection", () => {
  it("renders the client-space headline", () => {
    render(<ClientSpaceSection />);
    expect(screen.getByText("Votre site, toujours sous contrôle.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- dashboard-preview`
Expected: FAIL.

- [ ] **Step 3: Implement `DashboardPreview`**

Create `components/mockups/DashboardPreview.tsx`:
```tsx
import { StatusPill } from "@/components/ui/StatusPill";

const sidebarItems = [
  "Accueil",
  "Mon site",
  "Mes demandes",
  "Mon référencement",
  "Factures & abonnement",
  "Support",
];

const chartBars = [40, 55, 48, 62, 70, 66, 78];

export function DashboardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
      <div className="flex">
        <aside className="hidden w-44 flex-col gap-1 border-r border-line bg-bg-alt p-4 sm:flex">
          {sidebarItems.map((item, index) => (
            <span
              key={item}
              className={`rounded-sm px-3 py-2 text-sm ${
                index === 0 ? "bg-white text-ink" : "text-ink-soft"
              }`}
            >
              {item}
            </span>
          ))}
        </aside>
        <div className="flex-1 p-6">
          <p className="text-sm text-ink-soft">Bonjour</p>
          <p className="font-serif text-xl text-ink">Dupont Plomberie</p>
          <div className={`mt-6 grid gap-4 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
            <div className="rounded-md border border-line p-4">
              <p className="text-xs text-ink-soft">Mon site</p>
              <div className="mt-2">
                <StatusPill label="En ligne" tone="positive" />
              </div>
            </div>
            <div className="rounded-md border border-line p-4">
              <p className="text-xs text-ink-soft">Visibilité Google</p>
              <svg viewBox="0 0 70 32" className="mt-2 h-8 w-full" aria-hidden="true">
                {chartBars.map((value, index) => (
                  <rect
                    key={index}
                    x={index * 10}
                    y={32 - value * 0.32}
                    width={6}
                    height={value * 0.32}
                    className="fill-brand/70"
                  />
                ))}
              </svg>
            </div>
            <div className="rounded-md border border-line p-4">
              <p className="text-xs text-ink-soft">Mes demandes</p>
              <p className="mt-2 text-sm text-ink">1 modification en cours</p>
            </div>
            <div className="rounded-md border border-line p-4">
              <p className="text-xs text-ink-soft">Abonnement</p>
              <p className="mt-2 text-sm text-ink">49 €/mois — Actif</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `ClientSpaceSection`**

Create `components/home/ClientSpaceSection.tsx`:
```tsx
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DashboardPreview } from "@/components/mockups/DashboardPreview";

export function ClientSpaceSection() {
  return (
    <section id="espace-client" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading title="Votre site, toujours sous contrôle." />
        <p className="mt-4 max-w-xl text-ink-soft">
          Un espace simple pour voir l&apos;état de votre site, suivre votre
          référencement et demander une modification — sans jamais toucher au
          code.
        </p>
        <div className="mt-10">
          <DashboardPreview compact />
        </div>
        <p className="mt-4 text-xs text-ink-soft">Aperçu de l&apos;espace client FeaseWeb.</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test, append to homepage, no commit**

Run: `npm test -- dashboard-preview` → PASS. Append `<ClientSpaceSection />`,
wrapped in `<RevealOnScroll>`, to `app/page.tsx` after `ComparisonBlock`.
Continue to Task 16.

---

### Task 16: Demo sites data + `DemoSiteCard` + `ExamplesSection`

**Files:**
- Create: `lib/demo-sites.demo.ts`
- Create: `components/home/DemoSiteCard.tsx`
- Create: `components/home/ExamplesSection.tsx`
- Test: `tests/examples-section.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `SiteMockup` (7), `SectionHeading` (10).
- Produces: `DemoSite` type and `demoSites: DemoSite[]` from `lib/demo-sites.demo.ts` (also consumed by Task 19's `/exemples` routes), `<DemoSiteCard site: DemoSite>`, `<ExamplesSection />`.

- [ ] **Step 1: Write the failing test**

Create `tests/examples-section.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExamplesSection } from "@/components/home/ExamplesSection";
import { demoSites } from "@/lib/demo-sites.demo";

describe("demoSites data", () => {
  it("has exactly the four validated demo businesses", () => {
    expect(demoSites.map((s) => s.name)).toEqual([
      "Dupont Plomberie",
      "Atelier Toiture",
      "Maison Éclat",
      "Cabinet Horizon",
    ]);
  });
});

describe("ExamplesSection", () => {
  it("marks every demo card as a FeaseWeb example, not a real client", () => {
    render(<ExamplesSection />);
    const labels = screen.getAllByText("Exemple de site FeaseWeb");
    expect(labels).toHaveLength(demoSites.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- examples-section`
Expected: FAIL.

- [ ] **Step 3: Create the demo data**

Create `lib/demo-sites.demo.ts`:
```typescript
export type DemoSite = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
};

export const demoSites: DemoSite[] = [
  {
    slug: "dupont-plomberie",
    name: "Dupont Plomberie",
    category: "Artisan",
    tagline: "Dépannage 7j/7 dans tout le secteur",
    description:
      "Un site clair pour un plombier indépendant : services, zone d'intervention et devis en un clic.",
  },
  {
    slug: "atelier-toiture",
    name: "Atelier Toiture",
    category: "Couverture & rénovation",
    tagline: "Rénovation de toiture et zinguerie",
    description:
      "Mise en avant des réalisations et des certifications, avec une prise de contact simplifiée.",
  },
  {
    slug: "maison-eclat",
    name: "Maison Éclat",
    category: "Beauté & bien-être",
    tagline: "Institut de beauté et soins du visage",
    description:
      "Un univers doux et soigné, pensé pour la prise de rendez-vous en ligne.",
  },
  {
    slug: "cabinet-horizon",
    name: "Cabinet Horizon",
    category: "Profession libérale",
    tagline: "Conseil et accompagnement professionnel",
    description:
      "Un site sobre et rassurant pour un cabinet de conseil, orienté prise de rendez-vous.",
  },
];
```

- [ ] **Step 4: Implement `DemoSiteCard`**

Create `components/home/DemoSiteCard.tsx`:
```tsx
import Link from "next/link";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import type { DemoSite } from "@/lib/demo-sites.demo";

export function DemoSiteCard({ site }: { site: DemoSite }) {
  return (
    <Link
      href={`/exemples/${site.slug}`}
      className="group block rounded-lg border border-line bg-white p-5 transition-shadow hover:shadow-md"
    >
      <SiteMockup businessName={site.name} tagline={site.tagline} />
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-ink">{site.name}</p>
          <p className="text-sm text-ink-soft">{site.category}</p>
        </div>
        <span className="rounded-sm bg-bg-alt px-2.5 py-1 text-xs text-ink-soft">
          Exemple de site FeaseWeb
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Implement `ExamplesSection`**

Create `components/home/ExamplesSection.tsx`:
```tsx
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoSiteCard } from "@/components/home/DemoSiteCard";
import { demoSites } from "@/lib/demo-sites.demo";

export function ExamplesSection() {
  return (
    <section id="exemples" className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Exemples de sites FeaseWeb"
          title="Si votre site ressemble à ça, c'est normal."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {demoSites.map((site) => (
            <DemoSiteCard key={site.slug} site={site} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run test, append to homepage, no commit**

Run: `npm test -- examples-section` → PASS. Append `<ExamplesSection />`,
wrapped in `<RevealOnScroll>`, to `app/page.tsx` after `ClientSpaceSection`.
Continue to Task 17.

---

### Task 17: `ModificationFlow`, `SEOSection`, `ServiceEditorialGrid`

**Files:**
- Create: `components/home/ModificationFlow.tsx`
- Create: `components/home/SEOSection.tsx`
- Create: `components/home/ServiceEditorialGrid.tsx`
- Test: `tests/modification-seo-services.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `SectionHeading` (10).
- Produces: `<ModificationFlow />`, `<SEOSection />`, `<ServiceEditorialGrid />`.

`ModificationFlow`: title `"Besoin de changer quelque chose ? Demandez-le."`, workflow steps "Demande envoyée" → "En cours" → "Terminée", four example requests: "Nouveaux horaires", "Changement de photo", "Nouvelle prestation", "Correction d'un texte", closing line `"Pas besoin de toucher au site vous-même."`

`SEOSection`, id `seo`: title `"Un beau site ne suffit pas. Il faut aussi qu'on puisse le trouver."`, body explaining FeaseWeb works on foundations + ongoing monitoring, listing (as plain items, not promises): "Indexation", "Structure", "Contenus", "Balises", "Performance", "Visibilité Google — suivie dans l'espace client". No ranking/traffic promises anywhere in this component.

`ServiceEditorialGrid`, id `tout-compris-details` (avoid duplicate id with ComparisonBlock's `tout-compris` — this one has no id or uses a different anchor since `tout-compris` nav target is already ComparisonBlock per Task 14): four blocks "Création" (Design + mobile + contenu), "Technique" (Hébergement + SSL + sécurité + sauvegardes), "Évolution" (Maintenance + modifications), "Visibilité" (SEO + suivi Google).

- [ ] **Step 1: Write the failing test**

Create `tests/modification-seo-services.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModificationFlow } from "@/components/home/ModificationFlow";
import { SEOSection } from "@/components/home/SEOSection";
import { ServiceEditorialGrid } from "@/components/home/ServiceEditorialGrid";

describe("ModificationFlow", () => {
  it("shows the three-step request workflow", () => {
    render(<ModificationFlow />);
    expect(screen.getByText("Demande envoyée")).toBeInTheDocument();
    expect(screen.getByText("Terminée")).toBeInTheDocument();
  });
});

describe("SEOSection", () => {
  it("never promises rankings, traffic, or results", () => {
    render(<SEOSection />);
    expect(
      screen.queryByText(/première position|garanti|nombre de visiteurs/i)
    ).not.toBeInTheDocument();
  });
});

describe("ServiceEditorialGrid", () => {
  it("groups services into exactly four editorial blocks", () => {
    render(<ServiceEditorialGrid />);
    expect(screen.getByText("Création")).toBeInTheDocument();
    expect(screen.getByText("Visibilité")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- modification-seo-services`
Expected: FAIL.

- [ ] **Step 3: Implement `ModificationFlow`**

Create `components/home/ModificationFlow.tsx`:
```tsx
import { SectionHeading } from "@/components/ui/SectionHeading";

const requests = [
  "Nouveaux horaires",
  "Changement de photo",
  "Nouvelle prestation",
  "Correction d'un texte",
];

const stages = ["Demande envoyée", "En cours", "Terminée"];

export function ModificationFlow() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading title="Besoin de changer quelque chose ? Demandez-le." />
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {stages.map((stage, index) => (
            <div key={stage} className="flex items-center gap-3">
              <span className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink">
                {stage}
              </span>
              {index < stages.length - 1 && <span className="text-ink-soft">→</span>}
            </div>
          ))}
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {requests.map((request) => (
            <li key={request} className="rounded-md border border-line bg-white px-4 py-3 text-ink-soft">
              {request}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-ink-soft">Pas besoin de toucher au site vous-même.</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `SEOSection`**

Create `components/home/SEOSection.tsx`:
```tsx
import { SectionHeading } from "@/components/ui/SectionHeading";

const foundations = [
  "Indexation",
  "Structure",
  "Contenus",
  "Balises",
  "Performance",
  "Visibilité Google — suivie dans l'espace client",
];

export function SEOSection() {
  return (
    <section id="seo" className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading title="Un beau site ne suffit pas. Il faut aussi qu'on puisse le trouver." />
        <p className="mt-4 max-w-xl text-ink-soft">
          Le référencement est inclus dans votre abonnement : FeaseWeb travaille
          les fondations techniques de votre site et suit son évolution dans le
          temps.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {foundations.map((item) => (
            <li key={item} className="flex items-start gap-2 text-ink-soft">
              <span className="mt-1 text-accent">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement `ServiceEditorialGrid`**

Create `components/home/ServiceEditorialGrid.tsx`:
```tsx
const blocks = [
  { title: "Création", body: "Design, adaptation mobile et contenu." },
  { title: "Technique", body: "Hébergement, SSL, sécurité et sauvegardes." },
  { title: "Évolution", body: "Maintenance et petites modifications." },
  { title: "Visibilité", body: "Référencement SEO et suivi Google." },
];

export function ServiceEditorialGrid() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {blocks.map((block) => (
            <div key={block.title}>
              <p className="font-serif text-xl text-ink">{block.title}</p>
              <p className="mt-2 text-ink-soft">{block.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run test, append to homepage, no commit**

Run: `npm test -- modification-seo-services` → PASS. Append all three, each
wrapped in its own `<RevealOnScroll>`, in order `<ServiceEditorialGrid />`,
`<ModificationFlow />`, `<SEOSection />`, to `app/page.tsx` after
`ExamplesSection`. Continue to Task 18.

---

### Task 18: `FAQSection` (accordion) + `FinalCTA`

**Files:**
- Create: `lib/faq.demo.ts`
- Create: `components/home/FAQSection.tsx`
- Create: `components/home/FinalCTA.tsx`
- Test: `tests/faq-and-final-cta.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `SectionHeading` (10), `CTAButton` (4).
- Produces: `faqItems: { question: string; answer: string }[]` from `lib/faq.demo.ts`, `<FAQSection />`, `<FinalCTA />`.

FAQ items (question → answer), the last one carries the explicit not-yet-final legal wording:
1. "Pourquoi la création est-elle à 0 € ?" → "Parce que le vrai produit FeaseWeb est le service géré à 49 €/mois : nous préférons vous laisser juger la qualité du site avant de vous engager, plutôt que de vous faire payer une création que vous n'avez pas encore vue."
2. "Que comprennent les 49 €/mois ?" → "Le site, son hébergement, sa sécurité, sa maintenance, les sauvegardes, les petites modifications, le référencement SEO et l'accès à votre espace client. Tout est inclus, il n'y a pas d'option payante en plus."
3. "J'ai déjà un site, pouvez-vous le refaire ?" → "Oui. Donnez-nous l'adresse de votre site actuel et nous préparons sa refonte, avec la même formule à 49 €/mois."
4. "Le référencement est-il vraiment inclus ?" → "Oui, sans option supplémentaire. Nous travaillons les fondations techniques de votre site et suivons sa visibilité dans le temps, sans jamais promettre un résultat garanti."
5. "Puis-je demander des modifications ?" → "Oui, directement depuis votre espace client. Les petites modifications sont incluses dans l'abonnement."
6. "Combien de pages sont incluses ?" → "Jusqu'à 5 pages dans l'abonnement de base."
7. "Puis-je utiliser mon propre nom de domaine ?" → "Oui, vous pouvez utiliser un nom de domaine existant ou en obtenir un nouveau avec notre aide."
8. "Que se passe-t-il si je souhaite arrêter ?" → `"[À VALIDER AVANT PRODUCTION] Nous envisageons un modèle de mise à disposition du site avec possibilité de rachat ou de transfert à la sortie. Les modalités juridiques précises et le prix de rachat ne sont pas encore définitivement validés — cette réponse sera mise à jour avant la mise en production."`

`FinalCTA` copy: title `"Vous avez une entreprise."` / `"On s'occupe de son site."`, subtext `"Création ou refonte sans frais de création. Puis 49 €/mois, référencement compris."`, primary CTA `"Créer mon site"` → `/creer-mon-site`, secondary link `"J'ai déjà un site →"` → `/refaire-mon-site`.

- [ ] **Step 1: Write the failing test**

Create `tests/faq-and-final-cta.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTA } from "@/components/home/FinalCTA";

describe("FAQSection", () => {
  it("expands an answer when its question is clicked", async () => {
    render(<FAQSection />);
    const question = screen.getByRole("button", {
      name: /Pourquoi la création est-elle à 0 €/,
    });
    expect(screen.queryByText(/vrai produit FeaseWeb/)).not.toBeInTheDocument();
    await userEvent.click(question);
    expect(screen.getByText(/vrai produit FeaseWeb/)).toBeInTheDocument();
  });

  it("flags the cancellation answer as not yet legally validated", () => {
    render(<FAQSection />);
    expect(screen.getByText(/À VALIDER AVANT PRODUCTION/)).toBeInTheDocument();
  });
});

describe("FinalCTA", () => {
  it("shows the primary and secondary calls to action", () => {
    render(<FinalCTA />);
    expect(screen.getByRole("link", { name: "Créer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
    expect(screen.getByRole("link", { name: "J'ai déjà un site →" })).toHaveAttribute(
      "href",
      "/refaire-mon-site"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- faq-and-final-cta`
Expected: FAIL.

- [ ] **Step 3: Create FAQ data**

Create `lib/faq.demo.ts` with the eight `{ question, answer }` pairs listed above, typed as `export type FAQItem = { question: string; answer: string }; export const faqItems: FAQItem[] = [...]`.

- [ ] **Step 4: Implement `FAQSection`**

Create `components/home/FAQSection.tsx`:
```tsx
"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqItems } from "@/lib/faq.demo";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading title="Questions fréquentes" />
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-medium text-ink">{item.question}</span>
                  <span className="text-ink-soft">{isOpen ? "—" : "+"}</span>
                </button>
                {isOpen && (
                  <p className="pb-5 text-ink-soft">{item.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement `FinalCTA`**

Create `components/home/FinalCTA.tsx`:
```tsx
import { CTAButton } from "@/components/ui/CTAButton";

export function FinalCTA() {
  return (
    <section className="bg-brand py-20 text-white md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-serif text-3xl md:text-4xl">Vous avez une entreprise.</p>
        <p className="font-serif text-3xl text-white/90 md:text-4xl">
          On s&apos;occupe de son site.
        </p>
        <p className="mx-auto mt-5 max-w-md text-white/80">
          Création ou refonte sans frais de création. Puis 49 €/mois,
          référencement compris.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
          <a href="/refaire-mon-site" className="text-sm text-white/80 hover:text-white">
            J&apos;ai déjà un site →
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run test, append to homepage, no commit**

Run: `npm test -- faq-and-final-cta` → PASS. Append `<FAQSection />` wrapped
in `<RevealOnScroll>`, then `<FinalCTA />` unwrapped (it's a heavy brand-color
closing section — keep it appearing immediately, not fading in), to
`app/page.tsx`, closing out the homepage. Continue to Task 19.

---

### Task 19: Secondary routes — funnel pages, examples detail, dashboard, connexion, legal

**Files:**
- Create: `components/home/DemoLeadForm.tsx`
- Create: `app/creer-mon-site/page.tsx`
- Create: `app/refaire-mon-site/page.tsx`
- Create: `app/exemples/page.tsx`
- Create: `app/exemples/[slug]/page.tsx`
- Create: `app/espace-client/page.tsx`
- Create: `app/connexion/page.tsx`
- Create: `components/layout/LegalPageLayout.tsx`
- Create: `app/mentions-legales/page.tsx`, `app/confidentialite/page.tsx`, `app/cgv/page.tsx`, `app/cookies/page.tsx`
- Test: `tests/secondary-routes.test.tsx`

**Interfaces:**
- Consumes: `demoSites` (16), `DashboardPreview` (15), `CTAButton` (4), `Logo`/`Header`/`Footer` (already global via layout).
- Produces: nothing consumed further — these are leaves of the route tree.

- [ ] **Step 1: Write the failing test**

Create `tests/secondary-routes.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoLeadForm } from "@/components/home/DemoLeadForm";
import ExemplesPage from "@/app/exemples/page";
import ExempleDetailPage from "@/app/exemples/[slug]/page";
import EspaceClientPage from "@/app/espace-client/page";

describe("DemoLeadForm", () => {
  it("shows a local success state instead of submitting anywhere", async () => {
    render(<DemoLeadForm mode="create" />);
    await userEvent.type(screen.getByLabelText("Nom de votre entreprise"), "Test SARL");
    await userEvent.click(screen.getByRole("button", { name: /Envoyer/ }));
    expect(await screen.findByText(/Merci/)).toBeInTheDocument();
  });
});

describe("Exemples pages", () => {
  it("lists every demo site with its FeaseWeb-example label", () => {
    render(<ExemplesPage />);
    expect(screen.getAllByText("Exemple de site FeaseWeb").length).toBeGreaterThan(0);
  });

  it("renders a single demo site detail page", async () => {
    const Page = await ExempleDetailPage({
      params: Promise.resolve({ slug: "dupont-plomberie" }),
    });
    render(Page);
    expect(screen.getByText("Dupont Plomberie")).toBeInTheDocument();
  });
});

describe("EspaceClientPage", () => {
  it("labels itself explicitly as a preview, not the real client space", () => {
    render(<EspaceClientPage />);
    expect(screen.getByText(/aperçu/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- secondary-routes`
Expected: FAIL — modules/routes don't exist yet.

- [ ] **Step 3: Implement `DemoLeadForm`**

Create `components/home/DemoLeadForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import { CTAButton } from "@/components/ui/CTAButton";

export function DemoLeadForm({ mode }: { mode: "create" | "redesign" }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center">
        <p className="font-serif text-xl text-ink">Merci !</p>
        <p className="mt-2 text-ink-soft">
          Ceci est une démonstration : dans le produit final, notre équipe
          reviendrait vers vous rapidement pour démarrer votre site.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5 rounded-lg border border-line bg-white p-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div>
        <label htmlFor="company-name" className="text-sm font-medium text-ink">
          Nom de votre entreprise
        </label>
        <input
          id="company-name"
          name="companyName"
          type="text"
          required
          className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
        />
      </div>
      {mode === "redesign" && (
        <div>
          <label htmlFor="current-url" className="text-sm font-medium text-ink">
            Adresse de votre site actuel
          </label>
          <input
            id="current-url"
            name="currentUrl"
            type="url"
            required
            placeholder="https://"
            className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Votre email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-sm bg-brand px-6 py-3 text-[15px] font-medium text-white hover:bg-brand-dark"
      >
        Envoyer ma demande
      </button>
    </form>
  );
}
```

Note: the parent pages render either `CTAButton`-styled links elsewhere; this form owns its own submit button because it needs `type="submit"`, not a `Link`.

- [ ] **Step 4: Implement the funnel pages**

Create `app/creer-mon-site/page.tsx`:
```tsx
import { DemoLeadForm } from "@/components/home/DemoLeadForm";

export default function CreerMonSitePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
        On part de zéro
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
        Parlez-nous de votre entreprise
      </h1>
      <p className="mt-4 text-ink-soft">
        Quelques informations suffisent pour démarrer. C&apos;est gratuit : la
        création de votre site n&apos;a aucun frais initial.
      </p>
      <div className="mt-10">
        <DemoLeadForm mode="create" />
      </div>
    </main>
  );
}
```

Create `app/refaire-mon-site/page.tsx` (same shape, `mode="redesign"`, heading `"On peut faire beaucoup mieux"`, intro mentioning we'll review their current site).

- [ ] **Step 5: Implement `/exemples` and `/exemples/[slug]`**

Create `app/exemples/page.tsx`:
```tsx
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoSiteCard } from "@/components/home/DemoSiteCard";
import { demoSites } from "@/lib/demo-sites.demo";

export default function ExemplesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="Exemples de sites FeaseWeb"
        title="Quatre métiers, quatre sites."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {demoSites.map((site) => (
          <DemoSiteCard key={site.slug} site={site} />
        ))}
      </div>
    </main>
  );
}
```

Create `app/exemples/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { demoSites } from "@/lib/demo-sites.demo";

export default async function ExempleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = demoSites.find((candidate) => candidate.slug === slug);
  if (!site) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <span className="rounded-sm bg-bg-alt px-2.5 py-1 text-xs text-ink-soft">
        Exemple de site FeaseWeb
      </span>
      <h1 className="mt-4 font-serif text-3xl text-ink md:text-4xl">{site.name}</h1>
      <p className="mt-2 text-ink-soft">{site.description}</p>
      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto]">
        <SiteMockup businessName={site.name} tagline={site.tagline} />
        <PhoneMockup businessName={site.name} />
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Implement `/espace-client`**

Create `app/espace-client/page.tsx`:
```tsx
import { DashboardPreview } from "@/components/mockups/DashboardPreview";

export default function EspaceClientPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-serif text-3xl text-ink md:text-4xl">
        Votre site, toujours sous contrôle.
      </h1>
      <p className="mt-3 text-ink-soft">
        Aperçu de démonstration de l&apos;espace client FeaseWeb — les données
        affichées ici sont fictives.
      </p>
      <div className="mt-10">
        <DashboardPreview />
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Implement `/connexion`**

Create `app/connexion/page.tsx` — a simple centered fake login form (email + password inputs, submit button labeled "Se connecter", a note `"Démonstration — aucune authentification réelle."`) with no `onSubmit` network call (local `preventDefault` only, no success/failure branching needed for a mockup).

- [ ] **Step 8: Implement legal page layout + pages**

Create `components/layout/LegalPageLayout.tsx`:
```tsx
export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-serif text-3xl text-ink">{title}</h1>
      <div className="mt-6 space-y-4 text-ink-soft">{children}</div>
    </main>
  );
}
```

Create the four legal pages (`app/mentions-legales/page.tsx`, `app/confidentialite/page.tsx`, `app/cgv/page.tsx`, `app/cookies/page.tsx`), each importing `LegalPageLayout` and containing a short paragraph plus an explicit `<p>[TODO: contenu juridique à rédiger et valider avant mise en production — raison sociale, SIREN, adresse, hébergeur, DPO, conditions de résiliation.]</p>` — never inventing the missing legal facts.

- [ ] **Step 9: Run test to verify it passes**

Run: `npm test -- secondary-routes`
Expected: PASS.

- [ ] **Step 10: Manual navigation check**

Run: `npm run dev`. Click through header nav, both hero CTAs, both TwoPathsCards CTAs, an example card into its detail page, the client-space section, footer legal links, and `/connexion`. Confirm no broken links, no console errors.

- [ ] **Step 11: No commit** (continue to Task 20)

---

### Task 20: Content-guard test, full QA sweep, art-direction pass, first commit

**Files:**
- Create: `tests/content-guard.test.ts`
- Modify: any component/page files touched during the art-direction pass (no new files expected)

**Interfaces:**
- Produces: nothing consumed by other tasks — this is the terminal task.

- [ ] **Step 1: Write the repo-wide content guard test**

Create `tests/content-guard.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SCAN_DIRS = ["app", "components", "lib"];
const FORBIDDEN_PATTERNS = [/39\s?€/, /78\s?€/, /98\s?€/, /SEO\s*\+\s*49/i];
const FORBIDDEN_PROOF_WORDS = [/témoignage/i, /★/, /\bavis\s+client/i];

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) return walk(fullPath);
    if (!/\.(tsx?|ts)$/.test(fullPath)) return [];
    return [fullPath];
  });
}

const files = SCAN_DIRS.flatMap((dir) => walk(join(process.cwd(), dir)));

describe("content guard", () => {
  it("never contains a forbidden legacy price", () => {
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(pattern.test(content), `${file} matched ${pattern}`).toBe(false);
      }
    }
  });

  it("never contains fabricated testimonials or star ratings", () => {
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      for (const pattern of FORBIDDEN_PROOF_WORDS) {
        expect(pattern.test(content), `${file} matched ${pattern}`).toBe(false);
      }
    }
  });

  it("states the real price at least once in the codebase", () => {
    const allContent = files.map((file) => readFileSync(file, "utf-8")).join("\n");
    expect(/49\s?€/.test(allContent)).toBe(true);
    expect(/0\s?€/.test(allContent)).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and fix any hit**

Run: `npm test -- content-guard`
Expected: PASS. If it fails, find and fix the offending file before continuing — do not weaken the test.

- [ ] **Step 3: Full automated QA sweep**

Run, in order, and confirm each is clean:
```bash
npm run lint
npm run typecheck
npm run build
npm test
```
All four must succeed with zero errors. `next build` additionally confirms every route in Task 19 compiles.

- [ ] **Step 4: Manual responsive sweep**

Run `npm run dev`. Using browser devtools device sizes, check `/` at 375px, 390px, 430px, 768px, 1024px, 1440px widths for: no horizontal scrollbar/overflow, H1 fully readable without truncation, both hero CTAs reachable and tappable, pricing (`0 €` / `49 €/mois`) visible without scrolling past the fold on mobile, header mobile menu opens/closes cleanly, FAQ accordion usable by touch.

- [ ] **Step 5: Console/accessibility spot-check**

With devtools open, navigate the full homepage and every secondary route; confirm no console errors/warnings. Tab through the header, hero CTAs, and FAQ accordion using only the keyboard; confirm visible focus rings throughout (from the `focus-visible:outline` classes already on `CTAButton` and native interactive elements).

- [ ] **Step 6: Art-direction pass**

Review the running homepage section by section as a creative director and fix in place, directly in the component files from Tasks 8–18, anything that reads as generic-template:
- Section vertical rhythm: confirm consistent `py-20 md:py-28` (or intentionally larger for Hero/FinalCTA) across sections — no section noticeably cramped or oversized next to its neighbors.
- Heading hierarchy: H1 (Hero) must read clearly larger/heavier than every H2 (`SectionHeading`); H2s must be visually consistent with each other.
- Density: `OfferSection`'s checklist and `SEOSection`'s checklist should not look like two identical generic checkbox lists back to back — vary layout (e.g., two-column grid vs. single column, or icon vs. bullet) if on review they look too similar.
- Mockups: confirm `SiteMockup`/`PhoneMockup` gradients read as deliberate brand color blocks, not placeholder gray boxes — nudge opacity/color if they look washed out at actual device size.
- Mobile: re-check the Hero's overlapping `PhoneMockup` doesn't clip or overlap text at 375–430px; hide or reposition if it does.
- Transitions: confirm `RevealOnScroll` timing feels premium (not sluggish, not snappy-jarring) at normal scroll speed; adjust `duration-500` if needed.

Make any resulting edits directly in the relevant files. Re-run `npm test` and `npm run build` after edits to confirm nothing broke.

- [ ] **Step 7: Re-run full QA after art-direction edits**

Run: `npm run lint && npm run typecheck && npm run build && npm test`
Expected: all pass.

- [ ] **Step 8: First commit**

```bash
git add -A
git commit -m "feat: build FeaseWeb homepage mockup with examples, dashboard, and secondary routes

Next.js/TypeScript/Tailwind front-end mockup only — no real backend,
no push to GitHub.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 9: Confirm no push occurred**

Run: `git log --oneline -5` and `git status`
Expected: one new local commit ahead of the (empty) remote tracking state; working tree clean; no `git push` has been run.
