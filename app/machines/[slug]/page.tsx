import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Gallery } from "@/components/gallery";
import { SpecList } from "@/components/spec-list";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { formatPkr } from "@/lib/utils";
import { listingGallery } from "@/lib/media";
import { getSession } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const machine = await prisma.usedMachineListing.findUnique({ where: { slug } });
  return { title: machine?.title ?? "Used machine" };
}

export default async function MachinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const machine = await prisma.usedMachineListing.findUnique({
    where: { slug },
    include: { seller: true, category: true },
  });
  if (!machine || machine.status !== "live") notFound();
  const session = await getSession();
  const next = encodeURIComponent(`/rfq/new?machine=${machine.slug}`);
  const rfqHref =
    session?.role === "buyer"
      ? `/rfq/new?machine=${machine.slug}`
      : `/login?next=${next}`;

  const photos = listingGallery(machine.photoUrls.split(",")[0], machine.photoUrls);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <p className="text-sm text-ink-soft">
        <Link href="/marketplace?type=machines" className="hover:text-ink">
          Marketplace
        </Link>
        {" / "}
        {machine.title}
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <Gallery photos={photos} alt={machine.title} />
          <p className="mt-8 text-ink-soft">{machine.description}</p>
          <h2 className="mt-8 text-xl font-semibold">Specifications</h2>
          <div className="mt-4">
            <SpecList
              rows={[
                ["Title", machine.title],
                ["Manufacturer", machine.manufacturer],
                ["Model", machine.model],
                ["Year", machine.year?.toString() ?? "—"],
                ["Condition", machine.condition.replace("_", " ")],
                ["Serial", machine.serialNumber ?? "—"],
                ["Location", machine.city],
                ["Price", formatPkr(machine.pricePkr, machine.requestPrice)],
                ["Warranty", machine.warranty ?? "—"],
                ["Installation", machine.installation ? "Yes" : "No"],
                ["Inspection", machine.inspection ? "Yes" : "No"],
              ]}
            />
          </div>
        </div>

        <aside className="md:col-span-5">
          <div className="rounded-3xl bg-sheet p-6 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:sticky md:top-24">
            <div className="flex flex-wrap gap-2">
              <Stamp>{machine.condition.replace("_", " ")}</Stamp>
              {machine.inspection ? <Stamp>Inspection</Stamp> : null}
              {machine.installation ? <Stamp>Installation</Stamp> : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold">{machine.title}</h1>
            <p className="mt-2 text-sm text-ink-soft">
              <Link href={`/suppliers/${machine.seller.slug}`} className="text-steel">
                {machine.seller.displayName}
              </Link>
              {" · "}
              {machine.city}
            </p>
            <p className="mt-4 text-2xl font-semibold">
              {formatPkr(machine.pricePkr, machine.requestPrice)}
            </p>
            <div className="mt-5">
              <MarkButton href={rfqHref} className="w-full">
                Request quotation
              </MarkButton>
            </div>
            <p className="mt-3 text-xs text-mill">
              Creates an RFQ linked to this listing. No cart, no checkout.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
