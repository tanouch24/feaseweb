import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireClient } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_PRODUCTION_MEDIA_BYTES, PRODUCTION_MEDIA_BUCKET, PRODUCTION_MEDIA_TYPES, PRODUCTION_MIME_TYPES } from "@/lib/production";

const typeSchema = z.enum(PRODUCTION_MEDIA_TYPES);
const extensionByMime: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "application/pdf": "pdf" };

async function context() {
  const current = await requireClient();
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) return { current, supabase: null, admin: null, client: null, intake: null };
  const { data: client } = await supabase.from("clients").select("id").eq("user_id", current.user.id).maybeSingle();
  const { data: intake } = client ? await supabase.from("project_intakes").select("id").eq("client_id", client.id).maybeSingle() : { data: null };
  return { current, supabase, admin, client, intake };
}

export async function GET() {
  const { admin, client } = await context();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  if (!client) return NextResponse.json({ error: "Dossier client introuvable." }, { status: 404 });
  const { data, error } = await admin.from("project_media").select("id, original_name, media_type, mime_type, size_bytes, status, created_at, storage_path").eq("client_id", client.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Impossible de charger les médias." }, { status: 500 });
  const media = await Promise.all((data ?? []).map(async (item) => {
    const { data: signed } = await admin.storage.from(PRODUCTION_MEDIA_BUCKET).createSignedUrl(item.storage_path, 300);
    return { id: item.id, original_name: item.original_name, media_type: item.media_type, mime_type: item.mime_type, size_bytes: item.size_bytes, status: item.status, created_at: item.created_at, signed_url: signed?.signedUrl ?? null };
  }));
  return NextResponse.json({ media });
}

export async function POST(request: Request) {
  const { admin, client, intake } = await context();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  if (!client || !intake) return NextResponse.json({ error: "Dossier client introuvable." }, { status: 404 });
  const formData = await request.formData();
  const fileValue = formData.get("file");
  const mediaType = typeSchema.safeParse(formData.get("mediaType"));
  if (!(fileValue instanceof File) || !mediaType.success) return NextResponse.json({ error: "Fichier ou catégorie invalide." }, { status: 400 });
  if (!PRODUCTION_MIME_TYPES.includes(fileValue.type as typeof PRODUCTION_MIME_TYPES[number])) return NextResponse.json({ error: "Ce format de fichier n'est pas accepté." }, { status: 415 });
  if (fileValue.size <= 0 || fileValue.size > MAX_PRODUCTION_MEDIA_BYTES) return NextResponse.json({ error: "Le fichier doit peser au maximum 10 Mo." }, { status: 413 });
  const extension = extensionByMime[fileValue.type];
  const path = `${client.id}/${intake.id}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await admin.storage.from(PRODUCTION_MEDIA_BUCKET).upload(path, await fileValue.arrayBuffer(), { contentType: fileValue.type, upsert: false });
  if (uploadError) { console.error("[production] media upload failed", { code: uploadError.name, message: uploadError.message }); return NextResponse.json({ error: "Impossible d'ajouter ce fichier." }, { status: 500 }); }
  const { data, error: insertError } = await admin.from("project_media").insert({ client_id: client.id, project_intake_id: intake.id, storage_path: path, original_name: fileValue.name.slice(0, 255), media_type: mediaType.data, mime_type: fileValue.type, size_bytes: fileValue.size, status: "recu" }).select("id, original_name, media_type, mime_type, size_bytes, status, created_at").single();
  if (insertError) { await admin.storage.from(PRODUCTION_MEDIA_BUCKET).remove([path]); console.error("[production] media metadata failed", { code: insertError.code, message: insertError.message }); return NextResponse.json({ error: "Impossible d'enregistrer ce fichier." }, { status: 500 }); }
  return NextResponse.json({ media: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { admin, client } = await context();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  if (!client) return NextResponse.json({ error: "Dossier client introuvable." }, { status: 404 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string") return NextResponse.json({ error: "Média invalide." }, { status: 400 });
  const { data: media } = await admin.from("project_media").select("id, storage_path").eq("id", body.id).eq("client_id", client.id).maybeSingle();
  if (!media) return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
  const { error: storageError } = await admin.storage.from(PRODUCTION_MEDIA_BUCKET).remove([media.storage_path]);
  if (storageError) { console.error("[production] media storage delete failed", { code: storageError.name, message: storageError.message }); return NextResponse.json({ error: "Impossible de supprimer le fichier pour le moment." }, { status: 502 }); }
  const { error } = await admin.from("project_media").delete().eq("id", media.id).eq("client_id", client.id);
  if (error) { console.error("[production] media metadata delete failed", { code: error.code, message: error.message }); return NextResponse.json({ error: "Le fichier a été retiré du stockage mais sa référence doit être nettoyée par FeaseWeb." }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
