import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/site-config";
import { emailSchema } from "@/lib/validation";

function invitationRedirect() {
  return new URL("/auth/callback?next=/activation-compte", siteUrl).toString();
}

async function findUserByEmail(admin: NonNullable<ReturnType<typeof createAdminClient>>, email: string) {
  for (let page = 1; ; page += 1) {
    const result = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (result.error) return { user: null, error: result.error };
    const user = result.data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user || result.data.users.length < 1000) return { user: user ?? null, error: null };
  }
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const { id } = await params;
  const { data: client, error: clientError } = await supabase.from("clients").select("id, email, user_id, access_status").eq("id", id).maybeSingle();
  if (clientError || !client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
  const email = client.email.trim().toLowerCase();
  if (!emailSchema.safeParse({ email }).success) return NextResponse.json({ error: "L'email du client est invalide." }, { status: 422 });

  let userId = client.user_id as string | null;
  let existingUser: Awaited<ReturnType<typeof admin.auth.admin.getUserById>>["data"]["user"] = null;
  let createdUser = false;
  if (userId) {
    const existing = await admin.auth.admin.getUserById(userId);
    if (existing.error || !existing.data.user || existing.data.user.email?.toLowerCase() !== email) {
      return NextResponse.json({ error: "L'association du compte client doit être vérifiée manuellement." }, { status: 409 });
    }
    existingUser = existing.data.user;
  } else {
    const lookup = await findUserByEmail(admin, email);
    if (lookup.error) return NextResponse.json({ error: "Impossible de vérifier les comptes existants." }, { status: 500 });
    if (lookup.user) { existingUser = lookup.user; userId = lookup.user.id; }
    if (!userId) {
      const invited = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: invitationRedirect() });
      if (invited.error || !invited.data.user) return NextResponse.json({ error: "Impossible d'envoyer l'invitation." }, { status: 502 });
      userId = invited.data.user.id;
      createdUser = true;
    }
  }

  const { data: linkedClient } = await admin.from("clients").select("id").eq("user_id", userId).neq("id", id).maybeSingle();
  if (linkedClient) return NextResponse.json({ error: "Ce compte Auth est déjà associé à un autre client." }, { status: 409 });
  const { data: profile } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profile?.role === "admin") return NextResponse.json({ error: "Un compte administrateur ne peut pas être associé comme client." }, { status: 409 });
  const { error: profileError } = await admin.from("profiles").upsert({ id: userId, email, role: "client" }, { onConflict: "id" });
  if (profileError) return NextResponse.json({ error: "Impossible de préparer le profil client." }, { status: 500 });
  const now = new Date().toISOString();
  const alreadyActive = Boolean(existingUser?.email_confirmed_at) || client.access_status === "actif";
  const linkUpdate = client.user_id ? { error: null } : await supabase.from("clients").update({ user_id: userId, access_status: alreadyActive ? "actif" : "invitation_envoyee", ...(alreadyActive ? { activated_at: now } : { invited_at: now }) }).eq("id", id).is("user_id", null);
  const linkError = linkUpdate.error;
  if (linkError) {
    if (createdUser) await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Impossible d'associer le compte au client." }, { status: 500 });
  }
  if (alreadyActive) return NextResponse.json({ status: "actif" });
  if (!createdUser) {
    const resent = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: invitationRedirect() });
    if (resent.error) return NextResponse.json({ error: "Ce compte existe déjà ; l'invitation doit être renvoyée depuis Supabase Auth." }, { status: 409 });
  }
  await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "client", entity_id: id, message: "Invitation espace client envoyée." });
  return NextResponse.json({ status: "invitation_envoyee" });
}
