import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/blog/PostCard";
import { getAllPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Conseils site internet, SEO et refonte pour TPE | FeaseWeb",
  description:
    "Conseils pratiques pour le site internet des artisans, commerçants et petites entreprises : SEO local, refonte, mobile et maintenance.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <SectionHeading
        eyebrow="Blog FeaseWeb"
        title="Des conseils simples pour le site de votre entreprise."
        level="h1"
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
