import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction, submitQuoteAction, updateBusinessDetailsAction } from "@/app/actions";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import Link from "next/link";

export const metadata = { title: "Seller workspace" };

export default async function SellerHome() {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }
  const org = await prisma.supplierOrganisation.findUnique({
    where: { id: session.supplierOrgId },
  });
  const matches = await prisma.rfqMatch.findMany({
    where: { supplierId: session.supplierOrgId, rfq: { status: "open" } },
    include: { rfq: true },
    orderBy: { notifiedAt: "desc" },
  });
  const quotes = await prisma.quotation.count({
    where: { supplierId: session.supplierOrgId },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl">Seller · {org?.displayName}</h1>
        <form action={logoutAction} className="ml-auto">
          <button className="text-sm text-ink-soft underline" type="submit">
            Log out
          </button>
        </form>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        Status: {org?.publicStatus.replaceAll("_", " ")} · Work queue, not a chart zoo
      </p>
      <div className="mt-8 grid grid-cols-3 gap-4 border border-rule bg-sheet p-4">
        <div>
          <p className="font-display text-3xl">{org?.profileViews ?? 0}</p>
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
      {org?.publicStatus === "rejected" ? (
        <div className="mt-4 border border-stop bg-stop/10 px-4 py-3 text-sm text-stop">
          <p className="font-semibold">Profile verification rejected</p>
          <p className="mt-1">{org.rejectionReason}</p>
        </div>
      ) : org?.publicStatus !== "approved" ? (
        <p className="mt-4 border border-hold px-3 py-2 text-sm text-hold">
          Profile is under review. You will receive RFQs after approval.
        </p>
      ) : null}

      {org && (!org.address || !org.ntn || !org.cnic || !org.businessProofUrl || org.publicStatus === "rejected") ? (
        <div className="mt-10 border border-stop bg-sheet p-6">
          <h2 className="font-display text-2xl text-stop">Update Your Business Details</h2>
          <p className="mt-2 text-sm text-ink-soft">
            You must provide your business details before you can receive or quote on RFQs.
          </p>
          <form action={updateBusinessDetailsAction} className="mt-6 grid gap-4 max-w-lg">
            <label className="text-sm">
              Business Address
              <input name="address" required defaultValue={org.address || ""} className="mt-1 w-full border border-rule bg-paper px-3 py-2" />
            </label>
            <label className="text-sm">
              NTN (National Tax Number)
              <input name="ntn" required defaultValue={org.ntn || ""} className="mt-1 w-full border border-rule bg-paper px-3 py-2" />
            </label>
            <label className="text-sm">
              CNIC
              <input name="cnic" required defaultValue={org.cnic || ""} className="mt-1 w-full border border-rule bg-paper px-3 py-2" />
            </label>
            <label className="text-sm">
              Business Proof (Letterhead, Business Card, or Utility Bill)
              <input name="businessProof" type="file" accept="image/*,.pdf" required className="mt-1 w-full border border-rule bg-paper px-3 py-2" />
            </label>
            <MarkButton type="submit">Save Business Details</MarkButton>
          </form>
        </div>
      ) : (
        <>
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
          </div>
        ))}
        {!matches.length ? (
          <p className="text-ink-soft">No open RFQs matched to you yet.</p>
        ) : null}
      </div>
      </>
      )}
      {org ? (
        <p className="mt-8 text-sm">
          Public profile:{" "}
          <Link href={`/suppliers/${org.slug}`} className="text-steel underline">
            /suppliers/{org.slug}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
