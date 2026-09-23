import { describe, expect, it } from "vitest";
import { clientRequestSchema, clientUpdatePatchSchema, clientUpdateSchema } from "@/lib/validation";
import { mapBackofficeRows } from "@/lib/backoffice-mappers";

describe("client service activity", () => {
  it("validates and normalizes an admin update without accepting arbitrary fields", () => {
    const result = clientUpdateSchema.safeParse({ clientId: "11111111-1111-4111-8111-111111111111", siteId: null, category: "seo", title: "Optimisation locale", description: "Action réellement effectuée.", status: "termine", visibleToClient: true, activityDate: "2026-09-23", ignored: "nope" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toMatchObject({ client_id: "11111111-1111-4111-8111-111111111111", visible_to_client: true, status: "termine" });
  });

  it("rejects an invalid update and protects request length validation", () => {
    expect(clientUpdateSchema.safeParse({ clientId: "not-a-uuid", category: "seo", title: "", description: "", status: "termine", visibleToClient: true, activityDate: "today" }).success).toBe(false);
    expect(clientRequestSchema.safeParse({ title: "Demande", category: "Site", message: "ok" }).success).toBe(true);
    expect(clientRequestSchema.safeParse({ title: "", category: "Site", message: "ok" }).success).toBe(false);
  });

  it("maps visibility and title as explicit business fields", () => {
    const data = mapBackofficeRows({ clientUpdates: [{ id: "u1", client_id: "c1", site_id: null, category: "maintenance", title: "Contrôle SSL", description: "Contrôle réalisé.", status: "termine", visible_to_client: false, activity_date: "2026-09-23", created_at: "2026-09-23T10:00:00Z", updated_at: "2026-09-23T10:00:00Z" }], requests: [{ id: "r1", client_id: "c1", site_id: "s1", title: "Horaires", category: "Contenu", message: "Mettre à jour.", created_at: "2026-09-23T10:00:00Z", attachments: [], priority: "normale", status: "recue" }] });
    expect(data.clientUpdates[0]).toMatchObject({ clientId: "c1", visibleToClient: false, title: "Contrôle SSL" });
    expect(data.requests[0].title).toBe("Horaires");
  });

  it("maps admin internal notes from the bootstrap alias", () => {
    const data = mapBackofficeRows({ clients: [{ id: "c1", first_name: "QA", last_name: "Client", company: "QA", email: "qa@example.test", phone: "", status: "actif", started_at: "2026-09-23T00:00:00Z" }], internalNotes: [{ id: "n1", client_id: "c1", body: "SECRET QA INTERNE" }] });
    expect(data.clients[0].notes).toEqual(["SECRET QA INTERNE"]);
  });

  it("allows partial admin changes without making clientId mutable", () => {
    const result = clientUpdatePatchSchema.safeParse({ visibleToClient: false, status: "en_cours" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ visible_to_client: false, status: "en_cours" });
  });
});
