import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  approveSupplierAction,
  logoutAction,
  openRfqAction,
  rejectRfqAction,
  rejectSupplierAction,
} from "@/app/actions";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const [pendingRfqs, pendingSuppliers, quotes, rfqsOpen] = await Promise.all([
    prisma.rfq.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      include: { buyerOrg: true, _count: { select: { matches: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplierOrganisation.findMany({
      where: { publicStatus: { in: ["pending_review", "draft"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quotation.count(),
    prisma.rfq.count({ where: { status: "open" } }),
  ]);

  const quotesPer =
    rfqsOpen > 0
      ? (quotes / Math.max(rfqsOpen, 1)).toFixed(1)
      : "—";

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
        <Stat n={pendingRfqs.length} l="Pending RFQs" />
        <Stat n={pendingSuppliers.length} l="Pending suppliers" />
        <Stat n={quotesPer} l="Quotes / open RFQ" />
        <Stat n={rfqsOpen} l="Open RFQs" />
      </div>

      <h2 className="mt-10 font-display text-2xl">RFQ queue</h2>
      <div className="mt-4 space-y-4">
        {pendingRfqs.map((r) => (
          <div key={r.id} className="border border-rule bg-sheet p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{r.title}</p>
              <Stamp>{r.status.replaceAll("_", " ")}</Stamp>
            </div>
            <p className="text-sm text-ink-soft">
              {r.buyerOrg.legalName} · {r.city} · {r.quantity}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{r.description}</p>
            <div className="mt-3 flex gap-2">
              <form action={openRfqAction}>
                <input type="hidden" name="rfqId" value={r.id} />
                <MarkButton type="submit">Classify + Open + match</MarkButton>
              </form>
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
                  <a href={`/suppliers/${s.slug}`} target="_blank" rel="noreferrer" className="underline hover:text-steel">
                    {s.displayName}
                  </a>
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
    </div>
  );
}

function Stat({ n, l }: { n: number | string; l: string }) {
  return (
    <div className="border border-rule bg-sheet p-3">
      <p className="font-display text-3xl">{n}</p>
      <p className="font-mono text-[11px] text-mill">{l}</p>
    </div>
  );
}
