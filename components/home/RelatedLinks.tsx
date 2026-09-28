import Link from "next/link";

export function RelatedLinks({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  return (
    <section className="border-t border-line py-14">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm text-ink-soft">À découvrir ensuite</p>
        <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {links.map((link) => (
            <Link key={link.href} className="font-medium text-brand-dark hover:text-brand" href={link.href}>
              {link.label} →
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
