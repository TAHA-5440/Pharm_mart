import { openRfqAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";

export function OpenRfqForm({
  rfqId,
  categoryId,
  categories,
  submitLabel = "Open + match this type",
}: {
  rfqId: string;
  categoryId?: string | null;
  categories: { id: string; name: string }[];
  submitLabel?: string;
}) {
  return (
    <form action={openRfqAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="rfqId" value={rfqId} />
      <label className="text-sm">
        Supplier type
        <select
          name="categoryId"
          required
          defaultValue={categoryId ?? ""}
          className="mt-1 w-full border border-rule bg-paper px-3 py-2 text-sm sm:min-w-64"
        >
          <option value="" disabled>
            Select the type to notify
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <MarkButton type="submit">{submitLabel}</MarkButton>
    </form>
  );
}
