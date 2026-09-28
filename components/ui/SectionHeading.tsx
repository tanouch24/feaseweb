export function SectionHeading({
  eyebrow,
  title,
  id,
  level = "h2",
}: {
  eyebrow?: string;
  title: string;
  id?: string;
  level?: "h1" | "h2";
}) {
  const Heading = level;

  return (
    <div id={id} className="max-w-2xl">
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
          {eyebrow}
        </p>
      )}
      <Heading className="mt-3 font-serif text-3xl leading-tight text-ink md:text-[2.5rem]">
        {title}
      </Heading>
    </div>
  );
}
