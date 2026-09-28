import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { CONSENT_COOKIE, META_PIXEL_ID, normalizeConsent, type TrackingEventName } from "@/lib/analytics";

type MetaUserData = { email?: string | null; phone?: string | null; externalId?: string | null };
type MetaEvent = {
  eventName: TrackingEventName;
  eventId: string;
  eventSourceUrl?: string;
  userData?: MetaUserData;
  customData?: Record<string, string | number | boolean>;
};

function hash(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? createHash("sha256").update(normalized).digest("hex") : undefined;
}

function phoneHash(value: string | null | undefined) {
  const normalized = value?.replace(/\D/g, "");
  return normalized ? createHash("sha256").update(normalized).digest("hex") : undefined;
}

async function hasMarketingConsent() {
  try {
    const raw = (await cookies()).get(CONSENT_COOKIE)?.value;
    if (!raw) return false;
    return normalizeConsent(JSON.parse(decodeURIComponent(raw))).marketing;
  } catch { return false; }
}

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

export async function sendMetaConversionEvent(event: MetaEvent) {
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  if (!token || !(await hasMarketingConsent())) return { sent: false as const, reason: "not_configured_or_not_consented" };

  const userData = event.userData ?? {};
  const body = {
    data: [{
      event_name: metaEventNames[event.eventName],
      event_time: Math.floor(Date.now() / 1000),
      event_id: event.eventId,
      action_source: "website",
      event_source_url: event.eventSourceUrl,
      user_data: {
        em: hash(userData.email),
        ph: phoneHash(userData.phone),
        external_id: hash(userData.externalId),
      },
      custom_data: event.customData,
    }],
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("meta_conversion_failed", { event: event.eventName, status: response.status });
      return { sent: false as const, reason: "provider_error" };
    }
    return { sent: true as const };
  } catch {
    console.error("meta_conversion_unreachable", { event: event.eventName });
    return { sent: false as const, reason: "network_error" };
  }
}
