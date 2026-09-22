import Link from "next/link";
import type { PostSummary } from "@/lib/blog";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-lg border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <span className="rounded-sm bg-bg-alt px-2 py-1 uppercase tracking-wide">
          {post.category}
        </span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </div>
      <p className="mt-4 font-serif text-xl text-ink">{post.title}</p>
      <p className="mt-2 text-sm text-ink-soft">{post.excerpt}</p>
      <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-dark">
        Lire l&apos;article
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </p>
    </Link>
  );
}
