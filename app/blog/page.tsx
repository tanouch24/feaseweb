import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/blog/PostCard";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Conseils pour le site internet de votre entreprise | FeaseWeb",
  description:
    "Conseils pratiques sur le référencement, la refonte de site, le mobile et la maintenance, pour les artisans, commerçants et indépendants.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <SectionHeading
        eyebrow="Blog FeaseWeb"
        title="Des conseils simples pour le site de votre entreprise."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
