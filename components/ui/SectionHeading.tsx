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
