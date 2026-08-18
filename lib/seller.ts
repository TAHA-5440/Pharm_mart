export function sellerCompleteness(
  org: {
    logoUrl: string | null;
    about: string;
    catalogueUrl: string | null;
    ntn: string | null;
    whatsapp: string | null;
    categories: unknown[];
  },
  productCount: number,
) {
  const items = [
    { label: "Logo", ok: Boolean(org.logoUrl) },
    { label: "About (80+ characters)", ok: org.about.trim().length >= 80 },
    { label: "At least one category", ok: org.categories.length >= 1 },
    {
      label: "3 products or a catalogue PDF",
      ok: Boolean(org.catalogueUrl) || productCount >= 3,
    },
    { label: "NTN", ok: Boolean(org.ntn) },
    { label: "WhatsApp", ok: Boolean(org.whatsapp) },
  ];
  const done = items.filter((i) => i.ok).length;
  return { items, pct: Math.round((done / items.length) * 100) };
}
