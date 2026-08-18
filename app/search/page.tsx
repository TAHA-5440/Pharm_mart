import { redirect } from "next/navigation";

export default async function SearchRedirect({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; type?: string; city?: string }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.category) params.set("category", sp.category);
  if (sp.city) params.set("city", sp.city);
  if (sp.type === "machines") params.set("type", "machines");
  else if (sp.type === "products") params.set("type", "products");
  const qs = params.toString();
  redirect(qs ? `/marketplace?${qs}` : "/marketplace");
}
