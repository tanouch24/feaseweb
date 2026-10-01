import { describe, expect, it } from "vitest";
import { metadata } from "@/app/checklist-site-internet-artisan/page";
import sitemap from "@/app/sitemap";

describe("artisan checklist asset", () => {
  it("is indexable and included once in the sitemap after validation", () => {
    expect(metadata.alternates?.canonical).toBe("/checklist-site-internet-artisan");
    expect(metadata.robots).toBeUndefined();
    expect(metadata.title).toContain("Checklist site internet pour artisan");
    expect(sitemap().filter((entry) => entry.url.endsWith("/checklist-site-internet-artisan"))).toHaveLength(1);
  });
});
