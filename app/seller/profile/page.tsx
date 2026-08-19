import { updateSellerProfileAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";
import { SellerFileInput } from "@/components/seller-file-input";
import { prisma } from "@/lib/db";
import { requireSeller, sellerField, SELLER_ERRORS } from "@/lib/seller";
import { supplierCanonicalUrl, supplierVanityOrigin } from "@/lib/site";

export const metadata = { title: "Profile · Seller" };

export default async function SellerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { org } = await requireSeller();
  const params = await searchParams;
  const error = params.error ? SELLER_ERRORS[params.error] : null;
  const [types, linked] = await Promise.all([
    prisma.category.findMany({
      where: { kind: "type", active: true },
      orderBy: { name: "asc" },
    }),
    prisma.supplierCategory.findMany({
      where: { supplierId: org.id },
      select: { categoryId: true },
    }),
  ]);
  const vanity = supplierVanityOrigin(org.slug);
  const selected = new Set(linked.map((row) => row.categoryId));

  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <h2 className="text-xl font-semibold">Company profile</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Supply types decide which RFQs reach this desk after ops classify a requirement.
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        Public page: {supplierCanonicalUrl(org.slug)}
        {vanity ? ` · Mini-site: ${vanity}` : ""}
      </p>
      {error ? <p className="mt-4 rounded-2xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}
      <form action={updateSellerProfileAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          About
          <textarea name="about" rows={5} defaultValue={org.about} className={`${sellerField} h-auto py-2`} />
        </label>
        <label className="block text-sm">
          Phone
          <input name="phone" defaultValue={org.phone} className={sellerField} />
        </label>
        <label className="block text-sm">
          WhatsApp
          <input name="whatsapp" defaultValue={org.whatsapp ?? ""} placeholder="03XXXXXXXXX" className={sellerField} />
        </label>
        <label className="block text-sm sm:col-span-2">
          Website
          <input name="website" defaultValue={org.website ?? ""} placeholder="https://" className={sellerField} />
        </label>
        <label className="block text-sm sm:col-span-2">
          Catalogue URL
          <input
            name="catalogueUrl"
            defaultValue={org.catalogueUrl ?? ""}
            placeholder="/demo/abc-engineering-catalogue.txt or https://"
            className={sellerField}
          />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">Supply types</legend>
          <p className="mt-1 text-xs text-ink-soft">
            Tick what you actually supply. A tablet-machine RFQ will not reach a packaging-only supplier.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {types.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded-xl border border-rule bg-paper px-3 py-2 text-sm">
                <input type="checkbox" name="categoryIds" value={c.id} defaultChecked={selected.has(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="text-sm sm:col-span-2">
          Plant photo
          <SellerFileInput name="plantPhoto" accept="image/jpeg,image/png,image/webp" hint="Upload a floor photo" />
        </div>
        <div className="sm:col-span-2">
          <MarkButton type="submit">Save profile</MarkButton>
        </div>
      </form>
    </section>
  );
}
