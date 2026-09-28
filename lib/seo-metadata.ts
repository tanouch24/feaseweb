import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-config";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
}: PageMetadataOptions): Metadata {
  const url = new URL(path, siteUrl).toString();

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: "FeaseWeb",
      title,
      description,
      url,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
