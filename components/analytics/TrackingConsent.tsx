"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getConsent, initializeTracking, setConsent, trackPageView, type ConsentState } from "@/lib/analytics";

const emptyConsent: ConsentState = { analytics: false, marketing: false };

export function TrackingConsent() {
  const [consent, setLocalConsent] = useState<ConsentState>(() => getConsent());
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return !window.localStorage.getItem("feaseweb-consent"); } catch { return true; }
  });
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentState>(() => getConsent());
  const [saved, setSaved] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onConsent = (event: Event) => {
      const next = (event as CustomEvent<ConsentState>).detail;
      setLocalConsent(next);
      setDraft(next);
      setVisible(false);
    };
    const onOpenPreferences = () => {
      setSaved(false);
      setDraft(getConsent());
      setPreferencesOpen(true);
      setVisible(true);
    };
    window.addEventListener("feaseweb-consent-change", onConsent);
    window.addEventListener("feaseweb-open-consent", onOpenPreferences);
    return () => {
      window.removeEventListener("feaseweb-consent-change", onConsent);
      window.removeEventListener("feaseweb-open-consent", onOpenPreferences);
    };
  }, []);

  useEffect(() => {
    if (!pathname || typeof window === "undefined") return;
    initializeTracking();
    trackPageView(`${pathname}${window.location.search}`);
  }, [pathname, consent]);

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 4000);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  function save(next: ConsentState) {
    setConsent(next);
    setLocalConsent(next);
    setDraft(next);
    setVisible(false);
    setPreferencesOpen(false);
    setSaved(true);
  }

  const protectedSurface = pathname?.startsWith("/admin") || pathname?.startsWith("/espace-client");
  return <>
    {!protectedSurface && saved && <p className="fixed bottom-4 left-4 z-50 rounded-sm border border-line bg-white px-3 py-2 text-xs text-ink shadow-lg" role="status" aria-live="polite">Vos préférences ont été enregistrées.</p>}
    {!protectedSurface && visible && <aside className="fixed inset-x-4 bottom-4 z-50 max-w-xl rounded-sm border border-line bg-white p-5 shadow-lg md:left-6 md:right-auto" role="dialog" aria-label="Préférences de confidentialité"><p className="text-sm font-semibold text-ink">Votre confidentialité compte</p><p className="mt-2 text-sm leading-6 text-ink-soft">FeaseWeb utilise des outils de mesure et de marketing uniquement avec votre accord. Vous pouvez modifier votre choix à tout moment.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" className="rounded-sm border border-line px-3 py-2 text-sm" onClick={() => save(emptyConsent)}>Refuser</button><button type="button" className="rounded-sm border border-brand px-3 py-2 text-sm text-brand" onClick={() => setPreferencesOpen((value) => !value)}>Choisir</button><button type="button" className="rounded-sm bg-brand px-3 py-2 text-sm font-medium text-white" onClick={() => save({ analytics: true, marketing: true })}>Tout accepter</button></div>{preferencesOpen && <div className="mt-4 space-y-3 border-t border-line pt-4"><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={draft.analytics} onChange={(event) => setDraft((value) => ({ ...value, analytics: event.target.checked }))} /><span><strong>Mesure d’audience</strong><br /><span className="text-ink-soft">Aide FeaseWeb à comprendre les visites et le parcours.</span></span></label><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={draft.marketing} onChange={(event) => setDraft((value) => ({ ...value, marketing: event.target.checked }))} /><span><strong>Marketing</strong><br /><span className="text-ink-soft">Permet de mesurer les campagnes publicitaires.</span></span></label><button type="button" className="rounded-sm bg-brand px-3 py-2 text-sm font-medium text-white" onClick={() => save(draft)}>Enregistrer mes choix</button></div>}</aside>}
  </>;
}
