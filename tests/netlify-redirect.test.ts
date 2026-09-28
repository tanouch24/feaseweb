import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Netlify canonical-host redirect", () => {
  it("redirects only the Netlify hostname and preserves the path", () => {
    const config = readFileSync(resolve(process.cwd(), "netlify.toml"), "utf8");

    expect(config).toContain('from = "https://feaseweb.netlify.app/*"');
    expect(config).toContain('to = "https://feaseweb.fr/:splat"');
    expect(config).toContain("status = 301");
    expect(config).toContain("force = true");
    expect(config).not.toContain('from = "/*"');
  });
});
