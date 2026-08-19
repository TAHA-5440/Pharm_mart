"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Building2, ClipboardList, Inbox, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  hint: string;
  icon: typeof LayoutGrid;
  exact?: boolean;
  badge?: number;
};

export function BuyerNav({
  waiting,
  openRfqs,
  unread,
  saved,
}: {
  waiting: number;
  openRfqs: number;
  unread: number;
  saved: number;
}) {
  const pathname = usePathname();
  const groups: Array<{ label: string; items: NavItem[] }> = [
    {
      label: "Work",
      items: [
        {
          href: "/buyer",
          label: "Desk",
          hint: unread ? `${unread} unread notices` : "Queue and counts",
          icon: LayoutGrid,
          exact: true,
          badge: unread || undefined,
        },
        {
          href: "/buyer/rfqs",
          label: "RFQs",
          hint: waiting ? `${waiting} with ops` : "All requirements",
          icon: Inbox,
          badge: waiting || openRfqs || undefined,
        },
        {
          href: "/buyer/quotes",
          label: "Quotes",
          hint: "Across requirements",
          icon: ClipboardList,
        },
        {
          href: "/buyer/saved",
          label: "Saved",
          hint: saved ? `${saved} kept` : "Suppliers and machines",
          icon: Bookmark,
          badge: saved || undefined,
        },
      ],
    },
    {
      label: "Company",
      items: [
        {
          href: "/buyer/company",
          label: "Company",
          hint: "Org and your account",
          icon: Building2,
        },
      ],
    },
  ];

  return (
    <nav aria-label="Buyer sections" className="md:w-55 md:shrink-0">
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
                      {item.badge ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 text-[11px] tabular-nums",
                            on ? "bg-white/20" : "bg-mark text-white",
                          )}
                        >
                          {item.badge}
                        </span>
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
