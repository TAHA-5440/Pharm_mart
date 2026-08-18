import Link from "next/link";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { archiveSellerProductAction } from "@/app/seller/listing-actions";
import { requireSeller, SELLER_ERRORS } from "@/lib/seller";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Products · Seller" };

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { org } = await requireSeller();
  const params = await searchParams;
  const error = params.error ? SELLER_ERRORS[params.error] : null;
  const products = await prisma.productListing.findMany({
    where: { supplierId: org.id, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Live listings show on your public page once this company is approved. There is no separate listing queue.
          </p>
        </div>
        <MarkButton href="/seller/products/new">Add product</MarkButton>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}
      {products.length ? (
        <ul className="mt-5 divide-y divide-rule">
          {products.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <Link href={`/seller/products/${p.id}`} className="font-medium hover:text-steel">
                  {p.name}
                </Link>
                <p className="text-sm text-ink-soft">{p.shortDesc}</p>
              </div>
              <div className="flex items-center gap-2">
                <Stamp>{p.status.replaceAll("_", " ")}</Stamp>
                <span className="text-sm tabular-nums text-ink-soft">{formatPkr(p.pricePkr, p.priceOnRequest)}</span>
                <form action={archiveSellerProductAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-sm text-ink-soft underline" type="submit">
                    Archive
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-2xl bg-paper px-4 py-8 text-center text-sm text-ink-soft">
          No products yet. Add the equipment or services you actually supply.
        </p>
      )}
    </section>
  );
}
