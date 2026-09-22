export function PhoneMockup({ businessName }: { businessName: string }) {
  return (
    <div className="mx-auto w-40 rounded-lg border border-line bg-white p-2 shadow-sm">
      <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-line" />
      <div className="rounded-md bg-bg-alt px-3 py-4">
        <p className="font-serif text-sm text-ink">{businessName}</p>
        <div className="mt-3 h-14 rounded-sm bg-gradient-to-br from-brand/25 via-brand/10 to-white" />
        <div className="mt-2 h-3 w-2/3 rounded-full bg-line" />
        <div className="mt-1.5 h-3 w-1/2 rounded-full bg-line" />
      </div>
    </div>
  );
}
