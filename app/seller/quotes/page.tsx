import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { SellerQuoteForm } from "@/components/seller-quote-form";
import { markQuoteDealAction } from "@/app/seller/listing-actions";
import { requireSeller, SELLER_ERRORS } from "@/lib/seller";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Quotes · Seller" };

const DEAL_OPEN = new Set(["submitted", "accepted"]);
const CLOSED = new Set(["lost", "declined", "withdrawn", "expired"]);

export default async function SellerQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { org } = await requireSeller();
  const params = await searchParams;
  const error = params.error ? SELLER_ERRORS[params.error] : null;

  const quotes = await prisma.quotation.findMany({
    where: { supplierId: org.id },
    include: { rfq: { select: { id: true, title: true, city: true, status: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const pipeline = {
    open: quotes.filter((q) => DEAL_OPEN.has(q.status)),
    won: quotes.filter((q) => q.status === "won"),
    closed: quotes.filter((q) => CLOSED.has(q.status)),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Quotes</h2>
        <p className="mt-1 text-sm text-ink-soft">
          One quote per requirement. Revise while the RFQ is open. Report won or lost deals here —
          ProcureX does not take payment or run checkout.
        </p>
      </div>
      {error ? <p className="rounded-3xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}

      {!quotes.length ? (
        <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
          <p className="rounded-2xl bg-paper px-4 py-8 text-center text-sm text-ink-soft">
            Submitted quotes will list here. Report won or lost deals on the same cards.
          </p>
        </section>
      ) : (
        <>
          <QuoteSection title="In play" items={pipeline.open} allowDeal />
          <QuoteSection title="Won" items={pipeline.won} />
          <QuoteSection title="Closed" items={pipeline.closed} />
        </>
      )}
    </div>
  );
}

function QuoteSection({
  title,
  items,
  allowDeal,
}: {
  title: string;
  items: Array<{
    id: string;
    rfqId: string;
    status: string;
    pricePkr: number;
    deliveryDays: number;
    warranty: string;
    notes: string | null;
    installation: boolean;
    rfq: { id: string; title: string; city: string; status: string };
  }>;
  allowDeal?: boolean;
}) {
  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-4 space-y-4">
          {items.map((q) => (
            <li key={q.id} className="rounded-2xl border border-rule bg-paper p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{q.rfq.title}</p>
                  <p className="text-sm text-ink-soft">{q.rfq.city}</p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums">{formatPkr(q.pricePkr)}</p>
                  <Stamp className="mt-1">{q.status.replaceAll("_", " ")}</Stamp>
                </div>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                {q.deliveryDays} days · {q.warranty}
              </p>
              {q.rfq.status === "open" && DEAL_OPEN.has(q.status) ? (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-steel">Revise quotation</summary>
                  <SellerQuoteForm
                    rfqId={q.rfqId}
                    label="Save revision"
                    defaults={{
                      pricePkr: q.pricePkr,
                      deliveryDays: q.deliveryDays,
                      warranty: q.warranty,
                      notes: q.notes ?? "",
                      installation: q.installation,
                    }}
                  />
                </details>
              ) : null}
              {allowDeal ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={markQuoteDealAction}>
                    <input type="hidden" name="id" value={q.id} />
                    <input type="hidden" name="outcome" value="won" />
                    <MarkButton type="submit">Mark won</MarkButton>
                  </form>
                  <form action={markQuoteDealAction}>
                    <input type="hidden" name="id" value={q.id} />
                    <input type="hidden" name="outcome" value="lost" />
                    <button className="min-h-11 rounded-full border border-rule px-5 text-sm" type="submit">
                      Mark lost
                    </button>
                  </form>
                  <form action={markQuoteDealAction}>
                    <input type="hidden" name="id" value={q.id} />
                    <input type="hidden" name="outcome" value="withdrawn" />
                    <button className="min-h-11 rounded-full px-5 text-sm text-ink-soft underline" type="submit">
                      Withdraw
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-2xl bg-paper px-4 py-6 text-center text-sm text-ink-soft">
          {title === "In play" ? "Submitted quotes will list here." : "Nothing here yet."}
        </p>
      )}
    </section>
  );
}
