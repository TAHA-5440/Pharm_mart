import { prisma } from "@/lib/db";
import { ANALYTICS_EVENTS, EVENT_LABEL, type AnalyticsEventName } from "@/lib/analytics-events";

export function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function payloadRfqId(payload: string) {
  try {
    return String(JSON.parse(payload).rfqId ?? "");
  } catch {
    return "";
  }
}

function pkDay(d: Date) {
  return new Date(d.getTime() + 5 * 3600_000).toISOString().slice(0, 10);
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
}

function hoursBetween(from: Date, to: Date) {
  return (to.getTime() - from.getTime()) / 36e5;
}

const OPENED_STATUSES = ["open", "closed", "expired", "cancelled"] as const;

export type ReconcileRow = {
  name: AnalyticsEventName;
  label: string;
  events30: number;
  records30: number | null;
  note: string;
  status: "ok" | "events_ahead" | "records_ahead" | "na";
};

export async function loadLiquidity() {
  const since30 = daysAgo(30);
  const since90 = daysAgo(90);
  const sinceMonth = monthStart();

  const [
    buyers,
    suppliersApproved,
    rfqsMonthOpened,
    rfqsOpen,
    quotesMonth,
    qualifiedOpen,
    events30,
    eventsAll,
    recentEvents,
    activeBuyerRfqs,
    quotes30,
    matches30,
    openQualified,
    buyers90,
  ] = await Promise.all([
    prisma.buyerOrganisation.count(),
    prisma.supplierOrganisation.count({ where: { publicStatus: "approved" } }),
    prisma.rfq.count({
      where: {
        createdAt: { gte: sinceMonth },
        status: { in: [...OPENED_STATUSES] },
      },
    }),
    prisma.rfq.count({ where: { status: "open" } }),
    prisma.quotation.count({ where: { createdAt: { gte: sinceMonth } } }),
    prisma.rfq.count({ where: { status: "open", qualified: true } }),
    prisma.analyticsEvent.groupBy({
      by: ["name"],
      where: { createdAt: { gte: since30 } },
      _count: { _all: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["name"],
      _count: { _all: true },
    }),
    prisma.analyticsEvent.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, role: true } } },
    }),
    prisma.rfq.findMany({
      where: { createdAt: { gte: since30 } },
      select: { buyerOrgId: true },
      distinct: ["buyerOrgId"],
    }),
    prisma.quotation.findMany({
      where: { createdAt: { gte: since30 } },
      select: { supplierId: true, rfqId: true, createdAt: true },
    }),
    prisma.rfqMatch.findMany({
      where: { notifiedAt: { gte: since30 } },
      select: { supplierId: true, rfqId: true, notifiedAt: true },
    }),
    prisma.rfq.findMany({
      where: { status: "open", qualified: true },
      include: { _count: { select: { quotes: true } } },
    }),
    prisma.rfq.findMany({
      where: { createdAt: { gte: since90 } },
      select: { buyerOrgId: true },
    }),
  ]);

  const eventCount30: Record<string, number> = {};
  for (const row of events30) eventCount30[row.name] = row._count._all;
  const eventCountAll: Record<string, number> = {};
  for (const row of eventsAll) eventCountAll[row.name] = row._count._all;

  const quoteCounts = openQualified.map((r) => r._count.quotes);
  const quotesPerOpen =
    openQualified.length > 0
      ? quoteCounts.reduce((a, b) => a + b, 0) / openQualified.length
      : 0;
  const quoteBand = { zero: 0, low: 0, target: 0, high: 0 };
  for (const n of quoteCounts) {
    if (n === 0) quoteBand.zero += 1;
    else if (n < 3) quoteBand.low += 1;
    else if (n <= 5) quoteBand.target += 1;
    else quoteBand.high += 1;
  }

  const records30 = {
    rfq_submit: await prisma.rfq.count({ where: { createdAt: { gte: since30 } } }),
    rfq_open: await prisma.rfq.count({
      where: { createdAt: { gte: since30 }, status: { in: [...OPENED_STATUSES] } },
    }),
    rfq_match: matches30.length,
    quote_submit: quotes30.length,
    profile_view: eventCountAll.profile_view ?? 0,
  };

  const profileViewsSum =
    (
      await prisma.supplierOrganisation.aggregate({
        _sum: { profileViews: true },
      })
    )._sum.profileViews ?? 0;

  const notes: Record<AnalyticsEventName, string> = {
    profile_view: "30d events vs lifetime counter compared in the profile row below.",
    listing_view: "No listing-view table — events only.",
    catalogue_download: "No download table — events only.",
    search_query: "No search table — events only.",
    call_click: "No call table — events only.",
    rfq_submit: "Should match RFQs created in the window (including drafts/rejected).",
    rfq_open: "Records = RFQs created in-window that reached Open or beyond. Opens of older RFQs can make events ahead.",
    rfq_match: "One event per supplier notified. Should match RfqMatch rows in the window.",
    quote_submit: "Revises write another event against the same quotation row, so events can run ahead.",
    message_sent: "Step 13 — threads exist, send UI is not wired. Expect 0.",
  };

  const recordFor = (name: AnalyticsEventName): number | null => {
    if (name === "rfq_submit") return records30.rfq_submit;
    if (name === "rfq_open") return records30.rfq_open;
    if (name === "rfq_match") return records30.rfq_match;
    if (name === "quote_submit") return records30.quote_submit;
    return null;
  };

  const rows: ReconcileRow[] = ANALYTICS_EVENTS.map((name) => {
    const events = eventCount30[name] ?? 0;
    const records = recordFor(name);
    let status: ReconcileRow["status"] = "na";
    if (records != null) {
      if (events === records) status = "ok";
      else if (events > records) status = "events_ahead";
      else status = "records_ahead";
    }
    return {
      name,
      label: EVENT_LABEL[name],
      events30: events,
      records30: records,
      note: notes[name],
      status,
    };
  });

  const openEvents = await prisma.analyticsEvent.findMany({
    where: { name: "rfq_open", createdAt: { gte: since30 } },
    select: { payload: true, createdAt: true },
  });
  const quoteEvents = await prisma.analyticsEvent.findMany({
    where: { name: "quote_submit", createdAt: { gte: since30 } },
    select: { payload: true, createdAt: true },
  });

  const quotesByRfq = new Map<string, Date[]>();
  for (const q of quoteEvents) {
    const id = payloadRfqId(q.payload);
    if (!id) continue;
    const list = quotesByRfq.get(id) ?? [];
    list.push(q.createdAt);
    quotesByRfq.set(id, list);
  }
  for (const list of quotesByRfq.values()) list.sort((a, b) => a.getTime() - b.getTime());

  const firstDelays: number[] = [];
  const thirdDelays: number[] = [];
  for (const o of openEvents) {
    const id = payloadRfqId(o.payload);
    const times = quotesByRfq.get(id);
    if (!times?.length) continue;
    firstDelays.push(hoursBetween(o.createdAt, times[0]!));
    if (times[2]) thirdDelays.push(hoursBetween(o.createdAt, times[2]));
  }

  const matchedRfqs = new Set(matches30.map((m) => m.rfqId));
  const quotedRfqs = new Set(quotes30.map((q) => q.rfqId));
  const matchedThatQuoted = [...matchedRfqs].filter((id) => quotedRfqs.has(id)).length;
  const supplierResponseRate =
    matchedRfqs.size > 0 ? matchedThatQuoted / matchedRfqs.size : null;

  const byBuyer90 = new Map<string, number>();
  for (const r of buyers90) {
    byBuyer90.set(r.buyerOrgId, (byBuyer90.get(r.buyerOrgId) ?? 0) + 1);
  }
  const buyersWithOne = [...byBuyer90.values()].filter((n) => n >= 1).length;
  const buyersWithTwo = [...byBuyer90.values()].filter((n) => n >= 2).length;
  const buyerRepeatRate = buyersWithOne > 0 ? buyersWithTwo / buyersWithOne : null;

  const loopEvents = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: { gte: since30 },
      name: { in: ["rfq_submit", "rfq_open", "quote_submit"] },
    },
    select: { name: true, createdAt: true },
  });
  const dayMap = new Map<string, { rfqs: number; opened: number; quotes: number }>();
  for (let i = 29; i >= 0; i--) {
    const day = pkDay(daysAgo(i));
    dayMap.set(day, { rfqs: 0, opened: 0, quotes: 0 });
  }
  for (const ev of loopEvents) {
    const day = pkDay(ev.createdAt);
    const bucket = dayMap.get(day);
    if (!bucket) continue;
    if (ev.name === "rfq_submit") bucket.rfqs += 1;
    if (ev.name === "rfq_open") bucket.opened += 1;
    if (ev.name === "quote_submit") bucket.quotes += 1;
  }

  return {
    buyers,
    suppliersApproved,
    rfqsMonthOpened,
    rfqsOpen,
    quotesMonth,
    quotesPerOpen,
    qualifiedOpen,
    quoteBand,
    activeBuyers: activeBuyerRfqs.length,
    activeSuppliersQuoted: new Set(quotes30.map((q) => q.supplierId)).size,
    activeSuppliersMatched: new Set(matches30.map((m) => m.supplierId)).size,
    medianResponseHours: median(firstDelays),
    medianTimeToThreeHours: median(thirdDelays),
    supplierResponseRate,
    buyerRepeatRate,
    rows,
    profileViewsSum,
    profileViewEventsAll: eventCountAll.profile_view ?? 0,
    recentEvents,
    days: [...dayMap.entries()].map(([date, counts]) => ({ date, ...counts })),
    umamiId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim() || null,
    umamiScript: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim() || "https://cloud.umami.is/script.js",
  };
}
