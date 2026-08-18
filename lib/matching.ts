import { prisma } from "./db";

export async function matchSuppliersForRfq(rfqId: string) {
  const rfq = await prisma.rfq.findUnique({
    where: { id: rfqId },
    include: { category: true },
  });
  if (!rfq) return [];

  if (rfq.singleSupplierId) {
    await prisma.rfqMatch.upsert({
      where: {
        rfqId_supplierId: { rfqId, supplierId: rfq.singleSupplierId },
      },
      create: { rfqId, supplierId: rfq.singleSupplierId },
      update: {},
    });
    return [rfq.singleSupplierId];
  }

  const suppliers = await prisma.supplierOrganisation.findMany({
    where: {
      publicStatus: "approved",
      ...(rfq.categoryId
        ? { categories: { some: { categoryId: rfq.categoryId } } }
        : {}),
    },
    include: { categories: true },
    take: 40,
  });

  const industryKey =
    rfq.industry === "pharmaceutical"
      ? "pharmaceutical"
      : rfq.industry === "food_beverage"
        ? "food"
        : "";

  const scored = suppliers
    .map((s) => {
      const industries = s.industries.toLowerCase();
      const industryHit = industryKey ? industries.includes(industryKey) : true;
      const cityHit =
        s.city === rfq.city ||
        s.citiesServed.includes(rfq.city) ||
        s.citiesServed.toLowerCase().includes("pakistan");
      const verificationRank: Record<string, number> = {
        certified_seller: 6,
        premium_verified: 5,
        industry_verified: 4,
        verified_supplier: 3,
        business_verified: 2,
        registered: 1,
      };
      const score =
        (industryHit ? 30 : 0) +
        (cityHit ? 15 : 0) +
        (verificationRank[s.verification] ?? 0) * 5;
      return { id: s.id, score, cityHit };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  for (const row of scored) {
    await prisma.rfqMatch.upsert({
      where: { rfqId_supplierId: { rfqId, supplierId: row.id } },
      create: { rfqId, supplierId: row.id },
      update: {},
    });
  }

  return scored.map((s) => s.id);
}
