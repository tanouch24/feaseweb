import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/blog/mdx-components";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo-metadata";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return pageMetadata({
    title: `${post.title} | FeaseWeb`,
    description: post.description,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: post.date,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "FeaseWeb" },
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title, href: `/blog/${slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <span className="rounded-sm bg-bg-alt px-2 py-1 uppercase tracking-wide">
          {post.category}
        </span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </div>
      <h1 className="mt-4 font-serif text-3xl text-ink md:text-4xl">
        {post.title}
      </h1>
      <div className="mt-8">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>
    </main>
  );
}
