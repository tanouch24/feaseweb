import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { mapBackofficeRows } from "@/lib/backoffice-mappers";

const tables = ["prospects", "clients", "sites", "subscriptions", "payments", "modification_requests", "seo_actions", "seo_metrics", "domains", "internal_notes", "activity_log"] as const;

export async function GET() {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const orderColumns: Record<string, string> = { activity_log: "occurred_at", seo_actions: "date", seo_metrics: "synced_at", domains: "domain", subscriptions: "updated_at" };
  const results = await Promise.all(tables.map(async (table) => { const result = await supabase.from(table).select("*").order(orderColumns[table] ?? "created_at", { ascending: false }).limit(500); return [table, result] as const; }));
  const failure = results.find(([, result]) => result.error);
  if (failure) { console.error("admin_bootstrap_failed", failure[0]); return NextResponse.json({ error: "Impossible de charger les données du back-office." }, { status: 500 }); }
  const rows = Object.fromEntries(results.map(([table, result]) => [table === "modification_requests" ? "requests" : table === "seo_actions" ? "seoActions" : table === "seo_metrics" ? "seoMetrics" : table === "activity_log" ? "activity" : table, result.data ?? []]));
  return NextResponse.json({ data: mapBackofficeRows(rows) });
}
