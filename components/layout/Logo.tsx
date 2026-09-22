import Link from "next/link";

const sizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
} as const;

export function Logo({ size = "md" }: { size?: keyof typeof sizeMap }) {
  return (
    <Link
      href="/"
      className={`font-serif font-medium ${sizeMap[size]} tracking-tight`}
      aria-label="FeaseWeb — retour à l'accueil"
    >
      <span className="text-ink">Fease</span>
      <span className="text-brand">Web</span>
    </Link>
  );
}
