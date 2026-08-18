import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { SpecList } from "@/components/spec-list";
import { OpenRfqForm } from "@/components/open-rfq-form";
import {
  formatPkr,
  formatWhen,
  INDUSTRY_LABEL,
  VERIFICATION_LABEL,
} from "@/lib/utils";
import { rejectRfqAction } from "@/app/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rfq = await prisma.rfq.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: rfq ? `${rfq.title} · Admin` : "RFQ · Admin" };
}

export default async function AdminRfqPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const { id } = await params;
  const { error } = await searchParams;
  const [rfq, typeCategories] = await Promise.all([
    prisma.rfq.findUnique({
      where: { id },
      include: {
        buyerOrg: true,
        buyerUser: true,
        category: true,
        matches: {
          include: { supplier: true },
          orderBy: { notifiedAt: "asc" },
        },
        quotes: {
          include: { supplier: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.category.findMany({
      where: { kind: "type", active: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!rfq) notFound();

  const pending = rfq.status === "submitted" || rfq.status === "under_review";
  const backHref =
    pending ? "/admin?desk=queue" : "/admin?desk=rfqs";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <Link href={backHref} className="text-sm text-steel">
        {pending ? "← RFQ queue" : "← Approved RFQs"}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{rfq.title}</h1>
        <Stamp>{rfq.status.replaceAll("_", " ")}</Stamp>
        {rfq.qualified ? <Stamp>qualified</Stamp> : null}
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {rfq.buyerOrg.legalName} · {rfq.city} · Qty {rfq.quantity} · Needed {rfq.neededBy} ·{" "}
        {rfq.matches.length} matched · {rfq.quotes.length} quotes · filed {formatWhen(rfq.createdAt)}
      </p>

      {error === "type" ? (
        <p className="mt-4 border border-stop px-3 py-2 text-sm text-stop">
          Select a supplier type before opening. Only that type is notified.
        </p>
      ) : null}

      <div className="mt-4 border border-rule bg-sheet p-4">
        <p className="text-sm text-ink-soft">
          Link the supplier type this RFQ belongs to. Matching uses that type only
          (profile categories or live products). Without a type, every approved
          supplier would be eligible.
        </p>
        <div className="mt-3">
          <OpenRfqForm
            rfqId={rfq.id}
            categoryId={rfq.categoryId}
            categories={typeCategories}
            submitLabel={pending ? "Open + match this type" : "Rematch this type"}
          />
        </div>
        {pending ? (
          <form action={rejectRfqAction} className="mt-3">
            <input type="hidden" name="rfqId" value={rfq.id} />
            <button className="border border-stop px-3 py-2 text-sm text-stop" type="submit">
              Reject
            </button>
          </form>
        ) : null}
      </div>

      <h2 className="mt-8 font-display text-2xl">Requirement</h2>
      <div className="mt-4">
        <SpecList
          rows={[
            ["Buyer", rfq.buyerOrg.legalName],
            ["Contact", `${rfq.buyerUser.name} · ${rfq.buyerUser.email}`],
            ["Industry", INDUSTRY_LABEL[rfq.industry] ?? rfq.industry],
            ["Type", rfq.type.replaceAll("_", " ")],
            ["Category", rfq.category?.name ?? "Not sure"],
            ["Quantity", rfq.quantity],
            ["City", rfq.city],
            ["Needed by", rfq.neededBy],
            ["Budget", rfq.budgetVisible ? formatPkr(rfq.budgetPkr) : "Hidden"],
            ["Used allowed", rfq.usedAllowed ? "Yes" : "No"],
            ["Installation", rfq.installation ? "Required" : "Not required"],
            ["Warranty", rfq.warrantyNeed || "—"],
            ["Closing", formatWhen(rfq.closingAt)],
          ]}
        />
      </div>
      <div className="mt-4 border border-rule bg-sheet p-4">
        <p className="font-mono text-[11px] text-mill">DESCRIPTION</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{rfq.description}</p>
      </div>

      <h2 className="mt-8 font-display text-2xl">Matched suppliers</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {rfq.category
          ? `Only suppliers typed as ${rfq.category.name} (profile or live product).`
          : "No supplier type linked yet — matching will not blast every supplier."}
      </p>
      <div className="mt-4 overflow-hidden border border-rule bg-sheet">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-rule font-mono text-[11px] tracking-widest text-mill uppercase">
            <tr>
              <th className="px-3 py-2">Supplier</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Verification</th>
              <th className="px-3 py-2">Notified</th>
            </tr>
          </thead>
          <tbody>
            {rfq.matches.map((m) => (
              <tr key={m.id} className="border-b border-rule">
                <td className="px-3 py-3">
                  <Link href={`/admin/suppliers/${m.supplier.id}`} className="font-medium hover:text-steel">
                    {m.supplier.displayName}
                  </Link>
                </td>
                <td className="px-3 py-3">{m.supplier.city}</td>
                <td className="px-3 py-3">
                  <Stamp>{VERIFICATION_LABEL[m.supplier.verification]}</Stamp>
                </td>
                <td className="px-3 py-3 text-ink-soft">{formatWhen(m.notifiedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rfq.matches.length ? (
          <p className="p-4 text-ink-soft">
            {rfq.category
              ? `No approved suppliers of type “${rfq.category.name}”.`
              : "No suppliers matched yet."}
          </p>
        ) : null}
      </div>

      <h2 className="mt-8 font-display text-2xl">Quotations</h2>
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
                  <Link href={`/admin/suppliers/${q.supplier.id}`} className="font-medium hover:text-steel">
                    {q.supplier.displayName}
                  </Link>
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
            <p className="font-medium">{q.supplier.displayName}</p>
            <p className="text-lg">{formatPkr(q.pricePkr)}</p>
            <p className="text-sm">Delivery {q.deliveryDays} days · Warranty {q.warranty}</p>
          </div>
        ))}
      </div>
      {!rfq.quotes.length ? (
        <p className="mt-4 text-ink-soft">Waiting for quotations.</p>
      ) : null}
    </div>
  );
}
