import Link from "next/link";
import { prisma } from "@/lib/db";
import { ListingCard } from "@/components/listing-card";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { Input } from "@/components/ui/input";
import { CITIES, VERIFICATION_LABEL, formatPkr } from "@/lib/utils";
import { resolvePhoto } from "@/lib/media";
import { getSession } from "@/lib/auth";
import { SearchQueryBeacon } from "@/components/analytics-beacon";

export const metadata = { title: "Marketplace" };

function hrefWith(
  base: Record<string, string | undefined>,
  patch: Record<string, string | undefined>,
) {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if (v) params.set(k, v);
  }
  const q = params.toString();
  return q ? `/marketplace?${q}` : "/marketplace";
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
    city?: string;
  }>;
}) {
  const sp = await searchParams;
  const type = sp.type ?? "all";
  const q = sp.q?.trim() ?? "";
  const session = await getSession();
  const query = { q: sp.q, type: sp.type, category: sp.category, city: sp.city };

  const categories = await prisma.category.findMany({
    where: { kind: "type", active: true },
    orderBy: { name: "asc" },
  });
  const category = sp.category
    ? categories.find((c) => c.slug === sp.category)
    : null;

  const qFilter = { contains: q, mode: "insensitive" as const };
  const productWhere = {
    status: "live" as const,
    ...(q
      ? {
          OR: [
            { name: qFilter },
            { shortDesc: qFilter },
            { specs: qFilter },
          ],
        }
      : {}),
    ...(category ? { categoryId: category.id } : {}),
    ...(sp.city ? { supplier: { city: sp.city } } : {}),
  };

  const machineWhere = {
    status: "live" as const,
    ...(q
      ? {
          OR: [
            { title: qFilter },
            { manufacturer: qFilter },
            { model: qFilter },
            { city: qFilter },
          ],
        }
      : {}),
    ...(category ? { categoryId: category.id } : {}),
    ...(sp.city ? { city: sp.city } : {}),
  };

  const [products, machines, suppliers] = await Promise.all([
    type === "machines" || type === "suppliers"
      ? Promise.resolve([])
      : prisma.productListing.findMany({
          where: productWhere,
          include: { supplier: true, category: true },
          orderBy: { createdAt: "desc" },
          take: 24,
        }),
    type === "products" || type === "suppliers"
      ? Promise.resolve([])
      : prisma.usedMachineListing.findMany({
          where: machineWhere,
          orderBy: { createdAt: "desc" },
          take: 24,
        }),
    type === "suppliers"
      ? prisma.supplierOrganisation.findMany({
          where: {
            publicStatus: "approved",
            ...(q
              ? {
                  OR: [
                    { displayName: qFilter },
                    { about: qFilter },
                    { city: qFilter },
                  ],
                }
              : {}),
            ...(category
              ? { categories: { some: { categoryId: category.id } } }
              : {}),
            ...(sp.city ? { city: sp.city } : {}),
          },
          include: { categories: { include: { category: true } } },
          orderBy: { displayName: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const listings = [
    ...products.map((p) => ({
      href: `/products/${p.slug}`,
      photo: resolvePhoto(p.imageUrl),
      alt: p.name,
      stamps: [p.kind === "service" ? "Service" : "Product"],
      title: p.name,
      meta: `${p.supplier.displayName} · ${p.supplier.city}`,
      price: formatPkr(p.pricePkr, p.priceOnRequest),
      createdAt: p.createdAt,
    })),
    ...machines.map((m) => ({
      href: `/machines/${m.slug}`,
      photo: resolvePhoto(m.photoUrls),
      alt: m.title,
      stamps: [
        m.condition.replace("_", " "),
        ...(m.inspection ? ["Inspection"] : []),
      ],
      title: m.title,
      meta: `${m.manufacturer} ${m.model} · ${m.city}`,
      price: formatPkr(m.pricePkr, m.requestPrice),
      createdAt: m.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const tabs = [
    ["all", "All"],
    ["products", "Products"],
    ["machines", "Used machinery"],
    ["suppliers", "Suppliers"],
  ] as const;

  const resultCount =
    type === "suppliers" ? suppliers.length : listings.length;

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-8">
      <SearchQueryBeacon
        q={q}
        type={type}
        category={sp.category}
        city={sp.city}
        results={resultCount}
      />
      <h1 className="text-3xl font-semibold md:text-4xl">Marketplace</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Search products, used machines, and suppliers. Open a listing for
        specifications and photographs. Request a quotation — do not check out.
      </p>

      <form action="/marketplace" className="mt-6 max-w-xl">
        {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
        {sp.category ? <input type="hidden" name="category" value={sp.category} /> : null}
        {sp.city ? <input type="hidden" name="city" value={sp.city} /> : null}
        <Input name="q" defaultValue={q} placeholder="Search products, machines, suppliers…" />
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <Link
            key={id}
            href={hrefWith(query, { type: id === "all" ? undefined : id })}
            className={`rounded-full px-4 py-2 text-sm ${
              type === id || (id === "all" && type === "all")
                ? "bg-ink text-paper"
                : "bg-sheet text-ink-soft"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <p className="mt-4 text-sm text-mill">
        {resultCount} {type === "suppliers" ? "suppliers" : "listings"}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 rounded-3xl bg-sheet p-4 md:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-mill">Category</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link
                  href={hrefWith(query, { category: undefined })}
                  className={!sp.category ? "font-medium text-ink" : "text-ink-soft"}
                >
                  All categories
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={hrefWith(query, { category: c.slug })}
                    className={
                      sp.category === c.slug ? "font-medium text-ink" : "text-ink-soft"
                    }
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-mill">City</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link
                  href={hrefWith(query, { city: undefined })}
                  className={!sp.city ? "font-medium text-ink" : "text-ink-soft"}
                >
                  All cities
                </Link>
              </li>
              {CITIES.slice(0, 8).map((city) => (
                <li key={city}>
                  <Link
                    href={hrefWith(query, { city })}
                    className={sp.city === city ? "font-medium text-ink" : "text-ink-soft"}
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/marketplace" className="block text-sm text-steel">
            Clear filters
          </Link>
          <MarkButton href="/rfq/new" className="w-full">
            Post RFQ
          </MarkButton>
        </aside>

        <div>
          {type === "suppliers" ? (
            <div className="space-y-3">
              {suppliers.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-3xl bg-sheet p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <Link href={`/suppliers/${s.slug}`} className="font-semibold hover:text-steel">
                      {s.displayName}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Stamp>{VERIFICATION_LABEL[s.verification]}</Stamp>
                      <span className="text-sm text-ink-soft">{s.city}</span>
                    </div>
                  </div>
                  <MarkButton
                    href={
                      session
                        ? `/rfq/new?supplier=${s.slug}`
                        : "/login?next=/rfq/new"
                    }
                  >
                    Request quotation
                  </MarkButton>
                </div>
              ))}
              {!suppliers.length ? (
                <p className="text-ink-soft">
                  No suppliers match these filters.{" "}
                  <Link href="/rfq/new" className="text-steel">
                    Post an RFQ
                  </Link>
                </p>
              ) : null}
            </div>
          ) : listings.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map(({ createdAt: _createdAt, ...item }) => (
                <ListingCard key={item.href} {...item} />
              ))}
            </div>
          ) : (
            <p className="text-ink-soft">
              No listings match these filters.{" "}
              <Link href="/marketplace" className="text-steel">
                Clear filters
              </Link>{" "}
              or{" "}
              <Link href="/rfq/new" className="text-steel">
                post an RFQ
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
