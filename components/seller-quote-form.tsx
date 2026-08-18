import { submitQuoteAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";
import { sellerField } from "@/lib/seller";

export function SellerQuoteForm({
  rfqId,
  label,
  defaults,
}: {
  rfqId: string;
  label: string;
  defaults?: {
    pricePkr: number;
    deliveryDays: number;
    warranty: string;
    notes: string;
    installation: boolean;
  };
}) {
  return (
    <form action={submitQuoteAction} className="mt-4 grid gap-3 sm:grid-cols-3">
      <input type="hidden" name="rfqId" value={rfqId} />
      <label className="text-sm">
        Price (PKR)
        <input
          name="pricePkr"
          type="number"
          required
          min={1}
          defaultValue={defaults?.pricePkr}
          className={sellerField}
        />
      </label>
      <label className="text-sm">
        Delivery (days)
        <input
          name="deliveryDays"
          type="number"
          required
          min={1}
          defaultValue={defaults?.deliveryDays}
          className={sellerField}
        />
      </label>
      <label className="text-sm">
        Warranty
        <input
          name="warranty"
          required
          placeholder="1 year"
          defaultValue={defaults?.warranty}
          className={sellerField}
        />
      </label>
      <label className="text-sm sm:col-span-3">
        Notes
        <textarea name="notes" rows={2} defaultValue={defaults?.notes} className={`${sellerField} h-auto py-2`} />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="installation" defaultChecked={defaults?.installation} /> Includes installation
      </label>
      <div className="sm:justify-self-end">
        <MarkButton type="submit">{label}</MarkButton>
      </div>
    </form>
  );
}
