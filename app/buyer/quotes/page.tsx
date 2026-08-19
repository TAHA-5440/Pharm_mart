import Link from "next/link";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { requireBuyer, formatPkDate, quoteStampClass, statusLabel } from "@/lib/buyer";
import { formatPkr, VERIFICATION_LABEL } from "@/lib/utils";

export const metadata = { title: "Quotes" };

export default async function BuyerQuotesPage() {
  const { org } = await requireBuyer();
  const quotes = await prisma.quotation.findMany({
    where: { rfq: { buyerOrgId: org.id } },
    include: {
      supplier: { select: { displayName: true, slug: true, city: true, verification: true } },
      rfq: { select: { id: true, title: true, status: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Quotations</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Incoming quotes across RFQs. Compare on the requirement. Quotations are not purchase orders.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-sheet shadow-[0_10px_30px_rgba(16,20,16,0.06)]">
        <table className="w-full min-w-180 text-left text-sm">
          <thead className="border-b border-rule text-[11px] font-medium uppercase tracking-wide text-mill">
            <tr>
              <th className="px-4 py-3">RFQ</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Warranty</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-rule/70 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/buyer/rfqs/${q.rfq.id}`} className="font-medium hover:text-steel">
                    {q.rfq.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {q.rfq.city} · {statusLabel(q.rfq.status)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/suppliers/${q.supplier.slug}`} className="hover:text-steel">
                    {q.supplier.displayName}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Stamp>{VERIFICATION_LABEL[q.supplier.verification]}</Stamp>
                    <Stamp className={quoteStampClass(q.status)}>{statusLabel(q.status)}</Stamp>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPkr(q.pricePkr)}</td>
                <td className="px-4 py-3 text-ink-soft">{q.deliveryDays} days</td>
                <td className="px-4 py-3 text-ink-soft">{q.warranty}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-soft">{formatPkDate(q.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!quotes.length ? (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">
            No quotations yet. They appear after ops open an RFQ and a matched supplier quotes.
          </p>
        ) : null}
      </div>
    </div>
  );
}
