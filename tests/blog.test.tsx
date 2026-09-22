import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { getAllPosts, getAllSlugs, getPostBySlug } from "@/lib/blog";
import { generateMetadata } from "@/app/blog/[slug]/page";
import BlogPage from "@/app/blog/page";

describe("blog data", () => {
  it("lists every post with the required frontmatter fields", () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.title).toBeTruthy();
      expect(post.description).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
      expect(post.date).toBeTruthy();
      expect(post.category).toBeTruthy();
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
