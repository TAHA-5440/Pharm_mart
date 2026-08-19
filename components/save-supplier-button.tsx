import { Button } from "@/components/ui/button";
import { toggleSavedSupplierAction } from "@/app/buyer/actions";

export function SaveSupplierButton({
  supplierId,
  saved,
  next,
}: {
  supplierId: string;
  saved: boolean;
  next: string;
}) {
  return (
    <form action={toggleSavedSupplierAction}>
      <input type="hidden" name="supplierId" value={supplierId} />
      <input type="hidden" name="next" value={next} />
      <Button type="submit" variant="outline" className="w-full">
        {saved ? "Saved — remove" : "Save supplier"}
      </Button>
    </form>
  );
}
