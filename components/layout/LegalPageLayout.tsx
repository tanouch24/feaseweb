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
