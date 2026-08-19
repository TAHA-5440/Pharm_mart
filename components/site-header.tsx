"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
        <div className="flex items-center gap-2 px-3 py-2 md:px-4">
          <Link href={go("/")} className="shrink-0" aria-label="ProcureX home">
            <BrandMark height={40} priority />
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-ink md:flex">
            <Link href={go("/marketplace")} className="hover:text-mark">
              Marketplace
            </Link>
            <Link href={go("/how-it-works")} className="hover:text-mark">
              How it works
            </Link>
          </nav>
          <form action={go("/marketplace")} className="ml-2 hidden min-w-0 flex-1 md:block">
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
              <Link href={go(accountHref)}>
                {session ? session.name.split(" ")[0] : "Log in"}
              </Link>
            </Button>
            {session?.role === "supplier" || session?.role === "admin" ? null : (
              <MarkButton href={go("/rfq/new")} className="min-h-9 px-3 text-xs md:min-h-11 md:px-5 md:text-sm">
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
            <Link href={go("/marketplace")} className="rounded-2xl px-3 py-2.5 hover:bg-white/70">
              Marketplace
            </Link>
            <Link href={go("/how-it-works")} className="rounded-2xl px-3 py-2.5 hover:bg-white/70">
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
