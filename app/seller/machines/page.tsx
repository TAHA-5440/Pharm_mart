import Link from "next/link";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { archiveSellerMachineAction, markMachineSoldAction } from "@/app/seller/listing-actions";
import { requireSeller, SELLER_ERRORS } from "@/lib/seller";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Machines · Seller" };

export default async function SellerMachinesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { org } = await requireSeller();
  const params = await searchParams;
  const error = params.error ? SELLER_ERRORS[params.error] : null;
  const machines = await prisma.usedMachineListing.findMany({
    where: { sellerId: org.id, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Used machines</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Manufacturer, model, condition, and city are required. They go live when this company is approved. Mark sold when it leaves the floor.
          </p>
        </div>
        <MarkButton href="/seller/machines/new">Add machine</MarkButton>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}
      {machines.length ? (
        <ul className="mt-5 divide-y divide-rule">
          {machines.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <Link href={`/seller/machines/${m.id}`} className="font-medium hover:text-steel">
                  {m.title}
                </Link>
                <p className="text-sm text-ink-soft">
                  {m.manufacturer} {m.model} · {m.city}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Stamp>{m.status.replaceAll("_", " ")}</Stamp>
                <span className="text-sm tabular-nums text-ink-soft">{formatPkr(m.pricePkr, m.requestPrice)}</span>
                {m.status === "live" ? (
                  <form action={markMachineSoldAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="text-sm text-steel underline" type="submit">
                      Mark sold
                    </button>
                  </form>
                ) : null}
                <form action={archiveSellerMachineAction}>
                  <input type="hidden" name="id" value={m.id} />
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
          No used machines yet.
        </p>
      )}
    </section>
  );
}
