"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { trackEvent } from "@/lib/analytics";

export async function recordSupplierProfileViewAction(slug: string) {
  const supplier = await prisma.supplierOrganisation.findUnique({
    where: { slug },
    select: { id: true, publicStatus: true },
  });
  if (!supplier || supplier.publicStatus !== "approved") return;

  const session = await getSession();
  if (session?.role === "admin") return;
  if (session?.supplierOrgId === supplier.id) return;

  await prisma.supplierOrganisation.update({
    where: { id: supplier.id },
    data: { profileViews: { increment: 1 } },
  });
  await trackEvent("profile_view", { supplierId: supplier.id, slug }, session?.id ?? null);
}
