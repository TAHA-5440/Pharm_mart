import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { SpecList } from "@/components/spec-list";
import { TrackedCallLink } from "@/components/analytics-beacon";
import { CancelRfqButton } from "@/components/cancel-rfq-button";
import { extendRfqClosingAction } from "@/app/buyer/actions";
import {
  BUYER_ERRORS,
  RFQ_STATUS_COPY,
  canCancelRfq,
  canExtendRfq,
  formatPkDate,
  quoteStampClass,
  quotesStamp,
  requireBuyer,
  rfqStampClass,
  statusLabel,
} from "@/lib/buyer";
import { INDUSTRY_LABEL, VERIFICATION_LABEL, formatPkr, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export async function generateMetadata() {
  return { title: "RFQ" };
}

export default async function BuyerRfqPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string; error?: string }>;
}) {
  const { org } = await requireBuyer();
  const { id } = await params;
  const sp = await searchParams;
  const rfq = await prisma.rfq.findFirst({
    where: { id, buyerOrgId: org.id },
    include: {
      category: true,
      matches: true,
      quotes: { include: { supplier: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!rfq) notFound();

  const machine = rfq.machineId
    ? await prisma.usedMachineListing.findUnique({
        where: { id: rfq.machineId },
        select: { title: true, slug: true },
      })
    : null;
  const directed = rfq.singleSupplierId
    ? await prisma.supplierOrganisation.findUnique({
        where: { id: rfq.singleSupplierId },
        select: { displayName: true, slug: true },
      })
    : null;

  const sort = sp.sort === "price" || sp.sort === "delivery" || sp.sort === "recent" ? sp.sort : "received";
  const quotes = [...rfq.quotes].sort((a, b) => {
    if (sort === "price") return a.pricePkr - b.pricePkr;
    if (sort === "delivery") return a.deliveryDays - b.deliveryDays;
    if (sort === "recent") return b.createdAt.getTime() - a.createdAt.getTime();
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
  const liveQuotes = quotes.filter((q) => q.status !== "withdrawn");
  const error = sp.error ? BUYER_ERRORS[sp.error] : null;
  const waiting = ["submitted", "under_review", "changes_requested"].includes(rfq.status);
  const bannerClass =
    rfq.status === "open"
      ? "bg-sage text-mark"
      : waiting
        ? "bg-[#f4e6d8] text-hold"
        : rfq.status === "rejected" || rfq.status === "cancelled"
          ? "bg-stop/10 text-stop"
          : "bg-paper text-ink-soft";

  const specRows: Array<[string, string]> = [
    ["Quantity", rfq.quantity],
    ["City", rfq.city],
    ["Needed by", rfq.neededBy],
    ["Closes", formatPkDate(rfq.closingAt)],
    ["Industry", INDUSTRY_LABEL[rfq.industry] ?? rfq.industry],
    ["Supply type", rfq.category?.name ?? (waiting ? "Ops will classify" : "—")],
    ["Installation", rfq.installation ? "Required" : "Not specified"],
    ["Used equipment", rfq.usedAllowed ? "Allowed" : "New preferred"],
    ["Matched suppliers", waiting ? "Not notified yet" : String(rfq.matches.length)],
    ["Quotations", quotesStamp(liveQuotes.length)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/buyer/rfqs" className="text-sm text-steel">
        ← My RFQs
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{rfq.title}</h2>
            <Stamp className={rfqStampClass(rfq.status)}>{statusLabel(rfq.status)}</Stamp>
            {directed ? <Stamp>Single supplier</Stamp> : null}
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            {rfq.city} · Qty {rfq.quantity} · Closes {formatPkDate(rfq.closingAt)}
            {rfq.status === "open" ? ` · ${rfq.matches.length} matched · ${quotesStamp(liveQuotes.length)}` : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canExtendRfq(rfq.status) ? (
            <form action={extendRfqClosingAction}>
              <input type="hidden" name="rfqId" value={rfq.id} />
              <Button type="submit" variant="outline">
                Extend 7 days
              </Button>
            </form>
          ) : null}
          {canCancelRfq(rfq.status) ? <CancelRfqButton rfqId={rfq.id} /> : null}
        </div>
      </div>

      {error ? <p className="rounded-2xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}

      <p className={cn("rounded-2xl px-4 py-3 text-sm", bannerClass)}>
        {RFQ_STATUS_COPY[rfq.status]}
      </p>

      {machine || directed ? (
        <p className="text-sm text-ink-soft">
          {machine ? (
            <>
              Regarding:{" "}
              <Link href={`/machines/${machine.slug}`} className="text-steel">
                {machine.title}
              </Link>
            </>
          ) : null}
          {machine && directed ? " · " : null}
          {directed ? (
            <>
              Directed to{" "}
              <Link href={`/suppliers/${directed.slug}`} className="text-steel">
                {directed.displayName}
              </Link>{" "}
              only
            </>
          ) : null}
        </p>
      ) : null}

      <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
        <h3 className="text-lg font-semibold">Requirement</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{rfq.description}</p>
        <div className="mt-5">
          <SpecList rows={specRows} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Comparison</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Price, delivery, warranty — same fields on every row. Message threads come next; Call is live.
            </p>
          </div>
          {quotes.length ? (
            <div className="flex flex-wrap gap-2 text-sm">
              {(
                [
                  ["received", "Received"],
                  ["price", "Price"],
                  ["delivery", "Delivery"],
                  ["recent", "Newest"],
                ] as const
              ).map(([id, label]) => (
                <Link
                  key={id}
                  href={`/buyer/rfqs/${rfq.id}${id === "received" ? "" : `?sort=${id}`}`}
                  className={cn(
                    "rounded-full px-3 py-1.5",
                    sort === id ? "bg-ink text-paper" : "bg-sheet text-ink-soft",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {waiting && !quotes.length ? (
          <p className="rounded-3xl bg-sheet px-4 py-8 text-center text-sm text-ink-soft">
            No quotes yet — and none should arrive until this RFQ is open. That is the review step, not a failed match.
          </p>
        ) : !quotes.length ? (
          <p className="rounded-3xl bg-sheet px-4 py-8 text-center text-sm text-ink-soft">
            Waiting for quotations. Target is 3–5 comparable quotes, not a blast of vendors.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-3xl border border-rule bg-sheet md:block">
              <table className="w-full min-w-180 text-left text-sm">
                <thead className="border-b border-rule text-[11px] font-medium uppercase tracking-wide text-mill">
                  <tr>
                    <th className="sticky left-0 z-10 bg-sheet px-4 py-3">Supplier</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3">Delivery</th>
                    <th className="px-4 py-3">Warranty</th>
                    <th className="px-4 py-3">Install</th>
                    <th className="px-4 py-3">Quoted</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr
                      key={q.id}
                      className={cn("border-b border-rule/70 last:border-0", q.status === "withdrawn" && "opacity-60")}
                    >
                      <td className="sticky left-0 z-10 bg-sheet px-4 py-3">
                        <Link href={`/suppliers/${q.supplier.slug}`} className="font-medium hover:text-steel">
                          {q.supplier.displayName}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Stamp>{VERIFICATION_LABEL[q.supplier.verification]}</Stamp>
                          <Stamp className={quoteStampClass(q.status)}>{statusLabel(q.status)}</Stamp>
                        </div>
                        <p className="mt-1 text-xs text-ink-soft">{q.supplier.city}</p>
                        {q.notes ? <p className="mt-2 max-w-xs text-ink-soft">{q.notes}</p> : null}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPkr(q.pricePkr)}</td>
                      <td className="px-4 py-3">{q.deliveryDays} days</td>
                      <td className="px-4 py-3">{q.warranty}</td>
                      <td className="px-4 py-3">{q.installation ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-soft">{formatPkDate(q.createdAt)}</td>
                      <td className="px-4 py-3">
                        <QuoteActions
                          supplierId={q.supplier.id}
                          phone={q.supplier.phone}
                          pdfUrl={q.pdfUrl}
                          withdrawn={q.status === "withdrawn"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              <p className="text-xs text-mill">Same fields in order: price, delivery, warranty, stamp.</p>
              {quotes.map((q) => (
                <article
                  key={q.id}
                  className={cn(
                    "rounded-3xl border border-rule bg-sheet p-4",
                    q.status === "withdrawn" && "opacity-60",
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    <Stamp>{VERIFICATION_LABEL[q.supplier.verification]}</Stamp>
                    <Stamp className={quoteStampClass(q.status)}>{statusLabel(q.status)}</Stamp>
                  </div>
                  <p className="mt-2 font-medium">
                    <Link href={`/suppliers/${q.supplier.slug}`}>{q.supplier.displayName}</Link>
                  </p>
                  <p className="text-xs text-ink-soft">{q.supplier.city}</p>
                  <p className="mt-3 text-2xl font-semibold">{formatPkr(q.pricePkr)}</p>
                  <p className="mt-1 text-sm">Delivery {q.deliveryDays} days</p>
                  <p className="text-sm">Warranty {q.warranty}</p>
                  <p className="text-sm text-ink-soft">Install {q.installation ? "Yes" : "No"}</p>
                  {q.notes ? <p className="mt-2 text-sm text-ink-soft">{q.notes}</p> : null}
                  <div className="mt-4">
                    <QuoteActions
                      supplierId={q.supplier.id}
                      phone={q.supplier.phone}
                      pdfUrl={q.pdfUrl}
                      withdrawn={q.status === "withdrawn"}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function QuoteActions({
  supplierId,
  phone,
  pdfUrl,
  withdrawn,
}: {
  supplierId: string;
  phone: string;
  pdfUrl: string | null;
  withdrawn: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      {!withdrawn ? (
        <Button asChild variant="outline" size="sm">
          <TrackedCallLink href={`tel:${phone}`} supplierId={supplierId}>
            Call
          </TrackedCallLink>
        </Button>
      ) : null}
      <span className="text-xs text-mill" title="Message threads ship with Step 13">
        Message — not yet
      </span>
      {pdfUrl ? (
        <a href={pdfUrl} className="text-xs text-steel underline" target="_blank" rel="noreferrer">
          Quote PDF
        </a>
      ) : null}
    </div>
  );
}
