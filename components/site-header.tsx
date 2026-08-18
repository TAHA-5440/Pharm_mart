"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarkButton } from "./mark-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type HeaderSession = {
  name: string;
  role: "admin" | "buyer" | "supplier" | string;
} | null;

export function SiteHeader({ session }: { session: HeaderSession }) {
  const pathname = usePathname();
  const glass = pathname === "/";
  const accountHref =
    session?.role === "admin"
      ? "/admin"
      : session?.role === "supplier"
        ? "/seller"
        : session?.role === "buyer"
          ? "/buyer"
          : "/login";

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center gap-3 rounded-full px-4 py-2",
          glass
            ? "glass"
            : "border border-rule bg-sheet/90 shadow-[0_8px_28px_rgba(16,20,16,0.08)]",
        )}
      >
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          ProcureX
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-ink md:flex">
          <Link href="/marketplace" className="hover:text-mark">
            Marketplace
          </Link>
          <Link href="/how-it-works" className="hover:text-mark">
            How it works
          </Link>
        </nav>
        <form action="/marketplace" className="ml-2 hidden min-w-0 flex-1 md:block">
          <Input
            name="q"
            placeholder="Search products, machines, suppliers…"
            className={cn(
              "h-10",
              glass
                ? "border-ink/15 bg-white text-ink placeholder:text-ink/55"
                : "bg-paper",
            )}
          />
        </form>
        <div className="ml-auto flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className={glass ? "border-ink/20 bg-white text-ink" : undefined}
          >
            <Link href={accountHref}>
              {session ? session.name.split(" ")[0] : "Log in"}
            </Link>
          </Button>
          <MarkButton href="/rfq/new">Post RFQ</MarkButton>
        </div>
      </div>
    </header>
  );
}
