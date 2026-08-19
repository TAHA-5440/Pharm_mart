"use server";

import { getSession } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import { isClientAnalyticsEvent } from "@/lib/analytics-events";

type Payload = Record<string, unknown>;

/**
 * Browser beacons only. Loop events (RFQ / quote / match) are written in server actions.
 * profile_view goes through recordSupplierProfileViewAction so the lifetime counter stays in sync.
 */
export async function recordClientEventAction(name: string, payload: Payload = {}) {
  if (!isClientAnalyticsEvent(name)) return;

  const session = await getSession();
  if (session?.role === "admin" && (name === "listing_view" || name === "search_query")) {
    return;
  }

  const supplierId = typeof payload.supplierId === "string" ? payload.supplierId : "";
  if (name === "listing_view" && session?.supplierOrgId && session.supplierOrgId === supplierId) {
    return;
  }

  await trackEvent(name, payload, session?.id ?? null);
}
