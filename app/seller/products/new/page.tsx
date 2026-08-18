import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/app/actions";
import { ProductForm } from "@/components/product-form";
import { SellerHeader, SellerNav } from "@/components/seller-nav";

export const metadata = { title: "Add product" };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }
  const { error } = await searchParams;
  const [org, categories] = await Promise.all([
    prisma.supplierOrganisation.findUnique({
      where: { id: session.supplierOrgId },
      select: { displayName: true },
    }),
    prisma.category.findMany({
      where: { kind: "type", active: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!org) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <SellerHeader name={org.displayName}>
        <form action={logoutAction}>
          <button className="text-sm text-ink-soft underline" type="submit">
            Log out
          </button>
        </form>
      </SellerHeader>
      <SellerNav current="products" />
      <Link href="/seller/products" className="mt-4 inline-block text-sm text-steel">
        ← Products
      </Link>
      <h2 className="mt-4 font-display text-2xl">Add product or service</h2>
      <ProductForm categories={categories} error={error} />
    </div>
  );
}
