import { redirect } from "next/navigation";
import type { RfqStatus } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const buyerField =
  "mt-1 h-10 w-full rounded-xl border border-rule bg-paper px-3 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-mark focus:ring-4 focus:ring-mark/15";

export const BUYER_ERRORS: Record<string, string> = {
  incomplete: "Fill company name and city.",
  phone: "Enter a Pakistani mobile like 03XXXXXXXXX, or leave blank.",
  cancel: "That RFQ cannot be cancelled.",
  extend: "Closing can only be extended while the RFQ is open.",
};

export const WAITING_RFQ: RfqStatus[] = ["submitted", "under_review", "changes_requested"];
export const CLOSED_RFQ: RfqStatus[] = ["rejected", "expired", "cancelled", "closed"];

export const RFQ_STATUS_COPY: Record<string, string> = {
  draft: "Draft — not submitted. Suppliers cannot see this.",
  submitted: "We’ll review and notify matching suppliers. This RFQ is not public.",
  under_review: "Ops are classifying the supply type. Suppliers are not notified yet.",
  changes_requested: "Ops asked for a clearer spec. Edit is not self-serve yet — cancel and post again, or wait for ops.",
  open: "Matched suppliers can quote until closing. Compare quotations on this page.",
  rejected: "Ops declined this requirement. Suppliers were not notified.",
  expired: "Closing date passed. Existing quotes are read-only.",
  cancelled: "You cancelled this RFQ. Suppliers see it as cancelled.",
  closed: "This requirement is complete. Quotes are read-only.",
};

export function rfqStampClass(status: string) {
  if (status === "open") return "bg-sage text-mark";
  if (status === "submitted" || status === "under_review" || status === "changes_requested") {
    return "bg-[#f4e6d8] text-hold";
  }
  if (status === "rejected" || status === "cancelled") return "bg-stop/10 text-stop";
  return "";
}

export function quoteStampClass(status: string) {
  if (status === "withdrawn") return "bg-stop/10 text-stop";
  if (status === "won") return "bg-sage text-mark";
  if (status === "lost" || status === "declined") return "bg-[#f4e6d8] text-hold";
  return "";
}

export function formatPkDate(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });
}

export function canCancelRfq(status: string) {
  return ["draft", "submitted", "under_review", "changes_requested", "open"].includes(status);
}

export function canExtendRfq(status: string) {
  return status === "open";
}

export function quotesStamp(n: number) {
  if (n <= 0) return "0 quotes";
  if (n === 1) return "1 quote";
  return `${n} quotes`;
}

export function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export async function requireBuyer() {
  const session = await getSession();
  if (!session || session.role !== "buyer" || !session.buyerOrgId) {
    redirect("/login");
  }
  const [org, user] = await Promise.all([
    prisma.buyerOrganisation.findUnique({ where: { id: session.buyerOrgId } }),
    prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, phone: true, jobTitle: true },
    }),
  ]);
  if (!org || !user) redirect("/login");
  return { session, org, user };
}

export const rfqListInclude = {
  category: { select: { name: true } },
  _count: { select: { quotes: true, matches: true } },
} as const;

export type BuyerRfqRow = {
  id: string;
  title: string;
  status: string;
  city: string;
  quantity: string;
  neededBy: string;
  closingAt: Date | null;
  createdAt: Date;
  singleSupplierId: string | null;
  category: { name: string } | null;
  _count: { quotes: number; matches: number };
};
