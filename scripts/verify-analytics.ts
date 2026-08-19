import { loadEnvConfig } from "@next/env";
import { ANALYTICS_EVENTS, EVENT_LABEL, type AnalyticsEventName } from "../lib/analytics-events";
import { writeAnalyticsEvent } from "../lib/analytics-write";
import { loadLiquidity } from "../lib/liquidity";
import { matchSuppliersForRfq } from "../lib/matching";
import { prisma } from "../lib/db";

loadEnvConfig(process.cwd());

const RUN = `verify-${Date.now()}`;
const TITLE = `[verify-analytics] ${RUN}`;

async function counts() {
  const rows = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    _count: { _all: true },
  });
  const map = Object.fromEntries(ANALYTICS_EVENTS.map((n) => [n, 0])) as Record<AnalyticsEventName, number>;
  for (const row of rows) {
    if (row.name in map) map[row.name as AnalyticsEventName] = row._count._all;
  }
  const [rfqs, opens, matches, quotes, profileViews] = await Promise.all([
    prisma.rfq.count(),
    prisma.rfq.count({ where: { status: { in: ["open", "closed", "expired", "cancelled"] } } }),
    prisma.rfqMatch.count(),
    prisma.quotation.count(),
    prisma.supplierOrganisation.aggregate({ _sum: { profileViews: true } }),
  ]);
  return {
    events: map,
    records: {
      rfq_submit: rfqs,
      rfq_open: opens,
      rfq_match: matches,
      quote_submit: quotes,
      profile_view: profileViews._sum.profileViews ?? 0,
    },
  };
}

function line(label: string, events: number, records: string | number, check: string) {
  return `${label.padEnd(22)} ${String(events).padStart(8)}  ${String(records).padStart(8)}  ${check}`;
}

async function printSnapshot(title: string) {
  const live = await loadLiquidity();
  console.log(`\n=== ${title} ===`);
  console.log(`${"Event".padEnd(22)} ${"Events30".padStart(8)}  ${"Records".padStart(8)}  check`);
  console.log(`${"".padEnd(22)} ${"".padStart(8, "-")}  ${"".padStart(8, "-")}  ${"".padStart(5, "-")}`);
  for (const row of live.rows) {
    const check =
      row.status === "ok"
        ? "MATCH"
        : row.status === "na"
          ? "n/a"
          : row.status === "events_ahead"
            ? "events ahead"
            : "records ahead";
    console.log(line(row.name, row.events30, row.records30 ?? "—", check));
  }
  console.log(
    `\nProfile views all-time: events ${live.profileViewEventsAll} vs counter ${live.profileViewsSum} → ${
      live.profileViewEventsAll === live.profileViewsSum ? "MATCH" : "DRIFT"
    }`,
  );
  console.log(
    `KPIs: active buyers ${live.activeBuyers} · quoted suppliers ${live.activeSuppliersQuoted} · RFQs opened this month ${live.rfqsMonthOpened} · quotes/open ${live.quotesPerOpen.toFixed(1)}`,
  );
  console.log(
    `Umami: ${live.umamiId ? `configured (${live.umamiId})` : "not configured — Postgres is enough"}`,
  );
}

async function cleanup(rfqId: string | null, viewedSupplierId: string | null) {
  if (rfqId) {
    await prisma.rfq.delete({ where: { id: rfqId } }).catch(() => undefined);
  }
  await prisma.analyticsEvent.deleteMany({
    where: { payload: { contains: RUN } },
  });
  if (viewedSupplierId) {
    const org = await prisma.supplierOrganisation.findUnique({
      where: { id: viewedSupplierId },
      select: { profileViews: true },
    });
    if (org && org.profileViews > 0) {
      await prisma.supplierOrganisation.update({
        where: { id: viewedSupplierId },
        data: { profileViews: { decrement: 1 } },
      });
    }
  }
  const leftover = await prisma.rfq.findMany({
    where: { title: { startsWith: "[verify-analytics]" } },
    select: { id: true },
  });
  for (const row of leftover) {
    await prisma.rfq.delete({ where: { id: row.id } }).catch(() => undefined);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing. Copy .env.example → .env");
    process.exit(1);
  }

  await printSnapshot("Before (live DB, last 30 days vs records)");

  const leftover = await prisma.rfq.findMany({
    where: { title: { startsWith: "[verify-analytics]" } },
    select: { id: true },
  });
  for (const row of leftover) {
    await prisma.rfq.delete({ where: { id: row.id } }).catch(() => undefined);
  }

  const before = await counts();
  let rfqId: string | null = null;
  let viewedSupplierId: string | null = null;
  const failures: string[] = [];

  try {
    const buyer = await prisma.user.findUnique({
      where: { email: "maria.s@example.com" },
      include: { buyerOrg: true },
    });
    const supplierUser = await prisma.user.findUnique({
      where: { email: "laura.c@example.net" },
    });
    const admin = await prisma.user.findUnique({ where: { email: "sarah.b@example.net" } });
    const abc = await prisma.supplierOrganisation.findUnique({
      where: { slug: "abc-engineering" },
    });
    const product = await prisma.productListing.findFirst({
      where: { slug: "ss316-mixing-vessels", status: "live" },
    });
    if (!buyer?.buyerOrgId || !supplierUser?.supplierOrgId || !admin || !abc || !product) {
      throw new Error("Seed users/listings missing. Run: npx prisma db seed");
    }

    if (!abc.catalogueUrl) {
      await prisma.supplierOrganisation.update({
        where: { id: abc.id },
        data: { catalogueUrl: "/demo/abc-engineering-catalogue.txt" },
      });
    }

    viewedSupplierId = abc.id;

    const closing = new Date();
    closing.setDate(closing.getDate() + 14);
    const rfq = await prisma.rfq.create({
      data: {
        buyerOrgId: buyer.buyerOrgId,
        buyerUserId: buyer.id,
        title: TITLE,
        description: "Verify-analytics Scenario A: jacketed SS316 mixing vessel, 1000 L, Lahore plant.",
        quantity: "1 vessel",
        city: "Lahore",
        neededBy: "30 days",
        industry: "pharmaceutical",
        status: "submitted",
        closingAt: closing,
      },
    });
    rfqId = rfq.id;
    await writeAnalyticsEvent(
      "rfq_submit",
      { rfqId: rfq.id, verifyRun: RUN, city: "Lahore" },
      buyer.id,
    );

    const matchedIds = await matchSuppliersForRfq(rfq.id);
    await prisma.rfq.update({
      where: { id: rfq.id },
      data: { status: "open", qualified: true },
    });
    await writeAnalyticsEvent(
      "rfq_open",
      { rfqId: rfq.id, matchCount: matchedIds.length, verifyRun: RUN },
      admin.id,
    );
    for (const supplierId of matchedIds) {
      await writeAnalyticsEvent("rfq_match", { rfqId: rfq.id, supplierId, verifyRun: RUN }, admin.id);
    }

    if (!matchedIds.includes(abc.id)) {
      failures.push("ABC Engineering was not matched — seed categories may have changed");
    } else {
      await prisma.quotation.create({
        data: {
          rfqId: rfq.id,
          supplierId: abc.id,
          userId: supplierUser.id,
          pricePkr: 1850000,
          deliveryDays: 45,
          warranty: "12 months",
          status: "submitted",
        },
      });
      await writeAnalyticsEvent(
        "quote_submit",
        { rfqId: rfq.id, supplierId: abc.id, revised: false, verifyRun: RUN },
        supplierUser.id,
      );
    }

    await prisma.supplierOrganisation.update({
      where: { id: abc.id },
      data: { profileViews: { increment: 1 } },
    });
    await writeAnalyticsEvent(
      "profile_view",
      { supplierId: abc.id, slug: abc.slug, verifyRun: RUN },
      buyer.id,
    );
    await writeAnalyticsEvent(
      "listing_view",
      { kind: "product", listingId: product.id, slug: product.slug, supplierId: abc.id, verifyRun: RUN },
      buyer.id,
    );
    await writeAnalyticsEvent(
      "search_query",
      { q: "mixing vessel", type: "all", results: 1, verifyRun: RUN },
      buyer.id,
    );
    await writeAnalyticsEvent("call_click", { supplierId: abc.id, verifyRun: RUN }, buyer.id);
    await writeAnalyticsEvent(
      "catalogue_download",
      { supplierId: abc.id, slug: abc.slug, verifyRun: RUN },
      buyer.id,
    );

    const after = await counts();
    const expectEvent: Partial<Record<AnalyticsEventName, number>> = {
      rfq_submit: 1,
      rfq_open: 1,
      rfq_match: matchedIds.length,
      quote_submit: matchedIds.includes(abc.id) ? 1 : 0,
      profile_view: 1,
      listing_view: 1,
      search_query: 1,
      call_click: 1,
      catalogue_download: 1,
      message_sent: 0,
    };
    const expectRecord = {
      rfq_submit: 1,
      rfq_open: 1,
      rfq_match: matchedIds.length,
      quote_submit: matchedIds.includes(abc.id) ? 1 : 0,
      profile_view: 1,
    };

    console.log("\n=== Scenario A write (this run) ===");
    console.log(`${"Event".padEnd(22)} ${"Δ events".padStart(8)}  ${"Δ records".padStart(8)}  result`);
    for (const name of ANALYTICS_EVENTS) {
      const dEvent = after.events[name] - before.events[name];
      const wantE = expectEvent[name] ?? 0;
      const recKey = name as keyof typeof expectRecord;
      const hasRecord = recKey in expectRecord;
      const dRec = hasRecord
        ? after.records[recKey] - before.records[recKey]
        : null;
      const wantR = hasRecord ? expectRecord[recKey] : null;
      const eventOk = dEvent === wantE;
      const recOk = wantR == null || dRec === wantR;
      const sideBySide =
        !hasRecord ? "n/a" : dEvent === dRec ? "events = records" : `events ${dEvent} / records ${dRec}`;
      const ok = eventOk && recOk;
      if (!ok) {
        failures.push(
          `${name}: events ${dEvent} (want ${wantE})${hasRecord ? `, records ${dRec} (want ${wantR})` : ""}`,
        );
      }
      console.log(
        `${name.padEnd(22)} ${String(dEvent).padStart(8)}  ${String(dRec ?? "—").padStart(8)}  ${
          ok ? "PASS" : "FAIL"
        }  ${sideBySide}  ${EVENT_LABEL[name]}`,
      );
    }
    console.log(`Matched suppliers: ${matchedIds.length}`);
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
    console.error(error);
  } finally {
    await cleanup(rfqId, viewedSupplierId);
  }

  await printSnapshot("After cleanup (DB restored)");

  if (failures.length) {
    console.error("\nVERIFY FAILED");
    for (const f of failures) console.error(` - ${f}`);
    process.exit(1);
  }
  console.log("\nVERIFY PASSED — Scenario A writes events that match RFQ / match / quote / profile-view records.");
  console.log("Next: log in as sarah.b@example.net and open /admin/analytics for the same table in the UI.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
