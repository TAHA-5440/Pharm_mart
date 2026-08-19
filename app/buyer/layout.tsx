import type { ReactNode } from "react";
import { prisma } from "@/lib/db";
import { BuyerNav } from "@/components/buyer-nav";
import { LogoutButton } from "@/components/logout-button";
import { Stamp } from "@/components/stamp";
import { MarkButton } from "@/components/mark-button";
import { WAITING_RFQ, requireBuyer } from "@/lib/buyer";
import { INDUSTRY_LABEL } from "@/lib/utils";

export const metadata = {
  title: { default: "Buyer desk", template: "%s · Buyer" },
  robots: { index: false, follow: false },
};

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  const { session, org, user } = await requireBuyer();

  const [waiting, openRfqs, unread, savedSuppliers, savedMachines] = await Promise.all([
    prisma.rfq.count({ where: { buyerOrgId: org.id, status: { in: WAITING_RFQ } } }),
    prisma.rfq.count({ where: { buyerOrgId: org.id, status: "open" } }),
    prisma.notification.count({ where: { userId: session.id, read: false } }),
    prisma.savedSupplier.count({ where: { userId: session.id } }),
    prisma.favouriteListing.count({ where: { userId: session.id } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-360 px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-mark uppercase">Buyer desk</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {org.displayName || org.legalName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Stamp>Buyer</Stamp>
            <span className="text-sm text-ink-soft">
              {user.name}
              {user.jobTitle ? ` · ${user.jobTitle}` : ""} · {org.city} ·{" "}
              {INDUSTRY_LABEL[org.industry] ?? org.industry}
            </span>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <MarkButton href="/rfq/new">Post RFQ</MarkButton>
          <LogoutButton />
        </div>
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <BuyerNav
          waiting={waiting}
          openRfqs={openRfqs}
          unread={unread}
          saved={savedSuppliers + savedMachines}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
