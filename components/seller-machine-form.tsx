import { CITIES } from "@/lib/utils";
import { saveSellerMachineAction } from "@/app/seller/listing-actions";
import { MarkButton } from "@/components/mark-button";
import { SellerFileInput } from "@/components/seller-file-input";
import { sellerField } from "@/lib/seller";

const CONDITIONS = [
  ["new_unused", "New unused"],
  ["excellent", "Excellent"],
  ["good", "Good"],
  ["fair", "Fair"],
  ["as_is", "As-is"],
  ["refurbished", "Refurbished"],
] as const;

type Machine = {
  id: string;
  title: string;
  manufacturer: string;
  model: string;
  year: number | null;
  condition: string;
  serialNumber: string | null;
  city: string;
  description: string;
  photoUrls: string;
  pricePkr: number | null;
  requestPrice: boolean;
  warranty: string | null;
  installation: boolean;
  inspection: boolean;
  categoryId: string | null;
};

export function SellerMachineForm({
  categories,
  machine,
  defaultCity,
}: {
  categories: { id: string; name: string }[];
  machine?: Machine;
  defaultCity?: string;
}) {
  return (
    <form action={saveSellerMachineAction} className="grid gap-4 sm:grid-cols-2">
      {machine ? <input type="hidden" name="id" value={machine.id} /> : null}
      <label className="block text-sm sm:col-span-2">
        Title
        <input name="title" required defaultValue={machine?.title} className={sellerField} />
      </label>
      <label className="block text-sm">
        Manufacturer
        <input name="manufacturer" required defaultValue={machine?.manufacturer} className={sellerField} />
      </label>
      <label className="block text-sm">
        Model
        <input name="model" required defaultValue={machine?.model} className={sellerField} />
      </label>
      <label className="block text-sm">
        Year
        <input name="year" type="number" min={1970} max={2030} defaultValue={machine?.year ?? ""} className={sellerField} />
      </label>
      <label className="block text-sm">
        Condition
        <select name="condition" defaultValue={machine?.condition ?? "good"} className={sellerField}>
          {CONDITIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        City
        <select name="city" defaultValue={machine?.city ?? defaultCity} className={sellerField}>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Serial number
        <input name="serialNumber" defaultValue={machine?.serialNumber ?? ""} className={sellerField} />
      </label>
      <label className="block text-sm sm:col-span-2">
        Description
        <textarea
          name="description"
          required
          minLength={12}
          rows={4}
          defaultValue={machine?.description}
          className={`${sellerField} h-auto py-2`}
        />
      </label>
      <label className="block text-sm">
        Category
        <select name="categoryId" defaultValue={machine?.categoryId ?? ""} className={sellerField}>
          <option value="">Uncategorised</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Warranty
        <input name="warranty" defaultValue={machine?.warranty ?? ""} placeholder="3 months" className={sellerField} />
      </label>
      <label className="block text-sm">
        Price (PKR)
        <input name="pricePkr" type="number" min={1} defaultValue={machine?.pricePkr ?? ""} className={sellerField} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="requestPrice" defaultChecked={machine?.requestPrice ?? false} />
        Price on request
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="installation" defaultChecked={machine?.installation} /> Installation available
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="inspection" defaultChecked={machine?.inspection} /> Inspection available
      </label>
      <div className="text-sm sm:col-span-2">
        Photos
        {machine?.photoUrls ? (
          <p className="mt-1 text-xs text-ink-soft">Upload to replace the current set. Ops prefer several real frames.</p>
        ) : null}
        <SellerFileInput name="photos" accept="image/jpeg,image/png,image/webp" multiple hint="Machine photos" />
      </div>
      <div className="sm:col-span-2">
        <MarkButton type="submit">{machine ? "Save machine" : "Add machine"}</MarkButton>
      </div>
    </form>
  );
}
