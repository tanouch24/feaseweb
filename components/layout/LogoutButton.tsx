"use client";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ className = "" }: { className?: string }) {
  async function logout() {
    const supabase = createClient();
    void supabase?.auth.signOut().catch(() => undefined);
    try { await fetch("/api/auth/logout", { method: "POST", cache: "no-store", credentials: "same-origin", keepalive: true }); } finally { window.location.replace("/connexion"); }
  }
  return <button type="button" onClick={logout} className={`text-sm text-ink-soft underline underline-offset-4 hover:text-ink ${className}`.trim()}>Se déconnecter</button>;
}
