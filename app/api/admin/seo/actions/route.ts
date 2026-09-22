import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ siteId: z.string().uuid(), action: z.string().trim().min(1).max(180), description: z.string().trim().max(2000).default("") });
export async function POST(request: Request) { const auth = await requireApiAdmin(); if ("response" in auth) return auth.response; const supabase = await createClient(); if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Action SEO invalide." }, { status: 422 }); const { data, error } = await supabase.from("seo_actions").insert({ site_id: parsed.data.siteId, action: parsed.data.action, description: parsed.data.description, status: "terminee" }).select("id").single(); if (error) return NextResponse.json({ error: "Impossible d'enregistrer l'action SEO." }, { status: 500 }); await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "seo_action", entity_id: data.id, message: parsed.data.action }); return NextResponse.json({ ok: true }); }
