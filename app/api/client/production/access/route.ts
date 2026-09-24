import { NextResponse } from "next/server";
import { z } from "zod";
import { requireClient } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  category: z.enum(["cms", "hebergement", "domaine", "dns"]),
  clientChoice: z.enum(["connait_acces", "partiel", "ne_sait_pas", "agence", "non_necessaire"]),
  clientNote: z.string().trim().max(1000).optional().nullable(),
});

export async function PATCH(request: Request) {
  const current = await requireClient();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const { data: client } = await supabase.from("clients").select("id").eq("user_id", current.user.id).maybeSingle();
  const { data: intake } = client ? await supabase.from("project_intakes").select("id").eq("client_id", client.id).maybeSingle() : { data: null };
  if (!intake) return NextResponse.json({ error: "Dossier client introuvable." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Choix d'accès invalide." }, { status: 400 });
  const { category, clientChoice, clientNote } = parsed.data;
  const { error } = await supabase.from("project_access_requirements").upsert({ project_intake_id: intake.id, category, client_choice: clientChoice === "non_necessaire" ? null : clientChoice, client_note: clientNote ?? null }, { onConflict: "project_intake_id,category" });
  if (error) return NextResponse.json({ error: "Impossible d'enregistrer ce choix." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
