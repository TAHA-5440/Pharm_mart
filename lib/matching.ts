import { prisma } from "./db";

export const MATCH_CAP = 12;

async function categoryScope(categoryId: string) {
  const cat = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { children: { select: { id: true } } },
  });
  if (!cat) return [categoryId];
  if (cat.children.length) return [cat.id, ...cat.children.map((c) => c.id)];
  return [cat.id];
}

function industryHit(industries: string, rfqIndustry: string) {
  const hay = industries.toLowerCase();
  if (rfqIndustry === "pharmaceutical") return hay.includes("pharmaceutical");
  if (rfqIndustry === "food_beverage") return hay.includes("food");
  return true;
}

function scoreSupplier(input: {
  industries: string;
  city: string;
  citiesServed: string;
  verification: string;
  rfqIndustry: string;
  rfqCity: string;
}) {
  const cityHit =
    input.city === input.rfqCity ||
    input.citiesServed.includes(input.rfqCity) ||
    input.citiesServed.toLowerCase().includes("pakistan");
  const verificationRank: Record<string, number> = {
    certified_seller: 6,
    premium_verified: 5,
    industry_verified: 4,
    verified_supplier: 3,
    business_verified: 2,
    registered: 1,
  };
  return (
    (industryHit(input.industries, input.rfqIndustry) ? 30 : 0) +
    (cityHit ? 15 : 0) +
    (verificationRank[input.verification] ?? 0) * 5
  );
}

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

  const typeIds = rfq.categoryId ? await categoryScope(rfq.categoryId) : [];
  const suppliers = await prisma.supplierOrganisation.findMany({
    where: {
      publicStatus: "approved",
      ...(typeIds.length
        ? {
            OR: [
              { categories: { some: { categoryId: { in: typeIds } } } },
              { products: { some: { categoryId: { in: typeIds }, status: "live" } } },
              { machines: { some: { categoryId: { in: typeIds }, status: "live" } } },
            ],
          }
        : {}),
    },
  });

  const scored = suppliers
    .map((s) => ({
      id: s.id,
      score: scoreSupplier({
        industries: s.industries,
        city: s.city,
        citiesServed: s.citiesServed,
        verification: s.verification,
        rfqIndustry: rfq.industry,
        rfqCity: rfq.city,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MATCH_CAP);

  for (const row of scored) {
    await prisma.rfqMatch.upsert({
      where: { rfqId_supplierId: { rfqId, supplierId: row.id } },
      create: { rfqId, supplierId: row.id },
      update: {},
    });
  }

  return scored.map((s) => s.id);
}
