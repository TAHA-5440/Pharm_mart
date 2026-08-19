import Link from "next/link";
import { Stamp } from "@/components/stamp";
import {
  formatPkDate,
  quotesStamp,
  rfqStampClass,
  statusLabel,
  type BuyerRfqRow,
} from "@/lib/buyer";
import { cn } from "@/lib/utils";

export function BuyerRfqTable({
  rfqs,
  empty,
}: {
  rfqs: BuyerRfqRow[];
  empty: string;
}) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-sheet shadow-[0_10px_30px_rgba(16,20,16,0.06)]">
      <table className="w-full min-w-180 text-left text-sm">
        <thead className="border-b border-rule text-[11px] font-medium uppercase tracking-wide text-mill">
          <tr>
            <th className="px-4 py-3">Requirement</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Quotes</th>
            <th className="px-4 py-3">Matched</th>
            <th className="px-4 py-3">Closes</th>
          </tr>
        </thead>
        <tbody>
          {rfqs.map((r) => (
            <tr key={r.id} className="border-b border-rule/70 last:border-0">
              <td className="px-4 py-3">
                <Link href={`/buyer/rfqs/${r.id}`} className="font-medium hover:text-steel">
                  {r.title}
                </Link>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Qty {r.quantity} · needed {r.neededBy}
                  {r.category ? ` · ${r.category.name}` : ""}
                  {r.singleSupplierId ? " · Single supplier" : ""}
                </p>
              </td>
              <td className="px-4 py-3">
                <Stamp className={rfqStampClass(r.status)}>{statusLabel(r.status)}</Stamp>
              </td>
              <td className="px-4 py-3 text-ink-soft">{r.city}</td>
              <td className="px-4 py-3">
                <Stamp className={cn(r._count.quotes >= 3 && r._count.quotes <= 5 && "bg-sage text-mark")}>
                  {quotesStamp(r._count.quotes)}
                </Stamp>
              </td>
              <td className="px-4 py-3 tabular-nums text-ink-soft">
                {r.status === "open" || r._count.matches ? r._count.matches : "—"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-soft">{formatPkDate(r.closingAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rfqs.length ? <p className="px-4 py-8 text-center text-sm text-ink-soft">{empty}</p> : null}
    </div>
  );
}
