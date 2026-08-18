import { prisma } from "@/lib/db";
import { SellerProductForm } from "@/components/seller-product-form";
import { requireSeller } from "@/lib/seller";

export const metadata = { title: "Add product · Seller" };

export default async function NewSellerProductPage() {
  await requireSeller();
  const categories = await prisma.category.findMany({
    where: { kind: "type", active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <h2 className="text-xl font-semibold">Add product</h2>
      <p className="mt-1 text-sm text-ink-soft">Buyers see this on your mini-site once it is live.</p>
      <div className="mt-5">
        <SellerProductForm categories={categories} />
      </div>
    </section>
  );
}
