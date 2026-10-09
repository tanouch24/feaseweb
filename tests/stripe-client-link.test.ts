import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {};

// Faux client Supabase minimal : select/eq/maybeSingle/single, insert, update.
function table(name: string) {
  const filters: [string, unknown][] = [];
  let pendingInsert: Row | null = null;
  let pendingUpdate: Row | null = null;
  const rows = () => (db[name] ??= []).filter((r) => filters.every(([k, v]) => r[k] === v));
  const api = {
    select: () => api,
    eq: (k: string, v: unknown) => {
      filters.push([k, v]);
      if (pendingUpdate) rows().forEach((r) => Object.assign(r, pendingUpdate));
      return api;
    },
    insert: (row: Row) => {
      pendingInsert = { id: `${name}-${(db[name] ??= []).length + 1}`, ...row };
      db[name].push(pendingInsert);
      return api;
    },
    update: (row: Row) => {
      pendingUpdate = row;
      return api;
    },
    maybeSingle: async () => ({ data: rows()[0] ?? null, error: null }),
    single: async () => (pendingInsert ? { data: pendingInsert, error: null } : { data: rows()[0] ?? null, error: null }),
    then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
  };
  return api;
}

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: table }) }));

import { ensureClientForProject } from "@/lib/stripe/sync";

beforeEach(() => {
  for (const k of Object.keys(db)) delete db[k];
  db.project_intakes = [{ id: "intake-1", user_id: "user-1", prospect_id: "prospect-1", company: "Dupont", first_name: "A", last_name: "B", email: "a@b.fr", phone: null, client_id: null, completed_at: null }];
  db.prospects = [{ id: "prospect-1", status: "nouveau" }];
});

describe("ensureClientForProject", () => {
  it("links the new client to its prospect so the back-office does not show it twice", async () => {
    const clientId = await ensureClientForProject("intake-1");
    expect(clientId).toBeTruthy();
    expect(db.clients).toHaveLength(1);
    expect(db.clients[0].prospect_id).toBe("prospect-1");
    expect(db.prospects[0].status).toBe("gagne");
  });

  it("backfills the prospect link on a client created earlier without it", async () => {
    db.clients = [{ id: "client-old", user_id: "user-1", prospect_id: null }];
    const clientId = await ensureClientForProject("intake-1");
    expect(clientId).toBe("client-old");
    expect(db.clients).toHaveLength(1);
    expect(db.clients[0].prospect_id).toBe("prospect-1");
  });
});
