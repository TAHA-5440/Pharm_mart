import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin-nav";
import {
  approveSupplierAction,
  openRfqAction,
  rejectRfqAction,
  rejectSupplierAction,
} from "@/app/actions";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { INDUSTRY_LABEL } from "@/lib/utils";
import { supplierHref } from "@/lib/site";

const MATCH_FIELD =
  "mt-1 h-10 w-full rounded-xl border border-rule bg-paper px-3 text-sm text-ink";

export const metadata = { title: "Admin" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ opened?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const params = await searchParams;

  const [pendingRfqs, pendingSuppliers, quotes, rfqsOpen, types, approvedCount, typeLinks] = await Promise.all([
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
    prisma.category.findMany({
      where: { kind: "type", active: true },
      orderBy: { name: "asc" },
    }),
    prisma.supplierOrganisation.count({ where: { publicStatus: "approved" } }),
    prisma.supplierCategory.findMany({
      where: { supplier: { publicStatus: "approved" } },
      select: { categoryId: true },
    }),
  ]);

  const countByType: Record<string, number> = {};
  for (const row of typeLinks) {
    countByType[row.categoryId] = (countByType[row.categoryId] ?? 0) + 1;
  }

  const quotesPer =
    rfqsOpen > 0
      ? (quotes / Math.max(rfqsOpen, 1)).toFixed(1)
      : "—";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <AdminNav current="queues" />
      <h1 className="mt-4 font-display text-3xl">Admin · queues</h1>
      {params.opened != null ? (
        <p className="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm text-mark">
          RFQ opened. {params.opened} supplier{params.opened === "1" ? "" : "s"} notified.
        </p>
      ) : null}
      {params.error === "type" ? (
        <p className="mt-4 rounded-2xl bg-stop/10 px-4 py-3 text-sm text-stop">That supply type is not valid.</p>
      ) : null}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat n={pendingRfqs.length} l="Pending RFQs" />
        <Stat n={pendingSuppliers.length} l="Pending suppliers" />
        <Stat n={quotesPer} l="Quotes / open RFQ" />
        <Stat n={rfqsOpen} l="Open RFQs" />
      </div>

      <h2 className="mt-10 font-display text-2xl">RFQ queue</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Set the supply type, then open. That type’s approved suppliers get the RFQ. Leave type blank to notify all{" "}
        {approvedCount} approved suppliers (cap 12).
      </p>
      <div className="mt-4 space-y-4">
        {pendingRfqs.map((r) => (
          <div key={r.id} className="rounded-3xl border border-rule bg-sheet p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{r.title}</p>
              <Stamp>{r.status.replaceAll("_", " ")}</Stamp>
              {r.singleSupplierId ? <Stamp>Single supplier</Stamp> : null}
            </div>
            <p className="text-sm text-ink-soft">
              {r.buyerOrg.legalName} · {r.city} · {r.quantity} · {INDUSTRY_LABEL[r.industry] ?? r.industry}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Buyer type: {r.category?.name ?? "Not sure — classify below"}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{r.description}</p>
            <form action={openRfqAction} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="rfqId" value={r.id} />
              <label className="block text-sm">
                Supply type
                <select name="categoryId" defaultValue={r.categoryId ?? ""} className={MATCH_FIELD}>
                  <option value="">All approved suppliers ({approvedCount})</option>
                  {types.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({countByType[c.id] ?? 0})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Industry
                <select name="industry" defaultValue={r.industry} className={MATCH_FIELD}>
                  <option value="pharmaceutical">Pharmaceutical</option>
                  <option value="food_beverage">Food & Beverage</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
                <MarkButton type="submit">Classify + Open + match</MarkButton>
              </div>
            </form>
            <form action={rejectRfqAction} className="mt-3">
              <input type="hidden" name="rfqId" value={r.id} />
              <button className="border border-stop px-3 py-2 text-sm text-stop" type="submit">
                Reject
              </button>
            </form>
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
                  <a href={supplierHref(s.slug)} target="_blank" rel="noreferrer" className="underline hover:text-steel">
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
