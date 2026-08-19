"use client";

import { cancelRfqAction } from "@/app/buyer/actions";

export function CancelRfqButton({ rfqId }: { rfqId: string }) {
  return (
    <form
      action={cancelRfqAction}
      onSubmit={(event) => {
        if (!confirm("Cancel this RFQ? Matched suppliers will see it as cancelled. This is not a purchase order.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="rfqId" value={rfqId} />
      <button className="rounded-full border border-stop px-4 py-2 text-sm text-stop" type="submit">
        Cancel RFQ
      </button>
    </form>
  );
}
