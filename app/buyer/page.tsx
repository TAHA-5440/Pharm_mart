import Link from "next/link";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { BuyerRfqTable } from "@/components/buyer-rfq-table";
import { markNotificationsReadAction } from "@/app/buyer/actions";
import {
  WAITING_RFQ,
  requireBuyer,
  rfqListInclude,
  type BuyerRfqRow,
} from "@/lib/buyer";

export const metadata = { title: "Desk" };

export default async function BuyerDeskPage() {
  const { session, org } = await requireBuyer();

  const [waitingCount, openCount, quoteCount, waitingRfqs, readyRfqs, notices, unread] =
    await Promise.all([
      prisma.rfq.count({ where: { buyerOrgId: org.id, status: { in: WAITING_RFQ } } }),
      prisma.rfq.count({ where: { buyerOrgId: org.id, status: "open" } }),
      prisma.quotation.count({ where: { rfq: { buyerOrgId: org.id } } }),
      prisma.rfq.findMany({
        where: { buyerOrgId: org.id, status: { in: WAITING_RFQ } },
        orderBy: { createdAt: "desc" },
        include: rfqListInclude,
      }),
      prisma.rfq.findMany({
        where: { buyerOrgId: org.id, status: "open", quotes: { some: {} } },
        orderBy: { createdAt: "desc" },
        include: rfqListInclude,
        take: 8,
      }),
      prisma.notification.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.notification.count({ where: { userId: session.id, read: false } }),
    ]);

  const recent = await loadRecentViews(session.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Procurement queue</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Post one requirement. Ops open it. You compare 3–5 quotations. There is no cart and no checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          [waitingCount, "Waiting on ops", "Submitted or under review — suppliers not notified yet"],
          [openCount, "Open RFQs", "Matched suppliers can quote"],
          [quoteCount, "Quotes in", "Submitted quotations across your RFQs"],
        ].map(([value, label, hint]) => (
          <div key={String(label)} className="rounded-3xl bg-sheet px-5 py-4 shadow-[0_10px_30px_rgba(16,20,16,0.06)]">
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-[11px] font-medium tracking-[0.14em] text-mill uppercase">{label}</p>
            <p className="mt-1 text-xs text-ink-soft">{hint}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
        <h3 className="text-lg font-semibold">This desk</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {waitingCount
            ? `${waitingCount} RFQ${waitingCount === 1 ? "" : "s"} with ops. Quotes stay at 0 until an RFQ is open.`
            : openCount
              ? "Open RFQs are live. Open a row to compare price, delivery, and warranty."
              : "No RFQs yet. Post a requirement — we match verified suppliers."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <MarkButton href="/rfq/new">Post RFQ</MarkButton>
          <MarkButton href="/marketplace">Search marketplace</MarkButton>
        </div>
      </section>

      {readyRfqs.length ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h3 className="text-lg font-semibold">Ready to compare</h3>
            <Link href="/buyer/rfqs?status=open" className="text-sm text-steel">
              All open
            </Link>
          </div>
          <BuyerRfqTable rfqs={readyRfqs as BuyerRfqRow[]} empty="" />
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-lg font-semibold">With ops</h3>
          <Link href="/buyer/rfqs?status=waiting" className="text-sm text-steel">
            All RFQs
          </Link>
        </div>
        <BuyerRfqTable
          rfqs={waitingRfqs as BuyerRfqRow[]}
          empty="Nothing waiting on ops. Open RFQs appear under RFQs."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Notices</h3>
            {unread ? (
              <form action={markNotificationsReadAction}>
                <button className="text-sm text-steel underline" type="submit">
                  Mark all read
                </button>
              </form>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            In-app notices when an RFQ is submitted or a quote arrives. Message threads are not on this desk yet.
          </p>
          <ul className="mt-4 space-y-3">
            {notices.map((n) => (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} className="block rounded-2xl bg-paper px-4 py-3 hover:bg-sage/60">
                    <NoticeBody n={n} />
                  </Link>
                ) : (
                  <div className="rounded-2xl bg-paper px-4 py-3">
                    <NoticeBody n={n} />
                  </div>
                )}
              </li>
            ))}
            {!notices.length ? (
              <li className="rounded-2xl bg-paper px-4 py-8 text-center text-sm text-ink-soft">
                No notices yet. Submit an RFQ to start the loop.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Recently viewed</h3>
            <Link href="/buyer/saved" className="text-sm text-steel">
              Saved
            </Link>
          </div>
          <p className="mt-1 text-sm text-ink-soft">From profile and listing views on this account.</p>
          <ul className="mt-4 space-y-2">
            {recent.map((row) => (
              <li key={row.href}>
                <Link href={row.href} className="flex items-center justify-between gap-2 rounded-2xl bg-paper px-4 py-3 text-sm hover:bg-sage/60">
                  <span>
                    <span className="font-medium">{row.title}</span>
                    <span className="mt-0.5 block text-xs text-ink-soft">{row.meta}</span>
                  </span>
                  <Stamp>{row.kind}</Stamp>
                </Link>
              </li>
            ))}
            {!recent.length ? (
              <li className="rounded-2xl bg-paper px-4 py-8 text-center text-sm text-ink-soft">
                Open a supplier or listing in Marketplace. It will list here.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}

function NoticeBody({
  n,
}: {
  n: { title: string; body: string; read: boolean; createdAt: Date };
}) {
  return (
    <>
      <p className="flex items-center gap-2 text-sm font-medium">
        {n.title}
        {!n.read ? <Stamp className="bg-[#f4e6d8] text-hold">New</Stamp> : null}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{n.body}</p>
    </>
  );
}

async function loadRecentViews(userId: string) {
  const events = await prisma.analyticsEvent.findMany({
    where: { userId, name: { in: ["profile_view", "listing_view"] } },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  const seen = new Set<string>();
  const rows: Array<{ href: string; title: string; meta: string; kind: string }> = [];

  for (const ev of events) {
    let payload: { slug?: string; kind?: string; listingId?: string; supplierId?: string } = {};
    try {
      payload = JSON.parse(ev.payload) as typeof payload;
    } catch {
      continue;
    }
    if (ev.name === "profile_view" && payload.slug) {
      const key = `p:${payload.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const supplier = await prisma.supplierOrganisation.findUnique({
        where: { slug: payload.slug },
        select: { displayName: true, city: true, publicStatus: true },
      });
      if (!supplier || supplier.publicStatus !== "approved") continue;
      rows.push({
        href: `/suppliers/${payload.slug}`,
        title: supplier.displayName,
        meta: supplier.city,
        kind: "Supplier",
      });
    }
    if (ev.name === "listing_view" && payload.slug && payload.kind) {
      const key = `l:${payload.kind}:${payload.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (payload.kind === "product") {
        const product = await prisma.productListing.findFirst({
          where: { slug: payload.slug, status: "live" },
          select: { name: true, supplier: { select: { displayName: true } } },
        });
        if (!product) continue;
        rows.push({
          href: `/products/${payload.slug}`,
          title: product.name,
          meta: product.supplier.displayName,
          kind: "Product",
        });
      } else {
        const machine = await prisma.usedMachineListing.findFirst({
          where: { slug: payload.slug, status: "live" },
          select: { title: true, city: true },
        });
        if (!machine) continue;
        rows.push({
          href: `/machines/${payload.slug}`,
          title: machine.title,
          meta: machine.city,
          kind: "Machine",
        });
      }
    }
    if (rows.length >= 6) break;
  }

  return rows;
}
