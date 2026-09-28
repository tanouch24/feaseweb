export const GA4_MEASUREMENT_ID = "G-ZE1MDKS9WV";
export const META_PIXEL_ID = "1096173396474635";
export const CONSENT_COOKIE = "feaseweb_consent";
export const CONSENT_STORAGE_KEY = "feaseweb-consent";

export type ConsentState = { analytics: boolean; marketing: boolean };
export type TrackingEventName =
  | "configurator_started"
  | "configurator_completed"
  | "account_created"
  | "appointment_scheduled"
  | "prospect_approved"
  | "checkout_started"
  | "subscription_paid"
  | "production_info_completed"
  | "preview_ready"
  | "site_live";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: Window["fbq"];
  }
}

const defaultConsent: ConsentState = { analytics: false, marketing: false };
let consent: ConsentState = defaultConsent;
let gaReady = false;
let metaReady = false;
const pageViews = { analytics: "", marketing: "" };

export function normalizeConsent(value: unknown): ConsentState {
  if (!value || typeof value !== "object") return defaultConsent;
  const record = value as Record<string, unknown>;
  return { analytics: record.analytics === true, marketing: record.marketing === true };
}

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return consent;
  try {
    const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (saved) consent = normalizeConsent(JSON.parse(saved));
  } catch {
    consent = defaultConsent;
  }
  return consent;
}

function persistConsent(next: ConsentState) {
  consent = normalizeConsent(next);
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent)); } catch { /* Storage can be unavailable. */ }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent("feaseweb-consent-change", { detail: consent }));
}

export function setConsent(next: ConsentState) { persistConsent(next); }

function appendScript(id: string, src: string, onLoad: () => void) {
  if (document.getElementById(id)) { onLoad(); return; }
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  script.onload = onLoad;
  document.head.appendChild(script);
}

function initializeGa() {
  if ((gaReady && document.getElementById("feaseweb-ga4")) || typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  // The Google tag runtime expects the native Arguments object from the official snippet.
  window.gtag = window.gtag ?? function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  appendScript("feaseweb-ga4", `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`, () => undefined);
  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID, { send_page_view: false });
  gaReady = true;
}

function initializeMeta() {
  if ((metaReady && document.getElementById("feaseweb-meta-pixel")) || typeof window === "undefined") return;
  type MetaQueue = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: (...args: unknown[]) => void };
  const fbq = ((...args: unknown[]) => {
    const queue = fbq as MetaQueue;
    if (queue.callMethod) queue.callMethod(...args);
    else (queue.queue ??= []).push(args);
  }) as MetaQueue;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = window.fbq ?? fbq;
  window._fbq = window._fbq ?? window.fbq;
  window.fbq("init", META_PIXEL_ID);
  appendScript("feaseweb-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js", () => undefined);
  metaReady = true;
}

export function initializeTracking() {
  const current = getConsent();
  if (current.analytics) initializeGa();
  if (current.marketing) initializeMeta();
}

export function trackPageView(path: string) {
  const current = getConsent();
  if (current.analytics) {
    initializeGa();
    if (pageViews.analytics !== path) {
      window.gtag?.("event", "page_view", { page_location: window.location.href, page_path: path });
      pageViews.analytics = path;
    }
  }
  if (current.marketing) {
    initializeMeta();
    if (pageViews.marketing !== path) {
      window.fbq?.("track", "PageView");
      pageViews.marketing = path;
    }
  }
}

const gaEventNames: Record<TrackingEventName, string> = {
  configurator_started: "configurator_started",
  configurator_completed: "configurator_completed",
  account_created: "sign_up",
  appointment_scheduled: "appointment_scheduled",
  prospect_approved: "prospect_approved",
  checkout_started: "begin_checkout",
  subscription_paid: "purchase",
  production_info_completed: "production_info_completed",
  preview_ready: "preview_ready",
  site_live: "site_live",
};

const metaEventNames: Record<TrackingEventName, string> = {
  configurator_started: "configurator_started",
  configurator_completed: "configurator_completed",
  account_created: "CompleteRegistration",
  appointment_scheduled: "appointment_scheduled",
  prospect_approved: "prospect_approved",
  checkout_started: "InitiateCheckout",
  subscription_paid: "Purchase",
  production_info_completed: "production_info_completed",
  preview_ready: "preview_ready",
  site_live: "site_live",
};

export function trackEvent(name: TrackingEventName, eventId: string, params: EventParams = {}) {
  const current = getConsent();
  if (current.analytics) {
    initializeGa();
    window.gtag?.("event", gaEventNames[name], { ...params, event_id: eventId });
  }
  if (current.marketing) {
    initializeMeta();
    window.fbq?.("track", metaEventNames[name], params, { eventID: eventId });
  }
}
