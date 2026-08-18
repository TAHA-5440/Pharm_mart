import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SellerMachineForm } from "@/components/seller-machine-form";
import { requireSeller } from "@/lib/seller";

export const metadata = { title: "Edit machine · Seller" };

export default async function EditSellerMachinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { org } = await requireSeller();
  const { id } = await params;
  const [machine, categories] = await Promise.all([
    prisma.usedMachineListing.findFirst({ where: { id, sellerId: org.id } }),
    prisma.category.findMany({
      where: { kind: "type", active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!machine) notFound();

  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <h2 className="text-xl font-semibold">Edit machine</h2>
      <p className="mt-1 text-sm text-ink-soft">A new photo set goes back to review if the listing was live.</p>
      <div className="mt-5">
        <SellerMachineForm categories={categories} machine={machine} />
      </div>
    </section>
  );
}
