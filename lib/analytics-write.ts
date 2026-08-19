import { prisma } from "@/lib/db";
import type { AnalyticsEventName } from "@/lib/analytics-events";

type Payload = Record<string, unknown>;

/** First-party write. Never throws — the RFQ loop must not fail because analytics is down. */
export async function writeAnalyticsEvent(
  name: AnalyticsEventName,
  payload: Payload = {},
  userId?: string | null,
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name,
        userId: userId ?? null,
        payload: JSON.stringify(payload),
      },
    });
  } catch (error) {
    console.error("[analytics] write failed", name, error);
  }
}
