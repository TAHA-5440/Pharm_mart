import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  approveProductAction,
  approveSupplierAction,
  logoutAction,
  rejectProductAction,
  rejectRfqAction,
  rejectSupplierAction,
} from "@/app/actions";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { OpenRfqForm } from "@/components/open-rfq-form";
import { AdminTabNav } from "@/components/admin-tab-nav";
import { formatWhen, VERIFICATION_LABEL } from "@/lib/utils";

export const metadata = { title: "Admin" };

const APPROVED_RFQ_STATUSES = ["open", "closed", "expired"] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ desk?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const { desk: deskRaw } = await searchParams;
  const desk =
    deskRaw === "profiles" || deskRaw === "rfqs" ? deskRaw : "queue";

  const [
    pendingRfqs,
    pendingSuppliers,
    quotes,
    rfqsOpen,
    approvedSupplierCount,
    approvedRfqCount,
    approvedSuppliers,
    approvedRfqs,
    pendingListings,
    typeCategories,
  ] = await Promise.all([
    prisma.rfq.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      include: { buyerOrg: true, category: true, _count: { select: { matches: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplierOrganisation.findMany({
      where: { publicStatus: { in: ["pending_review", "draft"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quotation.count(),
    prisma.rfq.count({ where: { status: "open" } }),
    prisma.supplierOrganisation.count({ where: { publicStatus: "approved" } }),
    prisma.rfq.count({ where: { status: { in: [...APPROVED_RFQ_STATUSES] } } }),
    desk === "profiles"
      ? prisma.supplierOrganisation.findMany({
          where: { publicStatus: "approved" },
          include: {
            _count: { select: { products: true, machines: true, quotes: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    desk === "rfqs"
      ? prisma.rfq.findMany({
          where: { status: { in: [...APPROVED_RFQ_STATUSES] } },
          include: {
            buyerOrg: true,
            _count: { select: { matches: true, quotes: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.productListing.findMany({
      where: { status: "pending_review" },
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { kind: "type", active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const quotesPer =
    rfqsOpen > 0 ? (quotes / Math.max(rfqsOpen, 1)).toFixed(1) : "—";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="flex items-center">
        <h1 className="font-display text-3xl">Admin · liquidity</h1>
        <form action={logoutAction} className="ml-auto">
          <button className="text-sm text-ink-soft underline" type="submit">
            Log out
          </button>
        </form>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat n={pendingRfqs.length} l="Pending RFQs" href="/admin?desk=queue" />
        <Stat n={pendingSuppliers.length} l="Pending suppliers" href="/admin?desk=queue" />
        <Stat n={approvedSupplierCount} l="Approved profiles" href="/admin?desk=profiles" />
        <Stat n={approvedRfqCount} l="Approved RFQs" href="/admin?desk=rfqs" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat n={quotesPer} l="Quotes / open RFQ" />
        <Stat n={rfqsOpen} l="Open RFQs" href="/admin?desk=rfqs" />
        <Stat n={pendingListings.length} l="Pending listings" href="/admin?desk=queue" />
      </div>

      <AdminTabNav
        items={[
          { href: "/admin?desk=queue", label: "Queue", active: desk === "queue" },
          {
            href: "/admin?desk=profiles",
            label: "Approved profiles",
            active: desk === "profiles",
          },
          {
            href: "/admin?desk=rfqs",
            label: "Approved RFQs",
            active: desk === "rfqs",
          },
        ]}
      />

      {desk === "queue" ? (
        <>
          <h2 className="mt-8 font-display text-2xl">RFQ queue</h2>
          <div className="mt-4 space-y-4">
            {pendingRfqs.map((r) => (
              <div key={r.id} className="border border-rule bg-sheet p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/rfqs/${r.id}`} className="font-medium hover:text-steel">
                    {r.title}
                  </Link>
                  <Stamp>{r.status.replaceAll("_", " ")}</Stamp>
                </div>
                <p className="text-sm text-ink-soft">
                  {r.buyerOrg.legalName} · {r.city} · {r.quantity}
                  {r.category ? ` · ${r.category.name}` : " · type not set"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{r.description}</p>
                <div className="mt-3 flex flex-col gap-3">
                  <OpenRfqForm
                    rfqId={r.id}
                    categoryId={r.categoryId}
                    categories={typeCategories}
                  />
                  <form action={rejectRfqAction}>
                    <input type="hidden" name="rfqId" value={r.id} />
                    <button className="border border-stop px-3 py-2 text-sm text-stop" type="submit">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {!pendingRfqs.length ? (
              <p className="text-ink-soft">No RFQs waiting.</p>
            ) : null}
          </div>

          <h2 className="mt-10 font-display text-2xl">Supplier queue</h2>
          <div className="mt-4 space-y-3">
            {pendingSuppliers.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 border border-rule bg-sheet p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-lg">
                      <Link href={`/admin/suppliers/${s.id}`} className="underline hover:text-steel">
                        {s.displayName}
                      </Link>
                    </p>
                    <p className="text-sm text-ink-soft">{s.city} · {s.industries}</p>
                    <div className="mt-2 text-sm space-y-1">
                      <p><span className="font-semibold">Address:</span> {s.address || "Not provided"}</p>
                      <p><span className="font-semibold">NTN:</span> {s.ntn || "Not provided"}</p>
                      <p><span className="font-semibold">CNIC:</span> {s.cnic || "Not provided"}</p>
                      {s.businessProofUrl ? (
                        <p>
                          <span className="font-semibold">Business Proof:</span>{" "}
                          <a href={s.businessProofUrl} target="_blank" className="text-steel underline">View Document</a>
                        </p>
                      ) : (
                        <p className="text-hold">No business proof uploaded.</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:mt-0 items-end">
                    <form action={approveSupplierAction}>
                      <input type="hidden" name="supplierId" value={s.id} />
                      <MarkButton type="submit">Approve + Business Verified</MarkButton>
                    </form>
                    <form action={rejectSupplierAction} className="flex flex-col items-end gap-2 mt-2 pt-4 border-t border-rule w-full">
                      <input type="hidden" name="supplierId" value={s.id} />
                      <textarea name="rejectionReason" placeholder="Rejection cause / correction needed..." required className="w-full sm:w-64 border border-rule bg-paper px-3 py-2 text-sm" rows={2} />
                      <button className="border border-stop px-3 py-2 text-sm text-stop" type="submit">Reject</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
            {!pendingSuppliers.length ? (
              <p className="text-ink-soft">No suppliers waiting.</p>
            ) : null}
          </div>

          <h2 className="mt-10 font-display text-2xl">Listing queue</h2>
          <div className="mt-4 space-y-3">
            {pendingListings.map((p) => (
              <div key={p.id} className="flex flex-wrap items-start justify-between gap-3 border border-rule bg-sheet p-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-ink-soft">
                    {p.supplier.displayName} · {p.kind} · {p.shortDesc}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={approveProductAction}>
                    <input type="hidden" name="productId" value={p.id} />
                    <MarkButton type="submit">Approve live</MarkButton>
                  </form>
                  <form action={rejectProductAction}>
                    <input type="hidden" name="productId" value={p.id} />
                    <button className="border border-stop px-3 py-2 text-sm text-stop" type="submit">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {!pendingListings.length ? (
              <p className="text-ink-soft">No listings waiting.</p>
            ) : null}
          </div>
        </>
      ) : null}

      {desk === "profiles" ? (
        <div className="mt-8 overflow-hidden border border-rule bg-sheet">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule font-mono text-[11px] tracking-widest text-mill uppercase">
              <tr>
                <th className="px-3 py-2">Supplier</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Verification</th>
                <th className="px-3 py-2">Products</th>
                <th className="px-3 py-2">Quotes</th>
                <th className="px-3 py-2">Approved file</th>
              </tr>
            </thead>
            <tbody>
              {approvedSuppliers.map((s) => (
                <tr key={s.id} className="border-b border-rule">
                  <td className="px-3 py-3 font-medium">{s.displayName}</td>
                  <td className="px-3 py-3">{s.city}</td>
                  <td className="px-3 py-3">
                    <Stamp>{VERIFICATION_LABEL[s.verification]}</Stamp>
                  </td>
                  <td className="px-3 py-3">
                    {s._count.products + s._count.machines}
                  </td>
                  <td className="px-3 py-3">{s._count.quotes}</td>
                  <td className="px-3 py-3">
                    <Link href={`/admin/suppliers/${s.id}`} className="text-steel underline">
                      History · docs · activity · products
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!approvedSuppliers.length ? (
            <p className="p-6 text-ink-soft">No approved supplier profiles yet.</p>
          ) : null}
        </div>
      ) : null}

      {desk === "rfqs" ? (
        <div className="mt-8 overflow-hidden border border-rule bg-sheet">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule font-mono text-[11px] tracking-widest text-mill uppercase">
              <tr>
                <th className="px-3 py-2">Requirement</th>
                <th className="px-3 py-2">Buyer</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Matches</th>
                <th className="px-3 py-2">Quotes</th>
                <th className="px-3 py-2">Opened</th>
              </tr>
            </thead>
            <tbody>
              {approvedRfqs.map((r) => (
                <tr key={r.id} className="border-b border-rule">
                  <td className="px-3 py-3">
                    <Link href={`/admin/rfqs/${r.id}`} className="font-medium hover:text-steel">
                      {r.title}
                    </Link>
                    <p className="text-ink-soft">{r.city} · {r.quantity}</p>
                  </td>
                  <td className="px-3 py-3">{r.buyerOrg.legalName}</td>
                  <td className="px-3 py-3">
                    <Stamp>{r.status.replaceAll("_", " ")}</Stamp>
                  </td>
                  <td className="px-3 py-3">{r._count.matches}</td>
                  <td className="px-3 py-3">{r._count.quotes}</td>
                  <td className="px-3 py-3 text-ink-soft">{formatWhen(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!approvedRfqs.length ? (
            <p className="p-6 text-ink-soft">No approved RFQs yet. Open one from the queue.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Stat({
  n,
  l,
  href,
}: {
  n: number | string;
  l: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="font-display text-3xl">{n}</p>
      <p className="font-mono text-[11px] text-mill">{l}</p>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="border border-rule bg-sheet p-3 hover:border-steel">
        {inner}
      </Link>
    );
  }
  return <div className="border border-rule bg-sheet p-3">{inner}</div>;
}
