import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Gallery } from "@/components/gallery";
import { SpecList } from "@/components/spec-list";
import { ListingCard } from "@/components/listing-card";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { formatPkr, VERIFICATION_LABEL } from "@/lib/utils";
import { listingGallery, parseSpecs, resolvePhoto } from "@/lib/media";
import { getSession } from "@/lib/auth";
import { ListingViewBeacon } from "@/components/analytics-beacon";
import { SaveSupplierButton } from "@/components/save-supplier-button";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.productListing.findFirst({
    where: { slug, status: "live" },
  });
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.productListing.findFirst({
    where: { slug, status: "live" },
    include: { supplier: true, category: true },
  });
  if (!product) notFound();

  const session = await getSession();
  const next = encodeURIComponent(`/rfq/new?product=${product.slug}`);
  const rfqHref =
    session?.role === "buyer"
      ? `/rfq/new?product=${product.slug}`
      : `/login?next=${next}`;
  const savedSupplier =
    session?.role === "buyer"
      ? await prisma.savedSupplier.findUnique({
          where: { userId_supplierId: { userId: session.id, supplierId: product.supplierId } },
        })
      : null;

  const photos = listingGallery(product.imageUrl);
  const specRows: Array<[string, string]> = [
    ["Product", product.name],
    ["Type", product.kind === "service" ? "Service" : "Product"],
    ["Category", product.category?.name ?? "—"],
    ["Supplier", product.supplier.displayName],
    ["City", product.supplier.city],
    ["Price", formatPkr(product.pricePkr, product.priceOnRequest)],
    ["Lead time", product.leadDays ? `${product.leadDays} days` : "—"],
    ...parseSpecs(product.specs),
  ];

  const more = await prisma.productListing.findMany({
    where: {
      supplierId: product.supplierId,
      status: "live",
      id: { not: product.id },
    },
    include: { supplier: true },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <ListingViewBeacon
        kind="product"
        listingId={product.id}
        slug={product.slug}
        supplierId={product.supplierId}
      />
      <p className="text-sm text-ink-soft">
        <Link href="/marketplace" className="hover:text-ink">
          Marketplace
        </Link>
        {product.category ? (
          <>
            {" / "}
            <Link
              href={`/marketplace?category=${product.category.slug}`}
              className="hover:text-ink"
            >
              {product.category.name}
            </Link>
          </>
        ) : null}
        {" / "}
        {product.name}
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <Gallery photos={photos} alt={product.name} />
          <p className="mt-8 text-ink-soft">{product.shortDesc}</p>
          {product.longDesc ? (
            <p className="mt-3 text-ink-soft">{product.longDesc}</p>
          ) : null}
          <h2 className="mt-8 text-xl font-semibold">Specifications</h2>
          <div className="mt-4">
            <SpecList rows={specRows} />
          </div>
        </div>

        <aside className="md:col-span-5">
          <div className="rounded-3xl bg-sheet p-6 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:sticky md:top-24">
            <div className="flex flex-wrap gap-2">
              <Stamp>{product.kind === "service" ? "Service" : "Product"}</Stamp>
              <Stamp>{VERIFICATION_LABEL[product.supplier.verification]}</Stamp>
            </div>
            <h1 className="mt-4 text-3xl font-semibold">{product.name}</h1>
            <p className="mt-2 text-sm text-ink-soft">
              <Link href={`/suppliers/${product.supplier.slug}`} className="text-steel">
                {product.supplier.displayName}
              </Link>
              {" · "}
              {product.supplier.city}
            </p>
            <p className="mt-4 text-2xl font-semibold">
              {formatPkr(product.pricePkr, product.priceOnRequest)}
            </p>
            <div className="mt-5 space-y-3">
              <MarkButton href={rfqHref} className="w-full">
                Request quotation
              </MarkButton>
              {session?.role === "buyer" ? (
                <SaveSupplierButton
                  supplierId={product.supplierId}
                  saved={Boolean(savedSupplier)}
                  next={`/products/${product.slug}`}
                />
              ) : !session ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/login?next=/products/${product.slug}`}>Log in to save</Link>
                </Button>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-mill">
              Creates an RFQ. No cart, no checkout.
            </p>
          </div>
        </aside>
      </div>

      {more.length ? (
        <section className="mt-16">
          <h2 className="text-xl font-semibold">More from this supplier</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {more.map((p) => (
              <ListingCard
                key={p.id}
                href={`/products/${p.slug}`}
                photo={resolvePhoto(p.imageUrl)}
                alt={p.name}
                stamps={[p.kind === "service" ? "Service" : "Product"]}
                title={p.name}
                meta={`${p.supplier.displayName} · ${p.supplier.city}`}
                price={formatPkr(p.pricePkr, p.priceOnRequest)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
