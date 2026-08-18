import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { SellerQuoteForm } from "@/components/seller-quote-form";
import { requireSeller, SELLER_ERRORS } from "@/lib/seller";

export const metadata = { title: "RFQs · Seller" };

export default async function SellerRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { org } = await requireSeller();
  const params = await searchParams;
  const error = params.error ? SELLER_ERRORS[params.error] : null;

  const matches = await prisma.rfqMatch.findMany({
    where: { supplierId: org.id, rfq: { status: "open" } },
    include: { rfq: true },
    orderBy: { notifiedAt: "desc" },
  });
  const quoted = await prisma.quotation.findMany({
    where: { supplierId: org.id, rfqId: { in: matches.map((m) => m.rfq.id) } },
    select: { rfqId: true },
  });
  const quotedIds = new Set(quoted.map((q) => q.rfqId));
  const openToQuote = matches.filter((m) => !quotedIds.has(m.rfq.id));

  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">New RFQs</h2>
          <p className="mt-1 text-sm text-ink-soft">Quote here. You never see other suppliers’ prices.</p>
        </div>
        <span className="text-sm tabular-nums text-ink-soft">{openToQuote.length} open</span>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}
      <div className="mt-5 space-y-4">
        {openToQuote.map((m) => (
          <article key={m.id} className="rounded-2xl border border-rule bg-paper p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{m.rfq.title}</h3>
              <Stamp>Open</Stamp>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {m.rfq.city} · {m.rfq.quantity} · needed {m.rfq.neededBy}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{m.rfq.description}</p>
            <SellerQuoteForm rfqId={m.rfq.id} label="Submit quotation" />
          </article>
        ))}
        {!openToQuote.length ? (
          <p className="rounded-2xl bg-paper px-4 py-8 text-center text-sm text-ink-soft">
            {org.publicStatus === "approved"
              ? "No open RFQs matched to you yet. When a buyer’s requirement fits, it appears here."
              : "RFQs arrive after this profile is approved."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
