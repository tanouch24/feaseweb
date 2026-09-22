export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "positive" | "neutral";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium ${
        tone === "positive"
          ? "bg-brand/10 text-brand-dark"
          : "bg-bg-alt text-ink-soft"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "positive" ? "bg-brand" : "bg-ink-soft"
        }`}
      />
      {label}
    </span>
  );
}
