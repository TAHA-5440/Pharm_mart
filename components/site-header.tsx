"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Store, Info } from "lucide-react";
import { MarkButton } from "./mark-button";
import { BrandMark } from "./brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type HeaderSession = {
  name: string;
  role: "admin" | "buyer" | "supplier" | string;
} | null;

export function SiteHeader({
  session,
  apexOrigin,
}: {
  session: HeaderSession;
  apexOrigin?: string;
}) {
  const pathname = usePathname();
  const glass = !apexOrigin && (pathname === "/" || pathname === "/login" || pathname === "/register");
  const go = (path: string) => (apexOrigin ? `${apexOrigin}${path}` : path);
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
    <header className="relative z-50 px-3 pt-3 md:px-6">
      <div
        className={cn(
          "mx-auto max-w-7xl",
          glass
            ? "glass rounded-[1.5rem] md:rounded-full"
            : "rounded-[1.5rem] border border-rule bg-sheet/90 shadow-[0_8px_28px_rgba(16,20,16,0.08)] md:rounded-full",
        )}
      >
        <div className="flex items-center gap-3 px-3 py-2 md:gap-4 md:px-4">
          {/* 1. Logo (Left) */}
          <Link href={go("/")} className="shrink-0" aria-label="ProcureX home">
            <BrandMark height={40} priority />
          </Link>

          {/* 2. Search Bar (Center) */}
          <form action={go("/marketplace")} className="hidden min-w-0 flex-1 md:block">
            <Input
              name="q"
              placeholder="Search products, machines, suppliers…"
              className={cn("h-10 w-full max-w-lg transition-all focus:max-w-xl", searchClass)}
            />
          </form>

          {/* 3. Actions & Icons (Right) */}
          <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href={go("/marketplace")}
                title="Marketplace"
                className="flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-mark"
              >
                <Store className="size-5" />
                <span className="sr-only">Marketplace</span>
              </Link>
              <Link
                href={go("/how-it-works")}
                title="How it works"
                className="flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-mark"
              >
                <Info className="size-5" />
                <span className="sr-only">How it works</span>
              </Link>
            </nav>

            <div className="mx-1 hidden h-6 w-px bg-rule md:block" />

            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn("hidden md:inline-flex", glass && "border-ink/20 bg-white text-ink")}
            >
              <Link href={go(accountHref)}>
                {session ? session.name.split(" ")[0] : "Log in"}
              </Link>
            </Button>
            {session?.role === "supplier" || session?.role === "admin" ? null : (
              <MarkButton href={go("/rfq/new")} className="min-h-9 px-3 text-xs md:min-h-10 md:px-4 md:text-sm">
                Post RFQ
              </MarkButton>
            )}
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
          <form action={go("/marketplace")}>
            <Input
              name="q"
              placeholder="Search products, machines, suppliers…"
              className={cn("h-11", searchClass)}
            />
          </form>
          <nav className="grid gap-1 text-sm font-medium text-ink">
            <Link href={go("/marketplace")} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 hover:bg-white/70">
              <Store className="size-4 text-ink-soft" />
              Marketplace
            </Link>
            <Link href={go("/how-it-works")} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 hover:bg-white/70">
              <Info className="size-4 text-ink-soft" />
              How it works
            </Link>
            <Link href={go(accountHref)} className="rounded-2xl px-3 py-2.5 hover:bg-white/70">
              {session ? session.name.split(" ")[0] : "Log in"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
