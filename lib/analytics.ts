import { getSession } from "@/lib/auth";
import { type AnalyticsEventName, isClientAnalyticsEvent } from "@/lib/analytics-events";
import { writeAnalyticsEvent } from "@/lib/analytics-write";
import { apexOrigin } from "@/lib/site";

type Payload = Record<string, unknown>;

export { writeAnalyticsEvent } from "@/lib/analytics-write";

export async function trackEvent(
  name: AnalyticsEventName,
  payload: Payload = {},
  userId?: string | null,
) {
  let actor = userId;
  if (actor === undefined) {
    try {
      const session = await getSession();
      actor = session?.id ?? null;
    } catch {
      actor = null;
    }
  }
  await writeAnalyticsEvent(name, payload, actor);
  // Client beacons already call umami.track for browser events + profile_view.
  if (!isClientAnalyticsEvent(name) && name !== "profile_view") void sendUmamiEvent(name, payload);
}

function umamiConfig() {
  const website = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  const script = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim() || "https://cloud.umami.is/script.js";
  if (!website) return null;
  let collect = process.env.UMAMI_COLLECT_URL?.trim();
  if (!collect) {
    try {
      collect = new URL("/api/send", script).toString();
    } catch {
      collect = "https://cloud.umami.is/api/send";
    }
  }
  return { website, collect };
}

async function sendUmamiEvent(name: string, payload: Payload) {
  const cfg = umamiConfig();
  if (!cfg) return;
  try {
    await fetch(cfg.collect, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "ProcureX/1.0" },
      body: JSON.stringify({
        type: "event",
        payload: {
          website: cfg.website,
          hostname: new URL(apexOrigin()).hostname,
          language: "en-PK",
          url: "/",
          name,
          data: payload,
        },
      }),
    });
  } catch {
    // First-party Postgres is the source of truth. Umami is optional.
  }
}
