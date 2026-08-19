import Link from "next/link";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { ListingCard } from "@/components/listing-card";
import { requireBuyer } from "@/lib/buyer";
import { VERIFICATION_LABEL, formatPkr } from "@/lib/utils";
import { resolvePhoto } from "@/lib/media";

export const metadata = { title: "Saved" };

export default async function BuyerSavedPage() {
  const { session } = await requireBuyer();
  const [suppliers, machines] = await Promise.all([
    prisma.savedSupplier.findMany({
      where: { userId: session.id, supplier: { publicStatus: "approved" } },
      include: { supplier: true },
      orderBy: { supplierId: "asc" },
    }),
    prisma.favouriteListing.findMany({
      where: { userId: session.id, listing: { status: "live" } },
      include: { listing: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Saved</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Suppliers and used machines you kept. Saving does not notify them — post an RFQ when you are ready.
        </p>
      </div>

      <section>
        <h3 className="text-lg font-semibold">Suppliers</h3>
        <div className="mt-4 space-y-3">
          {suppliers.map(({ supplier: s }) => (
            <div key={s.id} className="flex flex-col gap-3 rounded-3xl bg-sheet p-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Link href={`/suppliers/${s.slug}`} className="font-semibold hover:text-steel">
                  {s.displayName}
                </Link>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Stamp>{VERIFICATION_LABEL[s.verification]}</Stamp>
                  <span className="text-sm text-ink-soft">{s.city}</span>
                </div>
              </div>
              <MarkButton href={`/rfq/new?supplier=${encodeURIComponent(s.slug)}`}>Request quotation</MarkButton>
            </div>
          ))}
          {!suppliers.length ? (
            <p className="rounded-3xl bg-sheet px-4 py-8 text-center text-sm text-ink-soft">
              Save a verified supplier from their profile.{" "}
              <Link href="/marketplace?type=suppliers" className="text-steel">
                Browse suppliers
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold">Used machinery</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {machines.map(({ listing: m }) => (
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
        {!machines.length ? (
          <p className="mt-4 rounded-3xl bg-sheet px-4 py-8 text-center text-sm text-ink-soft">
            Save a live used-machine listing from its page.{" "}
            <Link href="/marketplace?type=machines" className="text-steel">
              Browse machinery
            </Link>
          </p>
        ) : null}
      </section>
    </div>
  );
}
