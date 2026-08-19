import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

export function AdminNav({ current }: { current: "queues" | "liquidity" }) {
  const tab =
    "rounded-full px-4 py-2 text-sm font-medium";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-mark">Ops</p>
      <nav className="flex flex-wrap gap-2">
        <Link
          href="/admin"
          className={cn(tab, current === "queues" ? "bg-ink text-paper" : "bg-sheet text-ink-soft")}
        >
          Queues
        </Link>
        <Link
          href="/admin/analytics"
          className={cn(tab, current === "liquidity" ? "bg-ink text-paper" : "bg-sheet text-ink-soft")}
        >
          Liquidity
        </Link>
      </nav>
      <div className="ml-auto">
        <LogoutButton />
      </div>
    </div>
  );
}
