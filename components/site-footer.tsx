"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/seller")) return null;

  return (
    <footer className="mt-10 border-t border-rule bg-sheet md:mt-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-ink-soft md:grid-cols-4 md:px-6">
        <div>
          <BrandMark height={32} />
          <p className="mt-3 max-w-xs">
            Where Industry Connects. Verified B2B procurement for Pakistan’s
            manufacturing industry. Quotations are not purchase orders.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-mill">Find</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/marketplace" className="hover:text-ink">
                Marketplace
              </Link>
            </li>
            <li>
              <Link href="/marketplace?type=products" className="hover:text-ink">
                Products
              </Link>
            </li>
            <li>
              <Link href="/marketplace?type=machines" className="hover:text-ink">
                Used machinery
              </Link>
            </li>
            <li>
              <Link href="/marketplace?type=suppliers" className="hover:text-ink">
                Suppliers
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-ink">
                How it works
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-mill">
            Industries
          </p>
          <p className="mt-2">Pharmaceutical · Food & Beverage · Packaging · Laboratory · Machinery</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-mill">Legal</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/legal/terms" className="hover:text-ink">
                Terms of use
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-ink">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
