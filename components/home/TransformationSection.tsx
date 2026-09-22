import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";

export function TransformationSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <SectionHeading title="On peut aussi transformer votre ancien site." />
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          Faites glisser le curseur pour comparer. Démonstration fictive à
          titre d&apos;illustration — pas un client réel.
        </p>
        <div className="mt-10">
          <BeforeAfterSlider />
        </div>
      </div>
    </section>
  );
}
