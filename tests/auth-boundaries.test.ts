import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("server auth boundaries", () => {
  it("protects admin layout before rendering the client console", () => {
    const source = readFileSync(resolve(process.cwd(), "app/admin/layout.tsx"), "utf8");
    expect(source).toContain("await requireAdmin()");
    expect(source).toContain("BackofficeProvider");
  });

  it("does not use localStorage in the remote back-office store", () => {
    const source = readFileSync(resolve(process.cwd(), "lib/backoffice-store.tsx"), "utf8");
    expect(source).not.toContain("localStorage");
    expect(source).toContain("/api/admin/bootstrap");
  });

  it("keeps server secrets out of the public environment namespace", () => {
    const source = readFileSync(resolve(process.cwd(), "lib/supabase/config.ts"), "utf8");
    expect(source).toContain("SUPABASE_SECRET_KEY");
    expect(source).not.toContain("NEXT_PUBLIC_SUPABASE_SECRET_KEY");
  });
});
