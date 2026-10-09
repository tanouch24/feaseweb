import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";

export function FinalCTA() {
  return (
    <section className="px-3 pb-3 md:px-5 md:pb-5">
      <div className="rounded-lg bg-night py-20 text-white md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-[2.2rem] leading-[1.02] md:text-[3.4rem]">
            Vous avez une entreprise.
            <br />
            On s&apos;occupe de son site.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/70">
            Création ou refonte sans frais. Puis 49 € par mois, référencement
            compris.
          </p>
          <div className="mt-10 flex flex-col items-center gap-5">
            <CTAButton href="/creer-mon-site" variant="brass">
              Créer mon site
            </CTAButton>
            <Link
              href="/refaire-mon-site"
              className="text-[15px] font-medium text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white"
            >
              J&apos;ai déjà un site
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
