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
};

export type PostSummary = PostFrontmatter & { slug: string };

export type Post = PostSummary & { content: string };

function readPostFile(slug: string) {
  const filePath = join(POSTS_DIR, `${slug}.mdx`);
  const raw = readFileSync(filePath, "utf-8");
  return matter(raw);
}

export function getAllSlugs(): string[] {
  return readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getAllPosts(): PostSummary[] {
  return getAllSlugs()
    .map((slug) => {
      const { data } = readPostFile(slug);
      return { slug, ...(data as PostFrontmatter) };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const { data, content } = readPostFile(slug);
    return { slug, content, ...(data as PostFrontmatter) };
  } catch {
    return null;
  }
}
