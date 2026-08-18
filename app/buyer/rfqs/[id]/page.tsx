import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { formatPkr, VERIFICATION_LABEL } from "@/lib/utils";
import Link from "next/link";

export default async function BuyerRfqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "buyer") redirect("/login");
  const { id } = await params;
  const rfq = await prisma.rfq.findUnique({
    where: { id },
    include: {
      matches: true,
      quotes: { include: { supplier: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!rfq || rfq.buyerUserId !== session.id) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <Link href="/buyer" className="text-sm text-steel">
        ← Buyer workspace
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{rfq.title}</h1>
        <Stamp>{rfq.status.replaceAll("_", " ")}</Stamp>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {rfq.city} · Qty {rfq.quantity} · Needed {rfq.neededBy} · {rfq.matches.length}{" "}
        suppliers matched · {rfq.quotes.length} quotes
      </p>
      {rfq.status === "submitted" ? (
        <p className="mt-4 border border-hold px-3 py-2 text-sm text-hold">
          We’ll review and notify matching suppliers. This RFQ is not public.
        </p>
      ) : null}
      <dl className="mt-6 grid gap-3 border-y border-rule py-4 text-sm md:grid-cols-2">
        <div>
          <dt className="font-mono text-[11px] text-mill">INDUSTRY</dt>
          <dd>{rfq.industry}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] text-mill">DESCRIPTION</dt>
          <dd className="whitespace-pre-wrap">{rfq.description}</dd>
        </div>
      </dl>
      <h2 className="mt-8 font-display text-2xl">Comparison</h2>
      <div className="mt-4 hidden overflow-x-auto border border-rule bg-sheet md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-rule font-mono text-[11px] tracking-widest text-mill uppercase">
            <tr>
              <th className="px-3 py-2">Supplier</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2">Delivery</th>
              <th className="px-3 py-2">Warranty</th>
              <th className="px-3 py-2">Install</th>
            </tr>
          </thead>
          <tbody>
            {rfq.quotes.map((q) => (
              <tr key={q.id} className="border-b border-rule">
                <td className="px-3 py-3">
                  <Link href={`/suppliers/${q.supplier.slug}`} className="font-medium">
                    {q.supplier.displayName}
                  </Link>{" "}
                  <Stamp>{VERIFICATION_LABEL[q.supplier.verification]}</Stamp>
                  {q.notes ? <p className="mt-1 text-ink-soft">{q.notes}</p> : null}
                </td>
                <td className="px-3 py-3 text-right font-medium">{formatPkr(q.pricePkr)}</td>
                <td className="px-3 py-3">{q.deliveryDays} days</td>
                <td className="px-3 py-3">{q.warranty}</td>
                <td className="px-3 py-3">{q.installation ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-y-3 md:hidden">
        {rfq.quotes.map((q) => (
          <div key={q.id} className="border border-rule bg-sheet p-4">
            <Stamp>{VERIFICATION_LABEL[q.supplier.verification]}</Stamp>
            <p className="mt-2 font-medium">{q.supplier.displayName}</p>
            <p className="text-lg">{formatPkr(q.pricePkr)}</p>
            <p className="text-sm">Delivery {q.deliveryDays} days</p>
            <p className="text-sm">Warranty {q.warranty}</p>
          </div>
        ))}
      </div>
      {!rfq.quotes.length ? (
        <p className="mt-4 text-ink-soft">Waiting for quotations.</p>
      ) : null}
    </div>
  );
}
