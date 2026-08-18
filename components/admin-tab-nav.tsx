import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminTabNav({
  items,
}: {
  items: { href: string; label: string; active: boolean }[];
}) {
  return (
    <nav className="mt-6 flex flex-wrap gap-1 border-b border-rule">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 font-mono text-[11px] tracking-widest uppercase",
            item.active
              ? "border-ink text-ink"
              : "border-transparent text-mill hover:text-ink",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
