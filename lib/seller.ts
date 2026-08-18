import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { SupplierOrganisation } from "@prisma/client";

export const sellerField =
  "mt-1 h-10 w-full rounded-xl border border-rule bg-paper px-3 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-mark focus:ring-4 focus:ring-mark/15";

export function listingSlug(title: string) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "listing";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export const SELLER_ERRORS: Record<string, string> = {
  incomplete: "Fill price, delivery days, and warranty.",
  closed: "That RFQ is no longer open.",
  notmatched: "This RFQ is not matched to you.",
  incomplete_business_details: "Address, NTN, CNIC, and a proof file are needed.",
  proof: "Business proof must be a PDF or image under 8 MB.",
  plant_photo: "Plant photo must be a JPG, PNG, or WebP under 8 MB.",
  listing: "Fill the required listing fields.",
  photo: "Photos must be JPG, PNG, or WebP under 8 MB.",
  deal: "That quote cannot be updated.",
};

export async function requireSeller() {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }
  const org = await prisma.supplierOrganisation.findUnique({
    where: { id: session.supplierOrgId },
  });
  if (!org) redirect("/login");
  return { session, org };
}

/** Listings waited on a review queue that does not exist. Org approval is the gate. */
export async function publishPendingListings(orgId: string) {
  await Promise.all([
    prisma.productListing.updateMany({
      where: { supplierId: orgId, status: "pending_review" },
      data: { status: "live" },
    }),
    prisma.usedMachineListing.updateMany({
      where: { sellerId: orgId, status: "pending_review" },
      data: { status: "live" },
    }),
  ]);
}

export function sellerChecks(org: Pick<
  SupplierOrganisation,
  "about" | "phone" | "whatsapp" | "coverUrl" | "address" | "ntn" | "cnic" | "businessProofUrl"
>) {
  return [
    { id: "about", label: "About the company", done: (org.about ?? "").trim().length >= 40, href: "/seller/profile" },
    { id: "phone", label: "Phone", done: Boolean(org.phone?.trim()), href: "/seller/profile" },
    { id: "whatsapp", label: "WhatsApp", done: Boolean(org.whatsapp?.trim()), href: "/seller/profile" },
    { id: "cover", label: "Plant photo", done: Boolean(org.coverUrl), href: "/seller/profile" },
    { id: "address", label: "Business address", done: Boolean(org.address?.trim()), href: "/seller/documents" },
    { id: "ntn", label: "NTN", done: Boolean(org.ntn?.trim()), href: "/seller/documents" },
    { id: "cnic", label: "CNIC", done: Boolean(org.cnic?.trim()), href: "/seller/documents" },
    { id: "proof", label: "Business proof", done: Boolean(org.businessProofUrl), href: "/seller/documents" },
  ];
}

export function needsDocuments(org: Pick<
  SupplierOrganisation,
  "address" | "ntn" | "cnic" | "businessProofUrl" | "publicStatus"
>) {
  return (
    !org.address?.trim() ||
    !org.ntn?.trim() ||
    !org.cnic?.trim() ||
    !org.businessProofUrl ||
    org.publicStatus === "rejected"
  );
}

export function sellerStatusCopy(org: Pick<SupplierOrganisation, "publicStatus" | "rejectionReason">) {
  if (org.publicStatus === "approved") return "Live. Matched RFQs appear under RFQs.";
  if (org.publicStatus === "rejected") {
    return org.rejectionReason || "Verification was rejected. Update documents and resubmit.";
  }
  return "Under review. Buyers cannot see this profile until ops approve it.";
}
