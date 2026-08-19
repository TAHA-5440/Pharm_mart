import { saveProductAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";

const field = "mt-1 w-full border border-rule bg-paper px-3 py-2 text-sm";

type ProductValues = {
  id?: string;
  name: string;
  kind: string;
  categoryId: string | null;
  shortDesc: string;
  longDesc: string | null;
  specs: string;
  leadDays: number | null;
  pricePkr: number | null;
  priceOnRequest: boolean;
  imageUrl: string | null;
};

export function ProductForm({
  product,
  categories,
  error,
}: {
  product?: ProductValues;
  categories: { id: string; name: string }[];
  error?: string;
}) {
  return (
    <form action={saveProductAction} className="mt-6 space-y-4 border border-rule bg-sheet p-5">
      {product?.id ? <input type="hidden" name="productId" value={product.id} /> : null}
      {error === "required" ? (
        <p className="border border-stop px-3 py-2 text-sm text-stop">
          Name, short description, and category are required.
        </p>
      ) : null}
      {error === "image" ? (
        <p className="border border-stop px-3 py-2 text-sm text-stop">
          Add at least one product photo before publishing.
        </p>
      ) : null}
      <label className="block text-sm">
        Type
        <select name="kind" defaultValue={product?.kind ?? "product"} className={field}>
          <option value="product">Product</option>
          <option value="service">Service</option>
        </select>
      </label>
      <label className="block text-sm">
        Name
        <input name="name" required defaultValue={product?.name ?? ""} className={field} />
      </label>
      <label className="block text-sm">
        Category
        <select name="categoryId" required defaultValue={product?.categoryId ?? ""} className={field}>
          <option value="">Select a type</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Short description
        <textarea name="shortDesc" required rows={3} defaultValue={product?.shortDesc ?? ""} className={field} />
      </label>
      <label className="block text-sm">
        Long description
        <textarea name="longDesc" rows={4} defaultValue={product?.longDesc ?? ""} className={field} />
      </label>
      <label className="block text-sm">
        Specs (one per line, e.g. Material: SS316)
        <textarea name="specs" rows={4} defaultValue={product?.specs ?? ""} className={field} />
      </label>
      <label className="block text-sm">
        Photo {product?.imageUrl ? <a href={product.imageUrl} className="text-steel underline" target="_blank">current</a> : null}
        <input name="image" type="file" accept="image/*" className={field} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="priceOnRequest" defaultChecked={product?.priceOnRequest ?? true} />
        Price on request
      </label>
      <label className="block text-sm">
        Price (PKR) if not on request
        <input name="pricePkr" type="number" min={0} defaultValue={product?.pricePkr ?? ""} className={field} />
      </label>
      <label className="block text-sm">
        Lead time (days)
        <input name="leadDays" type="number" min={1} defaultValue={product?.leadDays ?? ""} className={field} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          name="intent"
          value="draft"
          className="border border-rule px-4 py-2 text-sm"
        >
          Save draft
        </button>
        <MarkButton type="submit" name="intent" value="publish">
          Publish
        </MarkButton>
      </div>
    </form>
  );
}
