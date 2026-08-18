import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MarkButton } from "@/components/mark-button";
import { logoutAction } from "@/app/actions";
import { Stamp } from "@/components/stamp";

export const metadata = { title: "Buyer workspace" };

export default async function BuyerHome() {
  const session = await getSession();
  if (!session || session.role !== "buyer") redirect("/login");
  const rfqs = await prisma.rfq.findMany({
    where: { buyerUserId: session.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { quotes: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold">Buyer · {session.name}</h1>
        <form action={logoutAction} className="ml-auto">
          <button className="text-sm text-ink-soft underline" type="submit">
            Log out
          </button>
        </form>
      </div>
      <div className="mt-6">
        <MarkButton href="/rfq/new">Post RFQ</MarkButton>
      </div>
      <h2 className="mt-10 text-2xl font-semibold">Open RFQs</h2>
      <div className="mt-4 overflow-hidden rounded-3xl bg-sheet">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-rule font-mono text-[11px] tracking-widest text-mill uppercase">
            <tr>
              <th className="px-3 py-2">Requirement</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Quotes</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.map((r) => (
              <tr key={r.id} className="border-b border-rule">
                <td className="px-3 py-3">
                  <Link href={`/buyer/rfqs/${r.id}`} className="hover:text-steel">
                    {r.title}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <Stamp>{r.status.replaceAll("_", " ")}</Stamp>
                </td>
                <td className="px-3 py-3">{r._count.quotes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rfqs.length ? (
          <p className="p-6 text-ink-soft">No RFQs yet. Post your first requirement.</p>
        ) : null}
      </div>
    </div>
  );
}
