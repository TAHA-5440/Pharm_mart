import Link from "next/link";
import { Check } from "lucide-react";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { needsDocuments, requireSeller, sellerChecks, sellerStatusCopy, SELLER_ERRORS } from "@/lib/seller";
import { cn } from "@/lib/utils";

export const metadata = { title: "Seller desk" };

export default async function SellerDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { org } = await requireSeller();
  const params = await searchParams;
  const error = params.error ? SELLER_ERRORS[params.error] : null;

  const [openRfqs, quotes] = await Promise.all([
    prisma.rfqMatch.count({ where: { supplierId: org.id, rfq: { status: "open" } } }),
    prisma.quotation.count({ where: { supplierId: org.id } }),
  ]);

  const checks = sellerChecks(org);
  const doneCount = checks.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      <p
        className={cn(
          "rounded-3xl px-4 py-3 text-sm",
          org.publicStatus === "approved" && "bg-sage text-mark",
          org.publicStatus === "rejected" && "bg-stop/10 text-stop",
          org.publicStatus === "pending_review" && "bg-[#f4e6d8] text-hold",
        )}
      >
        {sellerStatusCopy(org)}
      </p>
      {error ? <p className="rounded-3xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          [org.profileViews, "Profile views", "People who opened your public page"],
          [openRfqs, "Open RFQs", "Matched requirements waiting"],
          [quotes, "Quotes submitted", "Sent from this desk"],
        ].map(([value, label, hint]) => (
          <div key={String(label)} className="rounded-3xl bg-sheet px-5 py-4 shadow-[0_10px_30px_rgba(16,20,16,0.06)]">
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-[11px] font-medium tracking-[0.14em] text-mill uppercase">{label}</p>
            <p className="mt-1 text-xs text-ink-soft">{hint}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
        <h2 className="text-xl font-semibold">This desk</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {org.publicStatus === "approved"
            ? "Quote on matched RFQs. Report won or lost deals on Quotes. ProcureX does not take payment."
            : "Buyers cannot see this profile until ops approve it. Finish documents first."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {org.publicStatus === "approved" ? (
            <>
              <MarkButton href="/seller/rfqs">Open RFQs</MarkButton>
              <MarkButton href="/seller/quotes">Quotes</MarkButton>
            </>
          ) : (
            <MarkButton href="/seller/documents">Finish documents</MarkButton>
          )}
          {org.publicStatus === "approved" && needsDocuments(org) ? (
            <MarkButton href="/seller/documents">Finish documents</MarkButton>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Completeness</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {doneCount} of {checks.length} ready. Helps approval; it does not replace it.
            </p>
          </div>
          <Stamp>{Math.round((doneCount / checks.length) * 100)}%</Stamp>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper">
          <div
            className="h-full rounded-full bg-mark"
            style={{ width: `${Math.round((doneCount / checks.length) * 100)}%` }}
          />
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {checks.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="flex items-center gap-2 text-sm hover:text-steel">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full",
                    item.done ? "bg-mark text-white" : "border border-rule bg-paper",
                  )}
                >
                  {item.done ? <Check className="size-3" aria-hidden /> : null}
                </span>
                <span className={item.done ? "text-ink" : "text-ink-soft"}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
