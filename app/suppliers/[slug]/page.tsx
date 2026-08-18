import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { PhotoFrame } from "@/components/photo-frame";
import { ListingCard } from "@/components/listing-card";
import { VERIFICATION_LABEL, formatPkr } from "@/lib/utils";
import { resolvePhoto } from "@/lib/media";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [supplier, session] = await Promise.all([
    prisma.supplierOrganisation.findUnique({
      where: { slug },
      include: {
        products: { where: { status: "live" } },
        machines: { where: { status: "live" } },
      },
    }),
    getSession(),
  ]);

  if (!supplier) notFound();
  const isOwner = session?.supplierOrgId === supplier.id;
  const isAdmin = session?.role === "admin";
  if (supplier.publicStatus !== "approved" && !isOwner && !isAdmin) notFound();
  const rfqHref =
    session?.role === "buyer"
      ? `/rfq/new?supplier=${supplier.slug}`
      : "/login?next=/rfq/new";

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-12 md:px-6">
      <div className="space-y-8 md:col-span-7">
        {supplier.coverUrl ? (
          <PhotoFrame
            src={supplier.coverUrl}
            alt={`${supplier.displayName} workshop`}
            className="aspect-[16/8]"
            priority
          />
        ) : null}
        <div>
          <h1 className="text-4xl font-semibold">{supplier.displayName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Stamp>{VERIFICATION_LABEL[supplier.verification]}</Stamp>
            {supplier.publicStatus !== "approved" ? (
              <Stamp>Preview — not public</Stamp>
            ) : null}
            <span className="text-sm text-ink-soft">
              {supplier.city} · {supplier.industries.replaceAll(",", " / ")}
            </span>
          </div>
        </div>
        {supplier.tagline ? (
          <p className="mt-3 text-lg">{supplier.tagline}</p>
        ) : null}
        <p className="max-w-2xl text-ink-soft">{supplier.about}</p>
        {supplier.servicesOffered ? (
          <p className="text-sm text-ink-soft">Services: {supplier.servicesOffered}</p>
        ) : null}
        {supplier.citiesServed ? (
          <p className="text-sm text-ink-soft">Serves: {supplier.citiesServed}</p>
        ) : null}
        <div>
          <h2 className="text-2xl font-semibold">Products and services</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {supplier.products.map((p) => (
              <ListingCard
                key={p.id}
                href={`/products/${p.slug}`}
                photo={resolvePhoto(p.imageUrl)}
                alt={p.name}
                stamps={["Product"]}
                title={p.name}
                meta={p.shortDesc}
                price={formatPkr(p.pricePkr, p.priceOnRequest)}
              />
            ))}
          </div>
        </div>
        {supplier.machines.length ? (
          <div>
            <h2 className="text-2xl font-semibold">Used machinery</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {supplier.machines.map((m) => (
                <ListingCard
                  key={m.id}
                  href={`/machines/${m.slug}`}
                  photo={resolvePhoto(m.photoUrls)}
                  alt={m.title}
                  stamps={[m.condition.replace("_", " ")]}
                  title={m.title}
                  meta={`${m.manufacturer} ${m.model} · ${m.city}`}
                  price={formatPkr(m.pricePkr, m.requestPrice)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <aside className="md:col-span-5">
        <div className="space-y-3 rounded-3xl bg-sheet p-6 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:sticky md:top-24">
          <Stamp>{VERIFICATION_LABEL[supplier.verification]}</Stamp>
          <p className="text-sm">{supplier.city}</p>
          {supplier.yearEstablished ? (
            <p className="text-sm text-ink-soft">Established {supplier.yearEstablished}</p>
          ) : null}
          {supplier.catalogueUrl ? (
            <Button asChild variant="outline" className="w-full">
              <a href={supplier.catalogueUrl} target="_blank" rel="noreferrer">
                Download catalogue
              </a>
            </Button>
          ) : null}
          <MarkButton href={rfqHref} className="w-full">
            Request quotation
          </MarkButton>
          {session ? (
            <Button asChild variant="outline" className="w-full">
              <a href={`tel:${supplier.phone}`}>Call</a>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Log in to call</Link>
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}
