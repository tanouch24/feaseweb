"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  async function logout() {
    try { await fetch("/api/auth/logout", { method: "POST", cache: "no-store" }); } finally { router.replace("/connexion"); router.refresh(); }
  }
  return <button type="button" onClick={logout} className={`text-sm text-ink-soft underline underline-offset-4 hover:text-ink ${className}`.trim()}>Se déconnecter</button>;
}
