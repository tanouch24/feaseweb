import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SCAN_DIRS = ["app", "components", "lib"];
const FORBIDDEN_PATTERNS = [/39\s?€/, /78\s?€/, /98\s?€/, /SEO\s*\+\s*49/i];
const FORBIDDEN_PROOF_WORDS = [/témoignage/i, /★/, /\bavis\s+client/i];

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) return walk(fullPath);
    if (!/\.(tsx?|ts)$/.test(fullPath)) return [];
    return [fullPath];
  });
}

const files = SCAN_DIRS.flatMap((dir) => walk(join(process.cwd(), dir)));

describe("content guard", () => {
  it("never contains a forbidden legacy price", () => {
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(pattern.test(content), `${file} matched ${pattern}`).toBe(false);
      }
    }
  });

  it("never contains fabricated testimonials or star ratings", () => {
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      for (const pattern of FORBIDDEN_PROOF_WORDS) {
        expect(pattern.test(content), `${file} matched ${pattern}`).toBe(false);
      }
    }
  });

  it("states the real price at least once in the codebase", () => {
    const allContent = files.map((file) => readFileSync(file, "utf-8")).join("\n");
    expect(/49\s?€/.test(allContent)).toBe(true);
    expect(/0\s?€/.test(allContent)).toBe(true);
  });
});
