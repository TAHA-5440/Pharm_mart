"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FileText,
  Inbox,
  LayoutGrid,
  Package,
  UserRound,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  hint: string;
  icon: typeof LayoutGrid;
  exact?: boolean;
};

function navGroups({ approved, docsNeeded }: { approved: boolean; docsNeeded: boolean }) {
  const documents: NavItem = {
    href: "/seller/documents",
    label: "Documents",
    hint: approved ? "Verification files" : "Get approved",
    icon: FileText,
  };
  const work: NavItem[] = [
    { href: "/seller", label: "Desk", hint: "Status and counts", icon: LayoutGrid, exact: true },
  ];
  if (!approved || docsNeeded) work.push(documents);
  work.push(
    { href: "/seller/rfqs", label: "RFQs", hint: approved ? "Quote on demand" : "After approval", icon: Inbox },
    { href: "/seller/quotes", label: "Quotes", hint: "Sent and deals", icon: ClipboardList },
  );
  const company: NavItem[] = [
    { href: "/seller/profile", label: "Profile", hint: "Public mini-site", icon: UserRound },
  ];
  if (approved && !docsNeeded) company.push(documents);
  return [
    { label: "Work", items: work },
    {
      label: "Catalogue",
      items: [
        { href: "/seller/products", label: "Products", hint: "Add and edit", icon: Package },
        { href: "/seller/machines", label: "Machines", hint: "Used equipment", icon: Wrench },
      ],
    },
    { label: "Company", items: company },
  ];
}

export function SellerNav({
  openRfqs,
  docsNeeded,
  approved,
}: {
  openRfqs: number;
  docsNeeded: boolean;
  approved: boolean;
}) {
  const pathname = usePathname();
  const groups = navGroups({ approved, docsNeeded });

  return (
    <nav aria-label="Seller sections" className="md:w-55 md:shrink-0">
      <div className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0 md:gap-4">
        {groups.map((group) => (
          <div key={group.label} className="flex gap-2 md:flex-col md:gap-1">
            <p className="hidden px-1 text-[11px] font-medium tracking-[0.14em] text-mill uppercase md:block">
              {group.label}
            </p>
            {group.items.map((item) => {
              const on = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const badge = item.href === "/seller/rfqs" && openRfqs > 0 ? openRfqs : null;
              const alert = item.href === "/seller/documents" && docsNeeded;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-38 items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition md:min-w-0",
                    on ? "bg-mark text-white" : "bg-sheet text-ink hover:bg-sage",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      {badge ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 text-[11px] tabular-nums",
                            on ? "bg-white/20" : "bg-mark text-white",
                          )}
                        >
                          {badge}
                        </span>
                      ) : null}
                      {alert ? (
                        <span className={cn("size-2 rounded-full", on ? "bg-white" : "bg-hold")} />
                      ) : null}
                    </span>
                    <span className={cn("mt-0.5 block text-xs", on ? "text-white/75" : "text-ink-soft")}>
                      {item.hint}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
