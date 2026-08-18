import { updateSellerProfileAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";
import { SellerFileInput } from "@/components/seller-file-input";
import { requireSeller, sellerField, SELLER_ERRORS } from "@/lib/seller";

export const metadata = { title: "Profile · Seller" };

export default async function SellerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { org } = await requireSeller();
  const params = await searchParams;
  const error = params.error ? SELLER_ERRORS[params.error] : null;

  return (
    <section className="rounded-3xl bg-sheet p-5 shadow-[0_10px_30px_rgba(16,20,16,0.06)] md:p-6">
      <h2 className="text-xl font-semibold">Company profile</h2>
      <p className="mt-1 text-sm text-ink-soft">
        This is what buyers see on your public mini-site after approval. Listing editing comes later.
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
