import { saveSellerProductAction } from "@/app/seller/listing-actions";
import { MarkButton } from "@/components/mark-button";
import { SellerFileInput } from "@/components/seller-file-input";
import { sellerField } from "@/lib/seller";

type Product = {
  id: string;
  name: string;
  shortDesc: string;
  longDesc: string | null;
  specs: string;
  categoryId: string | null;
  pricePkr: number | null;
  priceOnRequest: boolean;
  leadDays: number | null;
  imageUrl: string | null;
};

export function SellerProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: Product;
}) {
  return (
    <form action={saveSellerProductAction} className="grid gap-4 sm:grid-cols-2">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <label className="block text-sm sm:col-span-2">
        Name
        <input name="name" required defaultValue={product?.name} className={sellerField} />
      </label>
      <label className="block text-sm sm:col-span-2">
        Short description
        <input name="shortDesc" required minLength={8} defaultValue={product?.shortDesc} className={sellerField} />
      </label>
      <label className="block text-sm sm:col-span-2">
        Long description
        <textarea name="longDesc" rows={4} defaultValue={product?.longDesc ?? ""} className={`${sellerField} h-auto py-2`} />
      </label>
      <label className="block text-sm sm:col-span-2">
        Specs (one per line, Name: value)
        <textarea name="specs" rows={4} defaultValue={product?.specs ?? ""} className={`${sellerField} h-auto py-2`} />
      </label>
      <label className="block text-sm">
        Category
        <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={sellerField}>
          <option value="">Uncategorised</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Lead time (days)
        <input name="leadDays" type="number" min={1} defaultValue={product?.leadDays ?? ""} className={sellerField} />
      </label>
      <label className="block text-sm">
        Price (PKR)
        <input name="pricePkr" type="number" min={1} defaultValue={product?.pricePkr ?? ""} className={sellerField} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="priceOnRequest" defaultChecked={product?.priceOnRequest ?? true} />
        Price on request
      </label>
      <div className="text-sm sm:col-span-2">
        Photo
        {product?.imageUrl ? <p className="mt-1 text-xs text-ink-soft">Upload only to replace the current photo.</p> : null}
        <SellerFileInput name="image" accept="image/jpeg,image/png,image/webp" hint="Product photo" />
      </div>
      <div className="sm:col-span-2">
        <MarkButton type="submit">{product ? "Save product" : "Add product"}</MarkButton>
      </div>
    </form>
  );
}
