import type { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/app/actions";
import { SellerNav } from "@/components/seller-nav";
import { Stamp } from "@/components/stamp";
import { Button } from "@/components/ui/button";
import { needsDocuments, publishPendingListings, requireSeller } from "@/lib/seller";
import { supplierHref } from "@/lib/site";
import { VERIFICATION_LABEL, cn } from "@/lib/utils";

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const { org } = await requireSeller();
  if (org.publicStatus === "approved") {
    await publishPendingListings(org.id);
  }
  const openRfqs = await prisma.rfqMatch.count({
    where: { supplierId: org.id, rfq: { status: "open" } },
  });

  return (
    <div className="mx-auto w-full max-w-360 px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-mark uppercase">Seller desk</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{org.displayName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Stamp>{VERIFICATION_LABEL[org.verification] ?? org.verification}</Stamp>
            <Stamp
              className={cn(
                org.publicStatus === "approved" && "bg-sage text-mark",
                org.publicStatus === "rejected" && "bg-stop/10 text-stop",
                org.publicStatus === "pending_review" && "bg-[#f4e6d8] text-hold",
              )}
            >
              {org.publicStatus.replaceAll("_", " ")}
            </Stamp>
            <span className="text-sm text-ink-soft">
              {org.city} · {org.industries.replaceAll(",", " / ")}
            </span>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href={supplierHref(org.slug)}>View public profile</Link>
          </Button>
          <form action={logoutAction}>
            <button className="text-sm text-ink-soft underline" type="submit">
              Log out
            </button>
          </form>
        </div>
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <SellerNav
          openRfqs={openRfqs}
          docsNeeded={needsDocuments(org)}
          approved={org.publicStatus === "approved"}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
