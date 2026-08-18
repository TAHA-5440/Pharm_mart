"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
  const glass = pathname === "/" || pathname === "/login" || pathname === "/register";
  const [open, setOpen] = useState(false);
  const accountHref =
    session?.role === "admin"
      ? "/admin"
      : session?.role === "supplier"
        ? "/seller"
        : session?.role === "buyer"
          ? "/buyer"
          : "/login";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const searchClass = glass
    ? "border-ink/15 bg-white text-ink placeholder:text-ink/55"
    : "bg-paper";

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
      <div
        className={cn(
          "mx-auto max-w-7xl",
          glass
            ? "glass rounded-[1.5rem] md:rounded-full"
            : "rounded-[1.5rem] border border-rule bg-sheet/90 shadow-[0_8px_28px_rgba(16,20,16,0.08)] md:rounded-full",
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2 md:px-4">
          <Link
            href="/"
            className="shrink-0 text-base font-semibold tracking-tight text-ink md:text-lg"
          >
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
              className={cn("h-10", searchClass)}
            />
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn("hidden md:inline-flex", glass && "border-ink/20 bg-white text-ink")}
            >
              <Link href={accountHref}>
                {session ? session.name.split(" ")[0] : "Log in"}
              </Link>
            </Button>
            <MarkButton href="/rfq/new" className="min-h-9 px-3 text-xs md:min-h-11 md:px-5 md:text-sm">
              Post RFQ
            </MarkButton>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full border border-ink/15 bg-white text-ink md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        <div
          id="mobile-nav"
          hidden={!open}
          className="space-y-3 border-t border-ink/10 px-3 pb-4 pt-3 md:hidden"
        >
          <form action="/marketplace">
            <Input
              name="q"
              placeholder="Search products, machines, suppliers…"
              className={cn("h-11", searchClass)}
            />
          </form>
          <nav className="grid gap-1 text-sm font-medium text-ink">
            <Link href="/marketplace" className="rounded-2xl px-3 py-2.5 hover:bg-white/70">
              Marketplace
            </Link>
            <Link href="/how-it-works" className="rounded-2xl px-3 py-2.5 hover:bg-white/70">
              How it works
            </Link>
            <Link href={accountHref} className="rounded-2xl px-3 py-2.5 hover:bg-white/70">
              {session ? session.name.split(" ")[0] : "Log in"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
