import Link from "next/link";
import { PhotoFrame } from "@/components/photo-frame";
import { MarkButton } from "@/components/mark-button";
import { Button } from "@/components/ui/button";

export const metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-mill">How it works</p>
          <h1 className="mt-2 text-4xl font-semibold">Procurement, not a cart</h1>
          <p className="mt-4 text-ink-soft">
            Post one requirement. We match verified-enough suppliers. You compare
            3–5 quotations. Contracts stay between buyer and supplier.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/marketplace">Browse marketplace</Link>
            </Button>
            <MarkButton href="/rfq/new">Post RFQ</MarkButton>
          </div>
        </div>
        <PhotoFrame
          src="/images/hero.jpg"
          alt="Manufacturing plant"
          className="min-h-[240px]"
        />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-sheet p-6">
          <h2 className="text-xl font-semibold">For buyers</h2>
          <ol className="mt-4 space-y-3 text-ink-soft">
            <li>
              <strong className="text-ink">1. Post a requirement.</strong> Specs,
              quantity, city, timeline.
            </li>
            <li>
              <strong className="text-ink">2. We match 3–5 suppliers.</strong> Not
              a public bazaar.
            </li>
            <li>
              <strong className="text-ink">3. Compare quotations.</strong> Price,
              delivery, warranty, verification.
            </li>
            <li>
              <strong className="text-ink">4. Message or call.</strong> Quotations
              are not purchase orders.
            </li>
          </ol>
        </div>
        <div className="rounded-3xl bg-sheet p-6">
          <h2 className="text-xl font-semibold">For suppliers</h2>
          <ol className="mt-4 space-y-3 text-ink-soft">
            <li>
              <strong className="text-ink">1. Complete your profile.</strong>{" "}
              Products, city, certificates.
            </li>
            <li>
              <strong className="text-ink">2. Receive matched RFQs.</strong> Only
              relevant industrial demand.
            </li>
            <li>
              <strong className="text-ink">3. Submit a structured quote.</strong>{" "}
              Price, delivery, warranty, PDF.
            </li>
          </ol>
          <Link href="/register" className="mt-4 inline-block text-sm font-medium text-steel">
            Register as a supplier →
          </Link>
        </div>
      </div>
    </div>
  );
}
