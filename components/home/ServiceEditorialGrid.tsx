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
