import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Stamp } from "@/components/stamp";
import { AdminTabNav } from "@/components/admin-tab-nav";
import { ListingCard } from "@/components/listing-card";
import { SpecList } from "@/components/spec-list";
import {
  formatPkr,
  formatWhen,
  INDUSTRY_LABEL,
  VERIFICATION_LABEL,
} from "@/lib/utils";
import { resolvePhoto } from "@/lib/media";

const TABS = ["history", "documentation", "activity", "products"] as const;
type Tab = (typeof TABS)[number];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await prisma.supplierOrganisation.findUnique({
    where: { id },
    select: { displayName: true },
  });
  return { title: supplier ? `${supplier.displayName} · Admin` : "Supplier · Admin" };
}

export default async function AdminSupplierPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const { id } = await params;
  const { tab: tabRaw } = await searchParams;
  const tab: Tab = TABS.includes(tabRaw as Tab) ? (tabRaw as Tab) : "history";

  const supplier = await prisma.supplierOrganisation.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "asc" } },
      products: { orderBy: { createdAt: "desc" } },
      machines: { orderBy: { createdAt: "desc" } },
      quotes: {
        include: { rfq: true },
        orderBy: { createdAt: "desc" },
      },
      matches: {
        include: { rfq: { include: { buyerOrg: true } } },
        orderBy: { notifiedAt: "desc" },
      },
      categories: { include: { category: true } },
    },
  });
  if (!supplier) notFound();

  const events = [
    {
      at: supplier.createdAt,
      title: "Profile created",
      detail: supplier.createdByAdmin ? "Created by ops" : "Self-serve registration",
    },
    ...supplier.users.map((u) => ({
      at: u.createdAt,
      title: `User ${u.name}`,
      detail: `${u.email}${u.lastLoginAt ? ` · last login ${formatWhen(u.lastLoginAt)}` : " · never logged in"}`,
    })),
    ...supplier.products.map((p) => ({
      at: p.createdAt,
      title: `Product listed: ${p.name}`,
      detail: p.status.replaceAll("_", " "),
    })),
    ...supplier.machines.map((m) => ({
      at: m.createdAt,
      title: `Used machine listed: ${m.title}`,
      detail: m.status.replaceAll("_", " "),
    })),
    ...supplier.matches.map((m) => ({
      at: m.notifiedAt,
      title: `Matched to RFQ: ${m.rfq.title}`,
      detail: `${m.rfq.buyerOrg.legalName} · ${m.rfq.status.replaceAll("_", " ")}`,
    })),
    ...supplier.quotes.map((q) => ({
      at: q.createdAt,
      title: `Quote submitted: ${q.rfq.title}`,
      detail: `${formatPkr(q.pricePkr)} · ${q.status}`,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  const industries = supplier.industries
    .split(",")
    .map((s) => INDUSTRY_LABEL[s.trim()] ?? s.trim())
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <Link href="/admin?desk=profiles" className="text-sm text-steel">
        ← Approved profiles
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl">{supplier.displayName}</h1>
        <Stamp>{VERIFICATION_LABEL[supplier.verification]}</Stamp>
        <Stamp>{supplier.publicStatus.replaceAll("_", " ")}</Stamp>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {supplier.city} · {industries || "No industry"} · file opened {formatWhen(supplier.createdAt)}
      </p>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <Link href={`/suppliers/${supplier.slug}`} className="text-steel underline">
          Public preview
        </Link>
        {supplier.phone ? (
          <a href={`tel:${supplier.phone}`} className="text-steel underline">
            Call
          </a>
        ) : null}
      </div>

      <AdminTabNav
        items={TABS.map((t) => ({
          href: `/admin/suppliers/${supplier.id}?tab=${t}`,
          label: t,
          active: tab === t,
        }))}
      />

      {tab === "history" ? (
        <section className="mt-6">
          <h2 className="font-display text-2xl">History</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Reconstructed file from registration, listings, matches, and quotes.
          </p>
          <ol className="mt-4 space-y-0 border border-rule bg-sheet">
            {events.map((e, i) => (
              <li key={`${e.title}-${i}`} className="border-b border-rule px-4 py-3 last:border-b-0">
                <p className="font-mono text-[11px] text-mill">{formatWhen(e.at)}</p>
                <p className="font-medium">{e.title}</p>
                <p className="text-sm text-ink-soft">{e.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {tab === "documentation" ? (
        <section className="mt-6 space-y-6">
          <h2 className="font-display text-2xl">Documentation</h2>
          <SpecList
            rows={[
              ["Legal name", supplier.legalName],
              ["Display name", supplier.displayName],
              ["Address", supplier.address || "Not provided"],
              ["City", supplier.city],
              ["Cities served", supplier.citiesServed || "Not provided"],
              ["NTN", supplier.ntn || "Not provided"],
              ["CNIC", supplier.cnic || "Not provided"],
              ["Email", supplier.email],
              ["Phone", supplier.phone],
              ["WhatsApp", supplier.whatsapp || "Not provided"],
              ["Website", supplier.website || "Not provided"],
              ["Year established", supplier.yearEstablished ? String(supplier.yearEstablished) : "—"],
              ["Verification", VERIFICATION_LABEL[supplier.verification]],
              ["Public status", supplier.publicStatus.replaceAll("_", " ")],
            ]}
          />
          {supplier.rejectionReason ? (
            <p className="border border-stop bg-stop/10 px-4 py-3 text-sm text-stop">
              {supplier.rejectionReason}
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <DocCard
              label="Business proof"
              href={supplier.businessProofUrl}
              empty="No business proof uploaded."
            />
            <DocCard
              label="Catalogue"
              href={supplier.catalogueUrl}
              empty="No catalogue uploaded."
            />
          </div>
          <div>
            <h3 className="font-medium">Account users</h3>
            <ul className="mt-2 space-y-2">
              {supplier.users.map((u) => (
                <li key={u.id} className="border border-rule bg-sheet px-4 py-3 text-sm">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-ink-soft">
                    {u.email} · {u.phone || "no phone"} · last login {formatWhen(u.lastLoginAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {tab === "activity" ? (
        <section className="mt-6 space-y-6">
          <h2 className="font-display text-2xl">Activity</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat n={supplier.profileViews} l="Profile views" />
            <Stat n={supplier.matches.length} l="RFQs received" />
            <Stat n={supplier.quotes.length} l="Quotes submitted" />
            <Stat n={supplier.users.filter((u) => u.lastLoginAt).length} l="Users logged in" />
          </div>
          <div>
            <h3 className="font-medium">RFQs matched</h3>
            <div className="mt-2 overflow-hidden border border-rule bg-sheet">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-rule font-mono text-[11px] tracking-widest text-mill uppercase">
                  <tr>
                    <th className="px-3 py-2">RFQ</th>
                    <th className="px-3 py-2">Buyer</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Notified</th>
                  </tr>
                </thead>
                <tbody>
                  {supplier.matches.map((m) => (
                    <tr key={m.id} className="border-b border-rule">
                      <td className="px-3 py-3">
                        <Link href={`/admin/rfqs/${m.rfq.id}`} className="hover:text-steel">
                          {m.rfq.title}
                        </Link>
                      </td>
                      <td className="px-3 py-3">{m.rfq.buyerOrg.legalName}</td>
                      <td className="px-3 py-3">
                        <Stamp>{m.rfq.status.replaceAll("_", " ")}</Stamp>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{formatWhen(m.notifiedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!supplier.matches.length ? (
                <p className="p-4 text-ink-soft">No RFQs matched to this supplier yet.</p>
              ) : null}
            </div>
          </div>
          <div>
            <h3 className="font-medium">Quotations</h3>
            <div className="mt-2 overflow-hidden border border-rule bg-sheet">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-rule font-mono text-[11px] tracking-widest text-mill uppercase">
                  <tr>
                    <th className="px-3 py-2">RFQ</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2">Delivery</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {supplier.quotes.map((q) => (
                    <tr key={q.id} className="border-b border-rule">
                      <td className="px-3 py-3">
                        <Link href={`/admin/rfqs/${q.rfqId}`} className="hover:text-steel">
                          {q.rfq.title}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right">{formatPkr(q.pricePkr)}</td>
                      <td className="px-3 py-3">{q.deliveryDays} days</td>
                      <td className="px-3 py-3">
                        <Stamp>{q.status}</Stamp>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!supplier.quotes.length ? (
                <p className="p-4 text-ink-soft">No quotations submitted.</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "products" ? (
        <section className="mt-6 space-y-8">
          <div>
            <h2 className="font-display text-2xl">Products</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {supplier.products.map((p) => (
                <div key={p.id}>
                  <ListingCard
                    href={`/products/${p.slug}`}
                    photo={resolvePhoto(p.imageUrl)}
                    alt={p.name}
                    stamps={[p.status.replaceAll("_", " ")]}
                    title={p.name}
                    meta={p.shortDesc}
                    price={formatPkr(p.pricePkr, p.priceOnRequest)}
                  />
                </div>
              ))}
            </div>
            {!supplier.products.length ? (
              <p className="mt-4 text-ink-soft">No products listed.</p>
            ) : null}
          </div>
          <div>
            <h2 className="font-display text-2xl">Used machinery</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {supplier.machines.map((m) => (
                <ListingCard
                  key={m.id}
                  href={`/machines/${m.slug}`}
                  photo={resolvePhoto(m.photoUrls)}
                  alt={m.title}
                  stamps={[m.status.replaceAll("_", " ")]}
                  title={m.title}
                  meta={`${m.manufacturer} ${m.model} · ${m.city}`}
                  price={formatPkr(m.pricePkr, m.requestPrice)}
                />
              ))}
            </div>
            {!supplier.machines.length ? (
              <p className="mt-4 text-ink-soft">No used machines listed.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ n, l }: { n: number | string; l: string }) {
  return (
    <div className="border border-rule bg-sheet p-3">
      <p className="font-display text-3xl">{n}</p>
      <p className="font-mono text-[11px] text-mill">{l}</p>
    </div>
  );
}

function DocCard({
  label,
  href,
  empty,
}: {
  label: string;
  href: string | null | undefined;
  empty: string;
}) {
  if (!href) {
    return (
      <div className="border border-rule bg-sheet p-4">
        <p className="font-mono text-[11px] text-mill">{label}</p>
        <p className="mt-2 text-sm text-hold">{empty}</p>
      </div>
    );
  }
  const image = /\.(png|jpe?g|gif|webp)$/i.test(href);
  return (
    <div className="border border-rule bg-sheet p-4">
      <p className="font-mono text-[11px] text-mill">{label}</p>
      {image ? (
        <div className="relative mt-3 h-64 w-full bg-paper">
          <Image src={href} alt={label} fill className="object-contain" sizes="400px" />
        </div>
      ) : null}
      <a href={href} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-steel underline">
        Open file
      </a>
    </div>
  );
}
