import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction, updateSupplierProfileAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";
import { SellerHeader, SellerNav, PublicProfileLink } from "@/components/seller-nav";
import { CITIES, SERVICE_OPTIONS } from "@/lib/utils";

export const metadata = { title: "Seller profile" };

const field = "mt-1 w-full border border-rule bg-paper px-3 py-2 text-sm";

export default async function SellerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }
  const { saved, error } = await searchParams;
  const [org, categories] = await Promise.all([
    prisma.supplierOrganisation.findUnique({
      where: { id: session.supplierOrgId },
      include: { categories: true },
    }),
    prisma.category.findMany({
      where: { kind: "type", active: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!org) redirect("/login");
  const selectedCats = new Set(org.categories.map((c) => c.categoryId));
  const selectedIndustries = new Set(
    org.industries.split(",").map((s) => s.trim()).filter(Boolean),
  );
  const selectedServices = new Set(
    org.servicesOffered.split(",").map((s) => s.trim()).filter(Boolean),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <SellerHeader name={org.displayName}>
        <form action={logoutAction}>
          <button className="text-sm text-ink-soft underline" type="submit">
            Log out
          </button>
        </form>
      </SellerHeader>
      <p className="mt-2 text-sm text-ink-soft">
        Status: {org.publicStatus.replaceAll("_", " ")}
      </p>
      <SellerNav current="profile" />

      {saved ? (
        <p className="mt-4 border border-live px-3 py-2 text-sm text-live">Profile saved.</p>
      ) : null}
      {error === "required" ? (
        <p className="mt-4 border border-stop px-3 py-2 text-sm text-stop">
          Display name, legal name, about, city, phone, and email are required.
        </p>
      ) : null}
      {error === "industry" ? (
        <p className="mt-4 border border-stop px-3 py-2 text-sm text-stop">
          Select at least one industry.
        </p>
      ) : null}

      <form action={updateSupplierProfileAction} className="mt-8 space-y-8">
        <section className="border border-rule bg-sheet p-5">
          <h2 className="font-display text-2xl">Company</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Display name
              <input name="displayName" required defaultValue={org.displayName} className={field} />
            </label>
            <label className="text-sm">
              Legal name
              <input name="legalName" required defaultValue={org.legalName} className={field} />
            </label>
            <label className="text-sm sm:col-span-2">
              Tagline
              <input name="tagline" maxLength={120} defaultValue={org.tagline ?? ""} className={field} />
            </label>
            <label className="text-sm sm:col-span-2">
              About (80+ characters for a complete profile)
              <textarea name="about" required rows={5} defaultValue={org.about} className={field} />
            </label>
            <label className="text-sm">
              Year established
              <input
                name="yearEstablished"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                defaultValue={org.yearEstablished ?? ""}
                className={field}
              />
            </label>
            <label className="text-sm">
              Head office city
              <select name="city" defaultValue={org.city} className={field}>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              Other cities served
              <input
                name="citiesServed"
                defaultValue={org.citiesServed}
                placeholder="Lahore, Faisalabad, Pakistan"
                className={field}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              Address
              <input name="address" defaultValue={org.address ?? ""} className={field} />
            </label>
          </div>
        </section>

        <section className="border border-rule bg-sheet p-5">
          <h2 className="font-display text-2xl">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Phone
              <input name="phone" required defaultValue={org.phone} className={field} />
            </label>
            <label className="text-sm">
              WhatsApp
              <input name="whatsapp" defaultValue={org.whatsapp ?? ""} className={field} />
            </label>
            <label className="text-sm">
              Public email
              <input name="email" type="email" required defaultValue={org.email} className={field} />
            </label>
            <label className="text-sm">
              Website
              <input name="website" defaultValue={org.website ?? ""} className={field} />
            </label>
          </div>
        </section>

        <section className="border border-rule bg-sheet p-5">
          <h2 className="font-display text-2xl">Industries, services, categories</h2>
          <p className="mt-2 text-sm text-ink-soft">Industries served</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="industry" value="pharmaceutical" defaultChecked={selectedIndustries.has("pharmaceutical")} />
              Pharmaceutical
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="industry" value="food_beverage" defaultChecked={selectedIndustries.has("food_beverage")} />
              Food & Beverage
            </label>
          </div>
          <p className="mt-4 text-sm text-ink-soft">Services offered</p>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            {SERVICE_OPTIONS.map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input type="checkbox" name="service" value={s} defaultChecked={selectedServices.has(s)} />
                {s}
              </label>
            ))}
          </div>
          <label className="mt-4 block text-sm">
            Brands represented
            <input name="brands" defaultValue={org.brands} className={field} />
          </label>
          <p className="mt-4 text-sm text-ink-soft">Leaf categories (at least one)</p>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2">
                <input type="checkbox" name="categoryId" value={c.id} defaultChecked={selectedCats.has(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        </section>

        <section className="border border-rule bg-sheet p-5">
          <h2 className="font-display text-2xl">Media and documents</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Logo {org.logoUrl ? <a href={org.logoUrl} className="text-steel underline" target="_blank">current</a> : null}
              <input name="logo" type="file" accept="image/*" className={field} />
            </label>
            <label className="text-sm">
              Cover image {org.coverUrl ? <a href={org.coverUrl} className="text-steel underline" target="_blank">current</a> : null}
              <input name="cover" type="file" accept="image/*" className={field} />
            </label>
            <label className="text-sm">
              Catalogue PDF {org.catalogueUrl ? <a href={org.catalogueUrl} className="text-steel underline" target="_blank">current</a> : null}
              <input name="catalogue" type="file" accept=".pdf,application/pdf" className={field} />
            </label>
            <label className="text-sm">
              Business proof {org.businessProofUrl ? <a href={org.businessProofUrl} className="text-steel underline" target="_blank">current</a> : null}
              <input name="businessProof" type="file" accept="image/*,.pdf" className={field} />
            </label>
            <label className="text-sm">
              NTN
              <input name="ntn" defaultValue={org.ntn ?? ""} className={field} />
            </label>
            <label className="text-sm">
              CNIC
              <input name="cnic" defaultValue={org.cnic ?? ""} className={field} />
            </label>
          </div>
        </section>

        <MarkButton type="submit">Save profile</MarkButton>
      </form>
      <PublicProfileLink slug={org.slug} />
    </div>
  );
}
