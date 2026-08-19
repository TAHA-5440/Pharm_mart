import Link from "next/link";
import type { RfqStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { BuyerRfqTable } from "@/components/buyer-rfq-table";
import { MarkButton } from "@/components/mark-button";
import {
  CLOSED_RFQ,
  WAITING_RFQ,
  requireBuyer,
  rfqListInclude,
  type BuyerRfqRow,
} from "@/lib/buyer";
import { cn } from "@/lib/utils";

export const metadata = { title: "RFQs" };

const TABS = [
  { id: "all", label: "All" },
  { id: "waiting", label: "With ops" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
] as const;

function statusFilter(tab: string): RfqStatus[] | undefined {
  if (tab === "waiting") return WAITING_RFQ;
  if (tab === "open") return ["open"];
  if (tab === "closed") return CLOSED_RFQ;
  return undefined;
}

export default async function BuyerRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { org } = await requireBuyer();
  const sp = await searchParams;
  const tab = TABS.some((t) => t.id === sp.status) ? sp.status! : "all";
  const statuses = statusFilter(tab);

  const rfqs = await prisma.rfq.findMany({
    where: {
      buyerOrgId: org.id,
      ...(statuses ? { status: { in: statuses } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: rfqListInclude,
  });

  const empty =
    tab === "waiting"
      ? "No RFQs waiting on ops. Submitted requirements land here until Classify + Open."
      : tab === "open"
        ? "No open RFQs. After ops open a requirement, quotes appear here."
        : tab === "closed"
          ? "No cancelled, rejected, expired, or closed RFQs."
          : "No RFQs yet. Post a requirement — we match verified suppliers.";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">My RFQs</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Submitted is not open. Quotes stay at 0 until ops notify matched suppliers.
          </p>
        </div>
        <MarkButton href="/rfq/new">Post RFQ</MarkButton>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "all" ? "/buyer/rfqs" : `/buyer/rfqs?status=${t.id}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm",
              tab === t.id ? "bg-ink text-paper" : "bg-sheet text-ink-soft",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <BuyerRfqTable rfqs={rfqs as BuyerRfqRow[]} empty={empty} />
    </div>
  );
}
