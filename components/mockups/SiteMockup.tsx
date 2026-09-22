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
          <div className="h-20 rounded-sm bg-gradient-to-br from-brand/25 via-brand/10 to-bg-alt" />
          <div className="h-20 rounded-sm bg-gradient-to-br from-accent/25 via-accent/10 to-bg-alt" />
        </div>
      </div>
    </div>
  );
}
