import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/blog/mdx-components";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo-metadata";
import { siteUrl } from "@/lib/site-config";

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
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
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
  const relatedPosts = getRelatedPosts(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: new URL(`/blog/${slug}`, siteUrl).toString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": new URL(`/blog/${slug}`, siteUrl).toString(),
    },
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    articleSection: post.category,
    ...(post.primaryKeyword || post.secondaryKeywords?.length
      ? { keywords: [post.primaryKeyword, ...(post.secondaryKeywords ?? [])].filter(Boolean).join(", ") }
      : {}),
    author: { "@type": "Organization", name: post.author, url: siteUrl },
    publisher: { "@type": "Organization", name: "FeaseWeb", url: siteUrl },
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
        <span className="rounded-sm bg-bg-alt px-2 py-1">
          {post.category}
        </span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span>·</span>
        <span>Par {post.author}</span>
        {post.updatedAt && post.updatedAt !== post.publishedAt && (
          <>
            <span>·</span>
            <time dateTime={post.updatedAt}>Mis à jour le {formatDate(post.updatedAt)}</time>
          </>
        )}
      </div>
      <h1 className="mt-4 font-serif text-3xl text-ink md:text-4xl">
        {post.title}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">{post.excerpt}</p>
      <div className="mt-8">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>
      {post.targetPage && (
        <aside className="mt-12 rounded-lg border border-line bg-bg-alt p-6">
          <p className="text-[15px] font-semibold text-brand-dark">Pour aller plus loin</p>
          <Link href={post.targetPage} className="mt-2 inline-block font-serif text-2xl text-ink underline underline-offset-4">
            {post.targetLabel ?? "Découvrir l’offre FeaseWeb"}
          </Link>
        </aside>
      )}
      {relatedPosts.length > 0 && (
        <section className="mt-12 border-t border-line pt-8" aria-labelledby="articles-lies">
          <h2 id="articles-lies" className="font-serif text-2xl text-ink">Articles liés</h2>
          <ul className="mt-4 space-y-3">
            {relatedPosts.map((relatedPost) => (
              <li key={relatedPost.slug}>
                <Link href={`/blog/${relatedPost.slug}`} className="text-brand-dark underline underline-offset-2 hover:text-brand">
                  {relatedPost.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
