export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl">Privacy</h1>
      <p className="mt-6 text-ink-soft">
        We collect account details, RFQs, quotations, and usage events needed to
        run the marketplace. RFQs are visible to matched suppliers, not indexed
        on the public web. We do not sell buyer lists.
      </p>
    </div>
  );
}
