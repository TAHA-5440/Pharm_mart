import { prisma } from "@/lib/db";
import { SellerMachineForm } from "@/components/seller-machine-form";
import { requireSeller } from "@/lib/seller";

export const metadata = { title: "Add machine · Seller" };

export default async function NewSellerMachinePage() {
  const { org } = await requireSeller();
  const categories = await prisma.category.findMany({
    where: { kind: "type", active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <h2 className="text-xl font-semibold">Add used machine</h2>
      <p className="mt-1 text-sm text-ink-soft">Need manufacturer, model, condition, city, and a real description.</p>
      <div className="mt-5">
        <SellerMachineForm categories={categories} defaultCity={org.city} />
      </div>
    </section>
  );
}
