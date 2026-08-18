import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SellerProductForm } from "@/components/seller-product-form";
import { requireSeller } from "@/lib/seller";

export const metadata = { title: "Edit product · Seller" };

export default async function EditSellerProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { org } = await requireSeller();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.productListing.findFirst({ where: { id, supplierId: org.id } }),
    prisma.category.findMany({
      where: { kind: "type", active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!product) notFound();

  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <h2 className="text-xl font-semibold">Edit product</h2>
      <p className="mt-1 text-sm text-ink-soft">Text stays live. A new photo goes back to review.</p>
      <div className="mt-5">
        <SellerProductForm categories={categories} product={product} />
      </div>
    </section>
  );
}
