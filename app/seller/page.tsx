import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction, submitQuoteAction } from "@/app/actions";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { SellerHeader, SellerNav, PublicProfileLink } from "@/components/seller-nav";
import { sellerCompleteness } from "@/lib/seller";
import Link from "next/link";

export const metadata = { title: "Seller workspace" };

export default async function SellerHome() {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }
  const org = await prisma.supplierOrganisation.findUnique({
    where: { id: session.supplierOrgId },
    include: {
      categories: true,
      _count: { select: { products: true } },
    },
  });
  if (!org) redirect("/login");
  const matches = await prisma.rfqMatch.findMany({
    where: { supplierId: session.supplierOrgId, rfq: { status: "open" } },
    include: { rfq: true },
    orderBy: { notifiedAt: "desc" },
  });
  const quotes = await prisma.quotation.count({
    where: { supplierId: session.supplierOrgId },
  });
  const complete = sellerCompleteness(org, org._count.products);
  const docsMissing = !org.address || !org.ntn || !org.cnic || !org.businessProofUrl;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <SellerHeader name={org.displayName}>
        <form action={logoutAction}>
          <button className="text-sm text-ink-soft underline" type="submit">
            Log out
          </button>
        </form>
      </SellerHeader>
      <p className="mt-2 text-sm text-ink-soft">
        Status: {org.publicStatus.replaceAll("_", " ")} · Completeness {complete.pct}%
      </p>
      <SellerNav current="desk" />

      <div className="mt-8 grid grid-cols-3 gap-4 border border-rule bg-sheet p-4">
        <div>
          <p className="font-display text-3xl">{org.profileViews}</p>
          <p className="font-mono text-[11px] text-mill">PROFILE VIEWS</p>
        </div>
        <div>
          <p className="font-display text-3xl">{matches.length}</p>
          <p className="font-mono text-[11px] text-mill">OPEN RFQS</p>
        </div>
        <div>
          <p className="font-display text-3xl">{quotes}</p>
          <p className="font-mono text-[11px] text-mill">QUOTES SUBMITTED</p>
        </div>
      </div>

      {org.publicStatus === "rejected" ? (
        <div className="mt-4 border border-stop bg-stop/10 px-4 py-3 text-sm text-stop">
          <p className="font-semibold">Profile verification rejected</p>
          <p className="mt-1">{org.rejectionReason}</p>
          <Link href="/seller/profile" className="mt-2 inline-block underline">
            Update profile and resubmit
          </Link>
        </div>
      ) : org.publicStatus !== "approved" ? (
        <p className="mt-4 border border-hold px-3 py-2 text-sm text-hold">
          Profile is under review. You can still build your profile and add products.
          RFQs arrive after approval.
        </p>
      ) : null}

      {docsMissing ? (
        <p className="mt-4 border border-hold px-3 py-2 text-sm text-hold">
          Add address, NTN, CNIC, and business proof on{" "}
          <Link href="/seller/profile" className="underline">
            Profile
          </Link>{" "}
          so ops can verify you.
        </p>
      ) : null}

      <div className="mt-8 border border-rule bg-sheet p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl">Build your mini-website</h2>
          <MarkButton href="/seller/profile">Edit profile</MarkButton>
          <MarkButton href="/seller/products/new">Add product</MarkButton>
        </div>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {complete.items.map((item) => (
            <li key={item.label} className={item.ok ? "text-live" : "text-ink-soft"}>
              {item.ok ? "✓" : "○"} {item.label}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mt-10 font-display text-2xl">New RFQs</h2>
      <div className="mt-4 space-y-6">
        {matches.map((m) => (
          <div key={m.id} className="border border-rule bg-sheet p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{m.rfq.title}</h3>
              <Stamp>OPEN</Stamp>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {m.rfq.city} · {m.rfq.quantity} · {m.rfq.neededBy}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{m.rfq.description}</p>
            {org.publicStatus === "approved" ? (
              <form action={submitQuoteAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="rfqId" value={m.rfq.id} />
                <label className="text-sm">
                  Price (PKR)
                  <input name="pricePkr" type="number" required className="mt-1 w-full border border-rule bg-paper px-3 py-2" />
                </label>
                <label className="text-sm">
                  Delivery (days)
                  <input name="deliveryDays" type="number" required className="mt-1 w-full border border-rule bg-paper px-3 py-2" />
                </label>
                <label className="text-sm sm:col-span-2">
                  Warranty
                  <input name="warranty" required placeholder="1 year" className="mt-1 w-full border border-rule bg-paper px-3 py-2" />
                </label>
                <label className="text-sm sm:col-span-2">
                  Notes
                  <textarea name="notes" rows={2} className="mt-1 w-full border border-rule bg-paper px-3 py-2" />
                </label>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" name="installation" /> Includes installation
                </label>
                <MarkButton type="submit">Submit quotation</MarkButton>
              </form>
            ) : (
              <p className="mt-3 text-sm text-hold">Quoting opens after your profile is approved.</p>
            )}
          </div>
        ))}
        {!matches.length ? (
          <p className="text-ink-soft">No open RFQs matched to you yet.</p>
        ) : null}
      </div>
      <PublicProfileLink slug={org.slug} />
    </div>
  );
}
