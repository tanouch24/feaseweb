import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { getAllPosts, getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { generateMetadata } from "@/app/blog/[slug]/page";
import BlogPage from "@/app/blog/page";
import sitemap from "@/app/sitemap";

describe("blog data", () => {
  it("lists every post with the required frontmatter fields", () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.title).toBeTruthy();
      expect(post.description).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
      expect(post.date).toBeTruthy();
      expect(post.publishedAt).toBe(post.date);
      expect(post.category).toBeTruthy();
      expect(post.author).toBe("FeaseWeb");
      expect(post.status).toBe("published");
      expect(post.targetPage).toMatch(/^\//);
    }
  });

  it("sorts posts from most recent to oldest", () => {
    const posts = getAllPosts();
    const dates = posts.map((post) => post.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });

  it("returns null for an unknown slug instead of throwing", () => {
    expect(getPostBySlug("ce-slug-n-existe-pas")).toBeNull();
  });

  it("provides related published posts without including the current article", () => {
    const [slug] = getAllSlugs();
    const related = getRelatedPosts(slug);
    expect(related.every((post) => post.slug !== slug && post.status === "published")).toBe(true);
    expect(related.length).toBeLessThanOrEqual(3);
  });

  it("includes the first P1 article after editorial validation", async () => {
    const slug = "prix-site-internet-petite-entreprise";
    expect(getAllSlugs()).toContain(slug);
    expect(getAllPosts().some((post) => post.slug === slug)).toBe(true);
    expect(getPostBySlug(slug)).toMatchObject({ status: "published", targetPage: "/tarifs" });
    expect(sitemap().filter((entry) => entry.url.endsWith(`/blog/${slug}`))).toHaveLength(1);
    expect((await generateMetadata({ params: Promise.resolve({ slug }) })).alternates?.canonical).toBe(`/blog/${slug}`);
  });

  it("includes the second P1 article after editorial validation", () => {
    const slug = "refaire-son-site-internet-quand-et-pourquoi";

    expect(getAllSlugs()).toContain(slug);
    expect(getAllPosts().some((post) => post.slug === slug)).toBe(true);
    expect(getPostBySlug(slug)).toMatchObject({ status: "published", targetPage: "/refonte-site-internet" });
    expect(sitemap().filter((entry) => entry.url.endsWith(`/blog/${slug}`))).toHaveLength(1);
  });
});

describe("BlogPage", () => {
  it("renders a card for every post", () => {
    render(<BlogPage />);
    const slugs = getAllSlugs();
    const links = screen.getAllByRole("link", { name: /Lire l'article/ });
    expect(links).toHaveLength(slugs.length);
  });
});

describe("blog post metadata", () => {
  // The post page itself renders MDX via next-mdx-remote/rsc, an async
  // Server Component that plain React Testing Library (jsdom, no RSC
  // renderer) cannot resolve — that combination is verified against the
  // real dev server during QA instead. This checks the metadata function,
  // which is plain, synchronous-enough logic.
  it("builds per-post metadata with a canonical URL", async () => {
    const [slug] = getAllSlugs();
    const post = getPostBySlug(slug);
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
    expect(metadata.title).toContain(post!.title);
    expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
  });

  it("returns empty metadata for an unknown slug instead of throwing", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "inconnu" }),
    });
    expect(metadata).toEqual({});
  });
});
