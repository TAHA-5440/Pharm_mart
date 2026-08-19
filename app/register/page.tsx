import { RegisterDesk } from "@/components/register-desk";
import { getGooglePending, isGoogleConfigured } from "@/lib/google";
import { safeNextPath } from "@/lib/auth";

export const metadata = { title: "Register" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string; next?: string; role?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next) ?? undefined;
  const pending = await getGooglePending();
  const google = isGoogleConfigured();
  const initialRole = params.role === "supplier" ? "supplier" : "buyer";

  return (
    <div className="home-glass mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 pb-3 pt-3 md:px-6 md:pb-4 md:pt-4">
      <RegisterDesk
        key={initialRole}
        google={pending ? { email: pending.email, name: pending.name } : null}
        next={next}
        showGoogle={google && !pending}
        initialRole={initialRole}
      />
    </div>
  );
}
