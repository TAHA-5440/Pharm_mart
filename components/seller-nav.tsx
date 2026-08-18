import type { ReactNode } from "react";
import Link from "next/link";
import { AdminTabNav } from "@/components/admin-tab-nav";

export function SellerNav({
  current,
}: {
  current: "desk" | "profile" | "products";
}) {
  return (
    <AdminTabNav
      items={[
        { href: "/seller", label: "Desk", active: current === "desk" },
        { href: "/seller/profile", label: "Profile", active: current === "profile" },
        { href: "/seller/products", label: "Products", active: current === "products" },
      ]}
    />
  );
}

export function SellerHeader({
  name,
  children,
}: {
  name: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="font-display text-3xl">Seller · {name}</h1>
      <div className="ml-auto flex items-center gap-3">{children}</div>
    </div>
  );
}

export function PublicProfileLink({ slug }: { slug: string }) {
  return (
    <p className="mt-6 text-sm">
      Public profile:{" "}
      <Link href={`/suppliers/${slug}`} className="text-steel underline">
        /suppliers/{slug}
      </Link>
    </p>
  );
}
