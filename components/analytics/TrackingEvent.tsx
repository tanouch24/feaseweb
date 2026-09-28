"use client";

import { useEffect } from "react";
import { trackEvent, type TrackingEventName } from "@/lib/analytics";

export function TrackingEvent({ name, eventId, params }: { name: TrackingEventName; eventId: string; params?: Record<string, string | number | boolean> }) {
  useEffect(() => { trackEvent(name, eventId, params); }, [name, eventId, params]);
  return null;
}

export function SubscriptionPaidTracker({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void fetch("/api/analytics/purchase", { method: "POST" }).then(async (response) => {
      if (!active || !response.ok) return;
      const body = await response.json().catch(() => null);
      if (body?.trackingEventId) trackEvent("subscription_paid", body.trackingEventId, { currency: "EUR", value: 49, transaction_id: body.transactionId ?? body.trackingEventId });
    }).catch(() => undefined);
    return () => { active = false; };
  }, [enabled]);
  return null;
}
