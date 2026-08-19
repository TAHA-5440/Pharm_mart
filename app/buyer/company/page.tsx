import { updateBuyerAccountAction, updateBuyerCompanyAction } from "@/app/buyer/actions";
import { MarkButton } from "@/components/mark-button";
import { BUYER_ERRORS, buyerField, requireBuyer } from "@/lib/buyer";
import { CITIES, INDUSTRY_LABEL } from "@/lib/utils";

export const metadata = { title: "Company" };

export default async function BuyerCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { org, user } = await requireBuyer();
  const params = await searchParams;
  const error = params.error ? BUYER_ERRORS[params.error] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Company</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Matched suppliers see organisation name, city, and industry on an RFQ — not your personal mobile until you
          contact them. This company is not listed in the public directory.
        </p>
      </div>
      {error ? <p className="rounded-2xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}

      <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
        <h3 className="text-lg font-semibold">Organisation</h3>
        <form action={updateBuyerCompanyAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Legal name
            <input name="legalName" required defaultValue={org.legalName} className={buyerField} />
          </label>
          <label className="block text-sm">
            Display name
            <input name="displayName" defaultValue={org.displayName ?? ""} className={buyerField} />
          </label>
          <label className="block text-sm">
            City
            <select name="city" defaultValue={org.city} className={buyerField}>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Industry
            <select name="industry" defaultValue={org.industry} className={buyerField}>
              {Object.entries(INDUSTRY_LABEL).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            Address
            <input name="address" defaultValue={org.address ?? ""} className={buyerField} />
          </label>
          <label className="block text-sm">
            NTN
            <input name="ntn" defaultValue={org.ntn ?? ""} className={buyerField} />
          </label>
          <label className="block text-sm">
            Website
            <input name="website" defaultValue={org.website ?? ""} placeholder="https://" className={buyerField} />
          </label>
          <label className="block text-sm sm:col-span-2">
            About the plant
            <textarea name="about" rows={4} defaultValue={org.about ?? ""} className={`${buyerField} h-auto py-2`} />
          </label>
          <div className="sm:col-span-2">
            <MarkButton type="submit">Save organisation</MarkButton>
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
        <h3 className="text-lg font-semibold">Your account</h3>
        <p className="mt-1 text-sm text-ink-soft">{user.email} — email is the login and cannot be changed here.</p>
        <form action={updateBuyerAccountAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Name
            <input name="name" required defaultValue={user.name} className={buyerField} />
          </label>
          <label className="block text-sm">
            Job title
            <input name="jobTitle" defaultValue={user.jobTitle ?? ""} placeholder="Purchase Manager" className={buyerField} />
          </label>
          <label className="block text-sm sm:col-span-2">
            Mobile
            <input name="phone" defaultValue={user.phone ?? ""} placeholder="03XXXXXXXXX" className={buyerField} />
          </label>
          <div className="sm:col-span-2">
            <MarkButton type="submit">Save account</MarkButton>
          </div>
        </form>
      </section>
    </div>
  );
}
