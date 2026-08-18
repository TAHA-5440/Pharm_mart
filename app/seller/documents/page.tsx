import { updateBusinessDetailsAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";
import { SellerFileInput } from "@/components/seller-file-input";
import { requireSeller, sellerField, SELLER_ERRORS } from "@/lib/seller";

export const metadata = { title: "Documents · Seller" };

export default async function SellerDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { org } = await requireSeller();
  const params = await searchParams;
  const error = params.error ? SELLER_ERRORS[params.error] : null;

  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <h2 className="text-xl font-semibold">Business documents</h2>
      <p className="mt-1 text-sm text-ink-soft">
        NTN, CNIC, and proof help ops approve you. You can finish this while the profile is under review.
      </p>
      {error ? <p className="mt-4 rounded-2xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}
      <form action={updateBusinessDetailsAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          Business address
          <input name="address" required defaultValue={org.address || ""} className={sellerField} />
        </label>
        <label className="block text-sm">
          NTN
          <input name="ntn" required defaultValue={org.ntn || ""} className={sellerField} />
        </label>
        <label className="block text-sm">
          CNIC
          <input name="cnic" required defaultValue={org.cnic || ""} className={sellerField} />
        </label>
        <div className="text-sm sm:col-span-2">
          Business proof
          {org.businessProofUrl ? (
            <p className="mt-1 text-xs text-ink-soft">A file is already on file. Upload only to replace it.</p>
          ) : null}
          <SellerFileInput
            name="businessProof"
            accept="image/*,.pdf"
            required={!org.businessProofUrl}
            hint="Letterhead, card, or utility bill"
          />
        </div>
        <div className="sm:col-span-2">
          <MarkButton type="submit">Save documents</MarkButton>
        </div>
      </form>
    </section>
  );
}
