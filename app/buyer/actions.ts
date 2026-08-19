"use server";

import { redirect } from "next/navigation";
import type { Industry } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession, createSession, safeNextPath } from "@/lib/auth";
import { CITIES } from "@/lib/utils";
import { isPkMobile, normalizePkMobile } from "@/lib/register-rules";
import { canCancelRfq, canExtendRfq, requireBuyer } from "@/lib/buyer";

function nextPath(formData: FormData, fallback: string) {
  return safeNextPath(String(formData.get("next") ?? "")) ?? fallback;
}

export async function cancelRfqAction(formData: FormData) {
  const { org } = await requireBuyer();
  const rfqId = String(formData.get("rfqId") ?? "");
  const rfq = await prisma.rfq.findFirst({
    where: { id: rfqId, buyerOrgId: org.id },
  });
  if (!rfq || !canCancelRfq(rfq.status)) {
    redirect(`/buyer/rfqs/${rfqId}?error=cancel`);
  }
  await prisma.rfq.update({
    where: { id: rfq.id },
    data: { status: "cancelled" },
  });
  redirect(`/buyer/rfqs/${rfq.id}`);
}

export async function extendRfqClosingAction(formData: FormData) {
  const { org } = await requireBuyer();
  const rfqId = String(formData.get("rfqId") ?? "");
  const rfq = await prisma.rfq.findFirst({
    where: { id: rfqId, buyerOrgId: org.id },
  });
  if (!rfq || !canExtendRfq(rfq.status)) {
    redirect(`/buyer/rfqs/${rfqId}?error=extend`);
  }
  const base = rfq.closingAt && rfq.closingAt > new Date() ? rfq.closingAt : new Date();
  const closing = new Date(base);
  closing.setDate(closing.getDate() + 7);
  await prisma.rfq.update({
    where: { id: rfq.id },
    data: { closingAt: closing },
  });
  redirect(`/buyer/rfqs/${rfq.id}`);
}

export async function updateBuyerCompanyAction(formData: FormData) {
  const { org } = await requireBuyer();
  const legalName = String(formData.get("legalName") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const ntn = String(formData.get("ntn") ?? "").trim();
  const industryRaw = String(formData.get("industry") ?? "");
  const industry: Industry =
    industryRaw === "food_beverage" || industryRaw === "other" || industryRaw === "pharmaceutical"
      ? industryRaw
      : org.industry;

  if (legalName.length < 2 || !(CITIES as readonly string[]).includes(city)) {
    redirect("/buyer/company?error=incomplete");
  }

  await prisma.buyerOrganisation.update({
    where: { id: org.id },
    data: {
      legalName,
      displayName: displayName || null,
      city,
      about: about || null,
      website: website || null,
      address: address || null,
      ntn: ntn || null,
      industry,
    },
  });
  redirect("/buyer/company");
}

export async function updateBuyerAccountAction(formData: FormData) {
  const { session } = await requireBuyer();
  const name = String(formData.get("name") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (name.length < 2) redirect("/buyer/company?error=incomplete");
  if (phone && !isPkMobile(phone)) redirect("/buyer/company?error=phone");

  await prisma.user.update({
    where: { id: session.id },
    data: {
      name,
      jobTitle: jobTitle || null,
      phone: phone ? normalizePkMobile(phone) : null,
    },
  });
  await createSession({
    id: session.id,
    email: session.email,
    name,
    role: session.role,
    buyerOrgId: session.buyerOrgId,
    supplierOrgId: session.supplierOrgId,
  });
  redirect("/buyer/company");
}

export async function toggleSavedSupplierAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "buyer") redirect("/login");
  const supplierId = String(formData.get("supplierId") ?? "");
  const next = nextPath(formData, "/buyer/saved");
  const supplier = await prisma.supplierOrganisation.findFirst({
    where: { id: supplierId, publicStatus: "approved" },
    select: { id: true },
  });
  if (!supplier) redirect(next);

  const existing = await prisma.savedSupplier.findUnique({
    where: { userId_supplierId: { userId: session.id, supplierId } },
  });
  if (existing) {
    await prisma.savedSupplier.delete({
      where: { userId_supplierId: { userId: session.id, supplierId } },
    });
  } else {
    await prisma.savedSupplier.create({
      data: { userId: session.id, supplierId },
    });
  }
  redirect(next);
}

export async function toggleFavouriteMachineAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "buyer") redirect("/login");
  const listingId = String(formData.get("listingId") ?? "");
  const next = nextPath(formData, "/buyer/saved");
  const listing = await prisma.usedMachineListing.findFirst({
    where: { id: listingId, status: "live" },
    select: { id: true },
  });
  if (!listing) redirect(next);

  const existing = await prisma.favouriteListing.findUnique({
    where: { userId_listingId: { userId: session.id, listingId } },
  });
  if (existing) {
    await prisma.favouriteListing.delete({
      where: { userId_listingId: { userId: session.id, listingId } },
    });
  } else {
    await prisma.favouriteListing.create({
      data: { userId: session.id, listingId },
    });
  }
  redirect(next);
}

export async function markNotificationsReadAction() {
  const { session } = await requireBuyer();
  await prisma.notification.updateMany({
    where: { userId: session.id, read: false },
    data: { read: true },
  });
  redirect("/buyer");
}
