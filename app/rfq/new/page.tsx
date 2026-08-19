import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MarkButton } from "@/components/mark-button";
import { createRfqAction, logoutAction } from "@/app/actions";
import { CITIES } from "@/lib/utils";

export const metadata = { title: "Post an RFQ" };

const field =
  "mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4";

const ERRORS: Record<string, string> = {
  incomplete: "Fill title, a description of at least 20 characters, quantity, and city.",
  org: "This buyer account has no company attached. Register again as a buyer.",
  save: "Could not save the RFQ. Try again.",
};

export default async function NewRfqPage({
  searchParams,
}: {
  searchParams: Promise<{
    supplier?: string;
    machine?: string;
    product?: string;
    error?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/rfq/new");
  if (session.role !== "buyer") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
        <h1 className="text-4xl font-semibold">Post an RFQ</h1>
        <p className="mt-2 text-sm text-ink-soft">
          RFQs are posted from a buyer account. You are signed in as a {session.role}.
        </p>
        <div className="mt-8 space-y-3 rounded-3xl bg-sheet p-6">
          <MarkButton href={session.role === "admin" ? "/admin" : "/seller"}>
            Back to desk
          </MarkButton>
          <form action={logoutAction}>
            <input type="hidden" name="next" value="/login?next=/rfq/new" />
            <button className="block text-sm text-steel underline" type="submit">
              Log out and sign in as a buyer
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sp = await searchParams;
  const error = sp.error ? ERRORS[sp.error] : null;
  const categories = await prisma.category.findMany({
    where: { kind: "type", active: true },
    orderBy: { name: "asc" },
  });
  const supplier = sp.supplier
    ? await prisma.supplierOrganisation.findUnique({ where: { slug: sp.supplier } })
    : null;
  const machine = sp.machine
    ? await prisma.usedMachineListing.findUnique({ where: { slug: sp.machine } })
    : null;
  const product = sp.product
    ? await prisma.productListing.findFirst({ where: { slug: sp.product, status: "live" } })
    : null;

  const context = product?.name ?? machine?.title ?? null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="text-4xl font-semibold">Post an RFQ</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Matched suppliers only — not a public classified ad. Ops confirm the supply type before anyone is notified.
        {supplier ? ` Sending to ${supplier.displayName} only.` : ""}
        {context ? ` Regarding: ${context}.` : ""}
      </p>
      {error ? <p className="mt-4 rounded-2xl bg-stop/10 px-4 py-3 text-sm text-stop">{error}</p> : null}
      <form action={createRfqAction} className="mt-8 space-y-4 rounded-3xl bg-sheet p-6">
        {supplier ? <input type="hidden" name="singleSupplierId" value={supplier.id} /> : null}
        <label className="block text-sm">
          Title
          <input
            name="title"
            required
            minLength={4}
            defaultValue={product?.name ?? machine?.title ?? ""}
            placeholder="500 L SS316 mixing vessel"
            className={field}
          />
        </label>
        <label className="block text-sm">
          Category
          <select
            name="categoryId"
            defaultValue={product?.categoryId ?? machine?.categoryId ?? ""}
            className={field}
          >
            <option value="">Not sure — ops will classify</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Description
          <textarea
            name="description"
            required
            minLength={20}
            rows={6}
            defaultValue={product?.shortDesc ?? machine?.description ?? ""}
            placeholder="cGMP, jacketed, quantity, utilities, installation in Lahore…"
            className="mt-1 w-full rounded-3xl border border-rule bg-paper px-4 py-3"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Quantity
            <input name="quantity" required placeholder="2 vessels" className={field} />
          </label>
          <label className="block text-sm">
            City
            <select name="city" required className={field}>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          Needed within
          <select name="neededBy" className={field}>
            <option>15 days</option>
            <option>30 days</option>
            <option>60 days</option>
            <option>90 days</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="installation" /> Installation required
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="usedAllowed" /> Used equipment allowed
        </label>
        <MarkButton type="submit">Submit RFQ</MarkButton>
      </form>
    </div>
  );
}
