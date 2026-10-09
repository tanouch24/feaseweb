import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildEmail } from "@/lib/email-template";

vi.mock("server-only", () => ({}));

describe("buildEmail", () => {
  it("escapes user-provided text so a company name cannot inject HTML", () => {
    const { html, text } = buildEmail({ greetingName: "<b>Jo</b>", title: "Titre", paragraphs: ["Société <script>x</script>"], cta: { label: "Ouvrir", url: "https://feaseweb.fr/x" } });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;b&gt;Jo&lt;/b&gt;");
    expect(text).toContain("Ouvrir : https://feaseweb.fr/x");
  });
});

describe("invite route", () => {
  const sendEmail = vi.fn(async () => ({ ok: true as const }));
  const inserts: string[] = [];
  let intake: unknown = null;

  beforeEach(() => {
    vi.resetModules();
    sendEmail.mockClear();
    inserts.length = 0;
    intake = null;
    vi.doMock("@/lib/authz", () => ({ requireApiAdmin: async () => ({ user: { id: "admin-1" } }) }));
    vi.doMock("@/lib/emails", () => ({ sendEmail, appUrl: (p: string) => `https://feaseweb.fr${p}` }));
    vi.doMock("@/lib/supabase/admin", () => ({
      createAdminClient: () => ({
        from: (table: string) => ({
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: table === "prospects" ? { id: "p1", first_name: "Léa", company: "Toits Léa", email: "lea@example.test", existing_site_url: "https://vieux.fr" } : intake }) }) }),
          insert: async () => { inserts.push(table); return { error: null }; },
        }),
      }),
    }));
  });

  it("emails a lead without an account a link to create their space", async () => {
    const { POST } = await import("@/app/api/admin/prospects/[id]/invite/route");
    const response = await POST(new Request("http://localhost/x", { method: "POST" }), { params: Promise.resolve({ id: "p1" }) });
    expect(response.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledWith({ email: "lea@example.test", name: "Léa" }, expect.any(String), expect.objectContaining({ cta: { label: "Créer mon espace", url: "https://feaseweb.fr/creer-mon-site" } }));
    expect(inserts).toEqual(["internal_notes", "activity_log"]);
  });

  it("refuses to invite someone who already has a space", async () => {
    intake = { id: "intake-1" };
    const { POST } = await import("@/app/api/admin/prospects/[id]/invite/route");
    const response = await POST(new Request("http://localhost/x", { method: "POST" }), { params: Promise.resolve({ id: "p1" }) });
    expect(response.status).toBe(409);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
