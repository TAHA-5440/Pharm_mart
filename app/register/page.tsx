import { RegisterDesk } from "@/components/register-desk";
import { getGooglePending, isGoogleConfigured } from "@/lib/google";
import { safeNextPath } from "@/lib/auth";

export const metadata = { title: "Register" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next) ?? undefined;
  const pending = await getGooglePending();
  const google = isGoogleConfigured();

  return (
    <div className="home-glass fixed inset-0 z-0 flex flex-col overflow-hidden">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-3 pb-3 pt-[4.65rem] md:px-6">
        <RegisterDesk
          google={pending ? { email: pending.email, name: pending.name } : null}
          next={next}
          showGoogle={google && !pending}
        />
      </div>
    </div>
  );
}
