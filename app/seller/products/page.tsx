import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { archiveProductAction, logoutAction } from "@/app/actions";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { SellerHeader, SellerNav } from "@/components/seller-nav";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Seller products" };

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }
  const { saved, error } = await searchParams;
  const org = await prisma.supplierOrganisation.findUnique({
    where: { id: session.supplierOrgId },
    select: { displayName: true, publicStatus: true },
  });
  if (!org) redirect("/login");
  const products = await prisma.productListing.findMany({
    where: { supplierId: session.supplierOrgId, status: { not: "archived" } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

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

      {saved ? (
        <p className="mt-4 border border-live px-3 py-2 text-sm text-live">Product saved.</p>
      ) : null}
      {error === "missing" ? (
        <p className="mt-4 border border-stop px-3 py-2 text-sm text-stop">That listing was not found.</p>
      ) : null}

      {org.publicStatus !== "approved" ? (
        <p className="mt-4 border border-hold px-3 py-2 text-sm text-hold">
          New listings stay in review until your company profile is approved. Then they go live.
        </p>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">
          Publish sends an approved supplier listing live on the marketplace.
        </p>
      )}

      <div className="mt-6">
        <MarkButton href="/seller/products/new">Add product or service</MarkButton>
      </div>

      <div className="mt-6 overflow-hidden border border-rule bg-sheet">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-rule font-mono text-[11px] tracking-widest text-mill uppercase">
            <tr>
              <th className="px-3 py-2">Listing</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-rule">
                <td className="px-3 py-3">
                  <Link href={`/seller/products/${p.id}`} className="font-medium hover:text-steel">
                    {p.name}
                  </Link>
                  <p className="text-ink-soft">{p.kind}</p>
                </td>
                <td className="px-3 py-3">{p.category?.name ?? "—"}</td>
                <td className="px-3 py-3">{formatPkr(p.pricePkr, p.priceOnRequest)}</td>
                <td className="px-3 py-3">
                  <Stamp>{p.status.replaceAll("_", " ")}</Stamp>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/seller/products/${p.id}`} className="text-steel underline">
                      Edit
                    </Link>
                    {p.status === "live" ? (
                      <Link href={`/products/${p.slug}`} className="text-steel underline">
                        View
                      </Link>
                    ) : null}
                    <form action={archiveProductAction}>
                      <input type="hidden" name="productId" value={p.id} />
                      <button type="submit" className="text-stop underline">
                        Archive
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length ? (
          <p className="p-6 text-ink-soft">No products yet. Add your first listing.</p>
        ) : null}
      </div>
    </div>
  );
}
