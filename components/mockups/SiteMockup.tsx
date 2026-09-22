export function SiteMockup({
  businessName,
  tagline,
  animate = false,
  scrollPreview = false,
}: {
  businessName: string;
  tagline: string;
  /** Plays a short "the page is building" reveal once, on mount. */
  animate?: boolean;
  /** Reveals extra content below the fold, drifting into view on hover of
   * an ancestor with the `group` class — gives the impression of a real,
   * scrollable page rather than a flat screenshot. */
  scrollPreview?: boolean;
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
      <div
        className={`px-6 py-8 ${scrollPreview ? "h-60 overflow-hidden" : ""}`}
      >
        <div
          className={`${animate ? "animate-rise" : ""} ${
            scrollPreview
              ? "transition-transform duration-700 ease-out group-hover:-translate-y-12"
              : ""
          }`}
          style={animate ? { animationDelay: "420ms" } : undefined}
        >
          <p className="font-serif text-xl text-ink">{businessName}</p>
          <p className="mt-1 text-sm text-ink-soft">{tagline}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="h-20 rounded-sm bg-gradient-to-br from-brand/25 via-brand/10 to-bg-alt" />
            <div className="h-20 rounded-sm bg-gradient-to-br from-accent/25 via-accent/10 to-bg-alt" />
          </div>
          {scrollPreview && (
            <div className="mt-5 space-y-2.5">
              <div className="h-2.5 w-3/4 rounded-full bg-line" />
              <div className="h-2.5 w-1/2 rounded-full bg-line" />
              <div className="mt-3 h-8 w-28 rounded-sm bg-brand/10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
