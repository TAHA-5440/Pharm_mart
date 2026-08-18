import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/app/actions";
import { ProductForm } from "@/components/product-form";
import { SellerHeader, SellerNav } from "@/components/seller-nav";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }
  const { id } = await params;
  const { error } = await searchParams;
  const [org, product, categories] = await Promise.all([
    prisma.supplierOrganisation.findUnique({
      where: { id: session.supplierOrgId },
      select: { displayName: true },
    }),
    prisma.productListing.findFirst({
      where: { id, supplierId: session.supplierOrgId },
    }),
    prisma.category.findMany({
      where: { kind: "type", active: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!org) redirect("/login");
  if (!product) notFound();

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
      <h2 className="mt-4 font-display text-2xl">Edit {product.name}</h2>
      <ProductForm
        categories={categories}
        error={error}
        product={{
          id: product.id,
          name: product.name,
          kind: product.kind,
          categoryId: product.categoryId,
          shortDesc: product.shortDesc,
          longDesc: product.longDesc,
          specs: product.specs,
          leadDays: product.leadDays,
          pricePkr: product.pricePkr,
          priceOnRequest: product.priceOnRequest,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  );
}
