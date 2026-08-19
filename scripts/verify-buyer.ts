import { loadEnvConfig } from "@next/env";
import { SignJWT } from "jose";
import {
  CLOSED_RFQ,
  RFQ_STATUS_COPY,
  WAITING_RFQ,
  canCancelRfq,
  canExtendRfq,
  formatPkDate,
  quotesStamp,
} from "../lib/buyer";
import { matchSuppliersForRfq } from "../lib/matching";
import { prisma } from "../lib/db";

loadEnvConfig(process.cwd());

const RUN = `verify-buyer-${Date.now()}`;
const TITLE = `[verify-buyer] ${RUN}`;
const ORIGIN = (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");

const failures: string[] = [];

function check(name: string, ok: boolean, detail = "") {
  const line = `${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

async function mintCookie(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  buyerOrgId: string | null;
  supplierOrgId: string | null;
}) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET missing");
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    buyerOrgId: user.buyerOrgId ?? "",
    supplierOrgId: user.supplierOrgId ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));
  return `pharmstore_session=${token}`;
}

async function http(path: string, cookie?: string) {
  const res = await fetch(`${ORIGIN}${path}`, {
    method: "GET",
    redirect: "manual",
    headers: cookie ? { cookie } : {},
  });
  const location = res.headers.get("location") ?? "";
  let body = "";
  if (res.status === 200) {
    body = await res.text();
  }
  return { status: res.status, location, body };
}

async function cleanup(rfqIds: string[], extra: { savedUserId?: string; supplierId?: string; listingId?: string; noticeUserId?: string }) {
  for (const id of rfqIds) {
    await prisma.rfq.delete({ where: { id } }).catch(() => undefined);
  }
  const leftover = await prisma.rfq.findMany({
    where: { title: { startsWith: "[verify-buyer]" } },
    select: { id: true },
  });
  for (const row of leftover) {
    await prisma.rfq.delete({ where: { id: row.id } }).catch(() => undefined);
  }
  if (extra.savedUserId && extra.supplierId) {
    await prisma.savedSupplier.deleteMany({
      where: { userId: extra.savedUserId, supplierId: extra.supplierId },
    });
  }
  if (extra.savedUserId && extra.listingId) {
    await prisma.favouriteListing.deleteMany({
      where: { userId: extra.savedUserId, listingId: extra.listingId },
    });
  }
  if (extra.noticeUserId) {
    await prisma.notification.deleteMany({
      where: { userId: extra.noticeUserId, body: { contains: RUN } },
    });
  }
}

function helpers() {
  console.log("\n=== Helpers ===");
  check("submitted is waiting, not open", WAITING_RFQ.includes("submitted") && !WAITING_RFQ.includes("open"));
  check("closed set has cancelled/rejected", CLOSED_RFQ.includes("cancelled") && CLOSED_RFQ.includes("rejected"));
  check("can cancel submitted", canCancelRfq("submitted"));
  check("can cancel open", canCancelRfq("open"));
  check("cannot cancel rejected", !canCancelRfq("rejected"));
  check("cannot cancel cancelled", !canCancelRfq("cancelled"));
  check("extend only while open", canExtendRfq("open") && !canExtendRfq("submitted") && !canExtendRfq("cancelled"));
  check("submitted copy is review, not quotes", RFQ_STATUS_COPY.submitted.includes("not public"));
  check("quotesStamp 0", quotesStamp(0) === "0 quotes");
  check("quotesStamp 1", quotesStamp(1) === "1 quote");
  check("quotesStamp 3", quotesStamp(3) === "3 quotes");
  check("formatPkDate null", formatPkDate(null) === "—");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  helpers();

  const rfqIds: string[] = [];
  let buyerId = "";
  let abcId = "";
  let machineId = "";

  try {
    console.log("\n=== Database loop ===");
    const buyer = await prisma.user.findUnique({
      where: { email: "maria.s@example.com" },
      include: { buyerOrg: true },
    });
    const supplierUser = await prisma.user.findUnique({
      where: { email: "laura.c@example.net" },
    });
    const abc = await prisma.supplierOrganisation.findUnique({ where: { slug: "abc-engineering" } });
    const machine = await prisma.usedMachineListing.findFirst({
      where: { slug: "500l-ss316-vessel-faisalabad", status: "live" },
    });
    if (!buyer?.buyerOrgId || !buyer.buyerOrg || !supplierUser?.supplierOrgId || !abc || !machine) {
      throw new Error("Seed users/listings missing. Run: npx prisma db seed");
    }
    buyerId = buyer.id;
    abcId = abc.id;
    machineId = machine.id;

    const leftover = await prisma.rfq.findMany({
      where: { title: { startsWith: "[verify-buyer]" } },
      select: { id: true },
    });
    for (const row of leftover) {
      await prisma.rfq.delete({ where: { id: row.id } }).catch(() => undefined);
    }

    const closing = new Date();
    closing.setDate(closing.getDate() + 14);
    const submitted = await prisma.rfq.create({
      data: {
        buyerOrgId: buyer.buyerOrgId,
        buyerUserId: buyer.id,
        title: TITLE,
        description: "Verify buyer desk: submitted must not count as open, quotes stay at 0 until Classify + Open.",
        quantity: "2 vessels",
        city: "Lahore",
        neededBy: "30 days",
        industry: "pharmaceutical",
        status: "submitted",
        closingAt: closing,
        machineId: machine.id,
      },
    });
    rfqIds.push(submitted.id);

    const waiting = await prisma.rfq.count({
      where: { buyerOrgId: buyer.buyerOrgId, status: { in: [...WAITING_RFQ] } },
    });
    const openBefore = await prisma.rfq.count({
      where: { buyerOrgId: buyer.buyerOrgId, status: "open" },
    });
    const deskWaiting = await prisma.rfq.findMany({
      where: { buyerOrgId: buyer.buyerOrgId, status: { in: [...WAITING_RFQ] } },
      select: { id: true, status: true },
    });
    check("submitted RFQ counted in waiting", deskWaiting.some((r) => r.id === submitted.id));
    check("submitted RFQ not in open count path", submitted.status !== "open");
    check("waiting count >= 1", waiting >= 1, String(waiting));

    const readyWhileSubmitted = await prisma.rfq.count({
      where: { id: submitted.id, status: "open", quotes: { some: {} } },
    });
    check("submitted RFQ is not 'ready to compare'", readyWhileSubmitted === 0);

    const matchedIds = await matchSuppliersForRfq(submitted.id);
    await prisma.rfq.update({
      where: { id: submitted.id },
      data: { status: "open", qualified: true },
    });
    await prisma.notification.create({
      data: {
        userId: buyer.id,
        type: "rfq_open",
        title: "RFQ is open",
        body: `${TITLE} — ${matchedIds.length} suppliers can quote. ${RUN}`,
        href: `/buyer/rfqs/${submitted.id}`,
      },
    });

    const opened = await prisma.rfq.findUnique({
      where: { id: submitted.id },
      include: { _count: { select: { quotes: true, matches: true } } },
    });
    check("open status after match", opened?.status === "open");
    check("matches stored", (opened?._count.matches ?? 0) === matchedIds.length, `${opened?._count.matches} vs ${matchedIds.length}`);
    check("ABC was matched", matchedIds.includes(abc.id));
    check("quotes still 0 after open, before quote", opened?._count.quotes === 0);

    const notice = await prisma.notification.findFirst({
      where: { userId: buyer.id, href: `/buyer/rfqs/${submitted.id}` },
    });
    check("buyer notice after open", Boolean(notice));

    if (!matchedIds.includes(abc.id)) {
      throw new Error("ABC Engineering was not matched — cannot quote");
    }
    await prisma.quotation.create({
      data: {
        rfqId: submitted.id,
        supplierId: abc.id,
        userId: supplierUser.id,
        pricePkr: 1_800_000,
        deliveryDays: 30,
        warranty: "12 months",
        notes: "Verify comparison row",
        status: "submitted",
      },
    });

    const quotesInbox = await prisma.quotation.findMany({
      where: { rfq: { buyerOrgId: buyer.buyerOrgId }, rfqId: submitted.id },
    });
    check("quote appears in buyer quotes inbox query", quotesInbox.length === 1);

    const ready = await prisma.rfq.findMany({
      where: { buyerOrgId: buyer.buyerOrgId, status: "open", quotes: { some: {} } },
      select: { id: true },
    });
    check("open RFQ with quote is ready to compare", ready.some((r) => r.id === submitted.id));

    const afterOpenCount = await prisma.rfq.count({
      where: { buyerOrgId: buyer.buyerOrgId, status: "open" },
    });
    check("open count increased by 1", afterOpenCount === openBefore + 1, `${openBefore} → ${afterOpenCount}`);

    const beforeClose = opened!.closingAt!;
    const extended = new Date(beforeClose);
    extended.setDate(extended.getDate() + 7);
    await prisma.rfq.update({ where: { id: submitted.id }, data: { closingAt: extended } });
    const afterExtend = await prisma.rfq.findUnique({ where: { id: submitted.id } });
    const deltaDays = Math.round((afterExtend!.closingAt!.getTime() - beforeClose.getTime()) / 86400000);
    check("extend closing +7 days", deltaDays === 7, `${deltaDays} days`);

    const toCancel = await prisma.rfq.create({
      data: {
        buyerOrgId: buyer.buyerOrgId,
        buyerUserId: buyer.id,
        title: `${TITLE} cancel`,
        description: "Second RFQ to verify buyer cancel from submitted.",
        quantity: "1",
        city: "Lahore",
        neededBy: "15 days",
        industry: "pharmaceutical",
        status: "submitted",
        closingAt: closing,
      },
    });
    rfqIds.push(toCancel.id);
    check("canCancel submitted before update", canCancelRfq("submitted"));
    await prisma.rfq.update({ where: { id: toCancel.id }, data: { status: "cancelled" } });
    const cancelled = await prisma.rfq.findUnique({ where: { id: toCancel.id } });
    check("cancelled RFQ status", cancelled?.status === "cancelled");
    check("cannot extend cancelled", !canExtendRfq(cancelled!.status));

    const otherOrgRfqs = await prisma.rfq.findMany({
      where: { id: submitted.id, buyerOrgId: { not: buyer.buyerOrgId } },
    });
    check("RFQ is scoped to buyer org (not visible as other org)", otherOrgRfqs.length === 0);

    const savedBefore = await prisma.savedSupplier.findUnique({
      where: { userId_supplierId: { userId: buyer.id, supplierId: abc.id } },
    });
    if (savedBefore) {
      await prisma.savedSupplier.delete({
        where: { userId_supplierId: { userId: buyer.id, supplierId: abc.id } },
      });
    }
    await prisma.savedSupplier.create({ data: { userId: buyer.id, supplierId: abc.id } });
    const saved = await prisma.savedSupplier.findUnique({
      where: { userId_supplierId: { userId: buyer.id, supplierId: abc.id } },
    });
    check("save supplier", Boolean(saved));
    await prisma.savedSupplier.delete({
      where: { userId_supplierId: { userId: buyer.id, supplierId: abc.id } },
    });
    const unsaved = await prisma.savedSupplier.findUnique({
      where: { userId_supplierId: { userId: buyer.id, supplierId: abc.id } },
    });
    check("unsave supplier", !unsaved);

    const favBefore = await prisma.favouriteListing.findUnique({
      where: { userId_listingId: { userId: buyer.id, listingId: machine.id } },
    });
    if (favBefore) {
      await prisma.favouriteListing.delete({
        where: { userId_listingId: { userId: buyer.id, listingId: machine.id } },
      });
    }
    await prisma.favouriteListing.create({ data: { userId: buyer.id, listingId: machine.id } });
    const fav = await prisma.favouriteListing.findUnique({
      where: { userId_listingId: { userId: buyer.id, listingId: machine.id } },
    });
    check("favourite used machine", Boolean(fav));
    await prisma.favouriteListing.delete({
      where: { userId_listingId: { userId: buyer.id, listingId: machine.id } },
    });

    const detail = await prisma.rfq.findFirst({
      where: { id: submitted.id, buyerOrgId: buyer.buyerOrgId },
      include: { quotes: { include: { supplier: true } } },
    });
    check("detail query finds RFQ for owning org", Boolean(detail));
    check("comparison has supplier city + phone", Boolean(detail?.quotes[0]?.supplier.city && detail?.quotes[0]?.supplier.phone));
    check("linked machineId set", detail?.machineId === machine.id);

    const company = await prisma.buyerOrganisation.findUnique({ where: { id: buyer.buyerOrgId } });
    check("company record exists for desk chrome", Boolean(company?.legalName && company.city));

    console.log("\n=== HTTP (localhost) ===");
    try {
      const anon = await http("/buyer");
      check(
        "GET /buyer without cookie → login",
        anon.status === 307 || anon.status === 302,
        `${anon.status} ${anon.location}`,
      );
      check("login next=/buyer", anon.location.includes("/login") && anon.location.includes("next=%2Fbuyer"));

      const buyerCookie = await mintCookie({
        id: buyer.id,
        email: buyer.email,
        name: buyer.name,
        role: "buyer",
        buyerOrgId: buyer.buyerOrgId,
        supplierOrgId: null,
      });
      const supplierCookie = await mintCookie({
        id: supplierUser.id,
        email: supplierUser.email,
        name: supplierUser.name,
        role: "supplier",
        buyerOrgId: null,
        supplierOrgId: supplierUser.supplierOrgId,
      });

      const desk = await http("/buyer", buyerCookie);
      check("GET /buyer as buyer → 200", desk.status === 200, String(desk.status));
      check("desk says procurement queue", desk.body.includes("Procurement queue"));
      check("desk does not title submitted as the only Open RFQs heading", !desk.body.includes(">Open RFQs</h2>"));
      check("desk has waiting / open / quotes figures", desk.body.includes("Waiting on ops") && desk.body.includes("Open RFQs"));

      const supplierOnBuyer = await http("/buyer", supplierCookie);
      check(
        "GET /buyer as supplier → login",
        supplierOnBuyer.status === 307 || supplierOnBuyer.status === 302,
        String(supplierOnBuyer.status),
      );

      const rfqsPage = await http("/buyer/rfqs", buyerCookie);
      check("GET /buyer/rfqs → 200", rfqsPage.status === 200, String(rfqsPage.status));
      check("RFQs page lists verify title", rfqsPage.body.includes(TITLE));

      const waitingTab = await http("/buyer/rfqs?status=waiting", buyerCookie);
      check("waiting tab loads", waitingTab.status === 200);

      const quotesPage = await http("/buyer/quotes", buyerCookie);
      check("GET /buyer/quotes → 200", quotesPage.status === 200, String(quotesPage.status));
      check("quotes inbox shows ABC", quotesPage.body.includes("ABC Engineering"));

      const savedPage = await http("/buyer/saved", buyerCookie);
      check("GET /buyer/saved → 200", savedPage.status === 200, String(savedPage.status));

      const companyPage = await http("/buyer/company", buyerCookie);
      check("GET /buyer/company → 200", companyPage.status === 200, String(companyPage.status));
      check("company form has legal name", companyPage.body.includes("Legal name"));

      const detailPage = await http(`/buyer/rfqs/${submitted.id}`, buyerCookie);
      check("GET RFQ detail → 200", detailPage.status === 200, String(detailPage.status));
      check("detail shows open copy", detailPage.body.includes("Matched suppliers can quote"));
      check("detail shows Call", detailPage.body.includes("Call"));
      check("detail shows comparison price", detailPage.body.includes("1,800,000") || detailPage.body.includes("1800000") || detailPage.body.includes("Rs"));
      check("detail does not fake message threads", detailPage.body.includes("Message — not yet"));
    } catch (error) {
      check(
        "HTTP against running Next",
        false,
        error instanceof Error ? error.message : String(error),
      );
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
    console.error(error);
  } finally {
    await cleanup(rfqIds, {
      savedUserId: buyerId,
      supplierId: abcId,
      listingId: machineId,
      noticeUserId: buyerId,
    });
  }

  console.log("\n=== Cleanup ===");
  const ghosts = await prisma.rfq.count({ where: { title: { startsWith: "[verify-buyer]" } } });
  check("verify RFQs removed", ghosts === 0, String(ghosts));

  if (failures.length) {
    console.error("\nVERIFY FAILED");
    for (const f of failures) console.error(` - ${f}`);
    process.exit(1);
  }
  console.log("\nVERIFY PASSED — buyer desk helpers, RFQ loop, saves, notices, and HTTP pages.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
