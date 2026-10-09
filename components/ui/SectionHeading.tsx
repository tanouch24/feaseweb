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
      {eyebrow && <p className="text-[15px] font-medium text-brand">{eyebrow}</p>}
      <Heading className="mt-2 font-serif text-[2rem] leading-[1.05] text-ink md:text-[2.75rem]">
        {title}
      </Heading>
    </div>
  );
}
