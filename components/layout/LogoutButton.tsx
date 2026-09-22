"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/connexion"); }
  return <button type="button" onClick={logout} className="mt-8 text-sm text-ink-soft underline underline-offset-4 hover:text-ink">Se déconnecter</button>;
}
