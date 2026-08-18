import Link from "next/link";
import { prisma } from "@/lib/db";
import { PhotoFrame } from "@/components/photo-frame";
import { ListingCard } from "@/components/listing-card";
import { Stamp } from "@/components/stamp";
import { Button } from "@/components/ui/button";
import { MarkButton } from "@/components/mark-button";
import { CITIES, VERIFICATION_LABEL, formatPkr } from "@/lib/utils";
import { PHOTOS, resolvePhoto } from "@/lib/media";

export default async function HomePage() {
  const [productCount, machineCount, supplierCount, products, machines, types, suppliers] =
    await Promise.all([
      prisma.productListing.count({ where: { status: "live" } }),
      prisma.usedMachineListing.count({ where: { status: "live" } }),
      prisma.supplierOrganisation.count({ where: { publicStatus: "approved" } }),
      prisma.productListing.findMany({
        where: { status: "live" },
        include: { supplier: true },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),
      prisma.usedMachineListing.findMany({
        where: { status: "live" },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),
      prisma.category.findMany({
        where: { kind: "type", active: true },
        orderBy: { name: "asc" },
        take: 8,
      }),
      prisma.supplierOrganisation.findMany({
        where: { publicStatus: "approved" },
        orderBy: { displayName: "asc" },
        take: 3,
      }),
    ]);

  const samples = [
    ...products.map((p) => ({
      href: `/products/${p.slug}`,
      photo: resolvePhoto(p.imageUrl),
      alt: p.name,
      stamps: [p.kind === "service" ? "Service" : "Product"],
      title: p.name,
      meta: `${p.supplier.displayName} · ${p.supplier.city}`,
      price: formatPkr(p.pricePkr, p.priceOnRequest),
    })),
    ...machines.map((m) => ({
      href: `/machines/${m.slug}`,
      photo: resolvePhoto(m.photoUrls),
      alt: m.title,
      stamps: [m.condition.replace("_", " "), ...(m.inspection ? ["Inspection"] : [])],
      title: m.title,
      meta: `${m.manufacturer} ${m.model} · ${m.city}`,
      price: formatPkr(m.pricePkr, m.requestPrice),
    })),
  ].slice(0, 4);

  return (
    <div className="home-glass pb-16">
      <section className="px-4 pt-6 md:px-6">
        <div className="relative mx-auto min-h-[560px] max-w-7xl overflow-hidden rounded-[2rem] md:min-h-[680px]">
          <PhotoFrame
            src="/images/hero-live.jpg"
            alt="Industrial warehouse and process hall"
            className="absolute inset-0 rounded-[2rem]"
            sizes="100vw"
            priority
            pan
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-white/10" />
          <div className="relative z-10 flex min-h-[560px] items-end p-5 md:min-h-[680px] md:p-8">
            <div className="glass-ink max-w-2xl rounded-[1.75rem] p-7 text-white md:p-10">
              <p className="text-sm font-medium text-white/80">
                Pakistan · Pharma · Food · Machinery
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.05]">
                Find trusted industrial suppliers
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/80">
                One requirement. Multiple verified quotations. Pakistan-first
                procurement for manufacturing plants — not a shopping cart.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <MarkButton href="/rfq/new">Post an RFQ</MarkButton>
                <Button
                  asChild
                  className="border border-white/40 bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                >
                  <Link href="/marketplace">Browse marketplace</Link>
                </Button>
              </div>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/20 pt-6">
                {[
                  [String(supplierCount).padStart(2, "0"), "Suppliers"],
                  [String(productCount).padStart(2, "0"), "Products"],
                  [String(machineCount).padStart(2, "0"), "Machines"],
                ].map(([n, label]) => (
                  <div key={label}>
                    <p className="text-2xl font-semibold tabular-nums md:text-3xl">{n}</p>
                    <p className="mt-0.5 text-sm text-white/70">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="glass max-w-2xl rounded-[1.5rem] p-6 md:p-8">
          <p className="text-sm font-medium text-mark">What you can find</p>
          <h2 className="mt-1 text-3xl font-semibold">A specification desk, not a shop</h2>
          <p className="mt-2 text-ink-soft">
            Plants source verified suppliers, products, and used machinery here
            instead of WhatsApp chains.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              href: "/marketplace?type=products",
              img: PHOTOS.line,
              title: "Products & services",
              line: "Vessels, lines, lab gear, HVAC, fabrication, spares.",
              count: `${productCount} live`,
            },
            {
              href: "/marketplace?type=machines",
              img: PHOTOS.lab,
              title: "Used machinery",
              line: "Make, model, year, condition, city, price or on request.",
              count: `${machineCount} live`,
            },
            {
              href: "/marketplace?type=suppliers",
              img: PHOTOS.workshop,
              title: "Verified suppliers",
              line: "Workshops with stamps — not a phone book.",
              count: `${supplierCount} live`,
            },
          ].map((tile) => (
            <Link key={tile.href} href={tile.href} className="group relative block">
              <PhotoFrame src={tile.img} alt={tile.title} className="aspect-[4/5]" />
              <div className="absolute inset-x-3 bottom-3">
                <div className="glass-ink rounded-2xl p-4 text-white">
                  <p className="text-lg font-semibold">{tile.title}</p>
                  <p className="mt-1 text-sm text-white/80">{tile.line}</p>
                  <p className="mt-2 text-xs font-medium text-white/60">{tile.count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="glass grid gap-8 rounded-[2rem] p-6 md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <div>
            <p className="text-sm font-medium text-mark">How it works</p>
            <h2 className="mt-1 text-3xl font-semibold">Post once. Compare quotes.</h2>
            <p className="mt-3 text-ink-soft">
              A PKR 25 million press is compared on a table, not added to a bag.
            </p>
            <Link
              href="/how-it-works"
              className="mt-6 inline-block text-sm font-medium text-mark"
            >
              Full process →
            </Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {[
              ["01", "Post a requirement", "Specs, quantity, city, timeline."],
              ["02", "We match suppliers", "3–5 verified-enough workshops."],
              ["03", "Compare quotations", "Price, delivery, warranty, stamp."],
              ["04", "Message or call", "Then you contract off-site."],
            ].map(([n, t, d]) => (
              <li key={n} className="glass-pill rounded-2xl p-4">
                <p className="text-sm font-semibold text-mark">{n}</p>
                <p className="mt-1 font-semibold">{t}</p>
                <p className="mt-1 text-sm text-ink-soft">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="glass inline-block rounded-[1.5rem] px-6 py-5">
          <p className="text-sm font-medium text-mark">Industries</p>
          <h2 className="mt-1 text-3xl font-semibold">Pharma and food first</h2>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["Pharmaceutical", PHOTOS.lab],
            ["Food & beverage", PHOTOS.tanks],
            ["Packaging", PHOTOS.line],
            ["Laboratory", PHOTOS.scope],
            ["Machinery", PHOTOS.gears],
          ].map(([title, img]) => (
            <Link key={title} href="/marketplace" className="relative block">
              <PhotoFrame src={img} alt={title} className="aspect-[4/3]" />
              <p className="glass-ink absolute inset-x-2 bottom-2 rounded-full px-3 py-1.5 text-center text-sm font-medium text-white">
                {title}
              </p>
            </Link>
          ))}
        </div>
        {types.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {types.map((c) => (
              <Link
                key={c.id}
                href={`/marketplace?category=${c.slug}`}
                className="glass-pill rounded-full px-4 py-2 text-sm"
              >
                {c.name}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="glass inline-block rounded-[1.5rem] px-6 py-5">
          <p className="text-sm font-medium text-mark">Who it is for</p>
          <h2 className="mt-1 text-3xl font-semibold">Two desks, one network</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-[1.5rem] p-8">
            <p className="text-sm font-medium text-mark">Buyers</p>
            <h3 className="mt-2 text-2xl font-semibold">Procurement managers</h3>
            <ul className="mt-4 space-y-2 text-ink-soft">
              <li>Post one RFQ — free.</li>
              <li>Receive comparable quotes, not a bazaar of 40 sellers.</li>
              <li>Browse products and used machines with specs first.</li>
            </ul>
            <div className="mt-6">
              <MarkButton href="/rfq/new">Post an RFQ</MarkButton>
            </div>
          </div>
          <div className="glass rounded-[1.5rem] p-8">
            <p className="text-sm font-medium text-mark">Suppliers</p>
            <h3 className="mt-2 text-2xl font-semibold">Workshops and dealers</h3>
            <ul className="mt-4 space-y-2 text-ink-soft">
              <li>Get matched industrial demand — not directory traffic.</li>
              <li>Quote price, delivery, warranty, PDF.</li>
              <li>Public mini-website: products, used machines, stamps.</li>
            </ul>
            <div className="mt-6">
              <Button asChild variant="outline" className="border-white/50 bg-white/30">
                <Link href="/register">Register as supplier</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-[1.5rem] p-8">
            <p className="text-sm font-medium text-mark">Trust</p>
            <h2 className="mt-1 text-3xl font-semibold">Verification is a stamp</h2>
            <p className="mt-2 text-ink-soft">
              Levels are earned. We do not sell a featured badge that looks like
              verification. Quotes are not purchase orders.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Registered", "Business verified", "Verified supplier", "Industry verified"].map(
                (s) => (
                  <Stamp key={s} className="glass-pill bg-transparent">
                    {s}
                  </Stamp>
                ),
              )}
            </div>
            {suppliers.length ? (
              <div className="mt-6 space-y-3">
                {suppliers.map((s) => (
                  <Link
                    key={s.id}
                    href={`/suppliers/${s.slug}`}
                    className="glass-pill block rounded-2xl px-4 py-3"
                  >
                    <p className="font-medium">{s.displayName}</p>
                    <p className="text-sm text-ink-soft">
                      {VERIFICATION_LABEL[s.verification]} · {s.city}
                    </p>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <div className="glass rounded-[1.5rem] p-8">
            <p className="text-sm font-medium text-mark">Cities</p>
            <h2 className="mt-1 text-3xl font-semibold">Sourcing across Pakistan</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {CITIES.filter((c) => c !== "Other").map((city) => (
                <Link
                  key={city}
                  href={`/marketplace?city=${encodeURIComponent(city)}`}
                  className="glass-pill rounded-full px-4 py-2 text-sm"
                >
                  {city}
                </Link>
              ))}
            </div>
            <div className="mt-8 overflow-hidden rounded-[1.25rem]">
              <PhotoFrame
                src={PHOTOS.hvac}
                alt="Plant equipment"
                className="aspect-[16/10] rounded-[1.25rem]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="glass flex items-end justify-between gap-4 rounded-[1.5rem] px-6 py-5">
          <div>
            <p className="text-sm font-medium text-mark">Marketplace</p>
            <h2 className="mt-1 text-3xl font-semibold">A sample from the floor</h2>
          </div>
          <Link href="/marketplace" className="text-sm font-medium text-mark">
            Open Marketplace →
          </Link>
        </div>
        {samples.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {samples.map((s) => (
              <div key={s.href} className="glass rounded-[1.5rem] p-3">
                <ListingCard {...s} />
              </div>
            ))}
          </div>
        ) : (
          <p className="glass mt-6 rounded-[1.5rem] px-6 py-4 text-ink-soft">
            The catalogue is being filled.{" "}
            <Link href="/rfq/new" className="font-medium text-mark">
              Post an RFQ
            </Link>
            .
          </p>
        )}
      </section>

      <section className="px-4 md:px-6">
        <div className="glass mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] px-8 py-12 md:flex-row md:items-center md:px-12">
          <div>
            <p className="text-2xl font-semibold text-ink md:text-3xl">Cannot find the exact spec?</p>
            <p className="mt-2 text-ink-soft">
              Post once. Receive quotations from verified suppliers. No cart.
            </p>
          </div>
          <MarkButton href="/rfq/new">Post RFQ</MarkButton>
        </div>
      </section>
    </div>
  );
}
