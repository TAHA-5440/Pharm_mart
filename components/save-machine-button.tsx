import { Button } from "@/components/ui/button";
import { toggleFavouriteMachineAction } from "@/app/buyer/actions";

export function SaveMachineButton({
  listingId,
  saved,
  next,
}: {
  listingId: string;
  saved: boolean;
  next: string;
}) {
  return (
    <form action={toggleFavouriteMachineAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="next" value={next} />
      <Button type="submit" variant="outline" className="w-full">
        {saved ? "Saved — remove" : "Save listing"}
      </Button>
    </form>
  );
}
