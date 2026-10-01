import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

const POSTS_DIR = join(process.cwd(), "content/posts");

export type PostFrontmatter = {
  title: string;
  description: string;
  excerpt: string;
  date: string;
  category: string;
  publishedAt: string;
  author: string;
  status: "published" | "draft";
  updatedAt?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  targetPage?: string;
  targetLabel?: string;
};

export type PostSummary = PostFrontmatter & { slug: string };

export type Post = PostSummary & { content: string };

function readPostFile(slug: string) {
  const filePath = join(POSTS_DIR, `${slug}.mdx`);
  const raw = readFileSync(filePath, "utf-8");
  return matter(raw);
}

function normalizePost(slug: string, data: Record<string, unknown>, content = ""): Post {
  const publishedAt = String(data.publishedAt ?? data.date ?? "");

  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    excerpt: String(data.excerpt ?? data.description ?? ""),
    date: publishedAt,
    publishedAt,
    category: String(data.category ?? ""),
    author: String(data.author ?? "FeaseWeb"),
    status: data.status === "draft" ? "draft" : "published",
    ...(data.updatedAt ? { updatedAt: String(data.updatedAt) } : {}),
    ...(data.primaryKeyword ? { primaryKeyword: String(data.primaryKeyword) } : {}),
    ...(Array.isArray(data.secondaryKeywords)
      ? { secondaryKeywords: data.secondaryKeywords.map(String) }
      : {}),
    ...(data.targetPage ? { targetPage: String(data.targetPage) } : {}),
    ...(data.targetLabel ? { targetLabel: String(data.targetLabel) } : {}),
    content,
  };
}

function getPostEntries(): Post[] {
  return readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data, content } = readPostFile(slug);
      return normalizePost(slug, data as Record<string, unknown>, content);
    });
}

export function getAllSlugs(): string[] {
  return getPostEntries()
    .filter((post) => post.status === "published")
    .map((post) => post.slug);
}

export function getAllPosts(): PostSummary[] {
  return getPostEntries()
    .filter((post) => post.status === "published")
    .map((post) => Object.fromEntries(Object.entries(post).filter(([key]) => key !== "content")) as PostSummary)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const { data, content } = readPostFile(slug);
    const post = normalizePost(slug, data as Record<string, unknown>, content);
    return post.status === "published" ? post : null;
  } catch {
    return null;
  }
}

export function getRelatedPosts(slug: string, limit = 3): PostSummary[] {
  const current = getPostBySlug(slug);
  if (!current) return [];

  return getAllPosts()
    .filter((post) => post.slug !== slug)
    .sort((a, b) => {
      const aSameCategory = a.category === current.category ? 1 : 0;
      const bSameCategory = b.category === current.category ? 1 : 0;
      return bSameCategory - aSameCategory || (a.publishedAt < b.publishedAt ? 1 : -1);
    })
    .slice(0, limit);
}
