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
    <div className="relative flex min-h-screen w-full items-center justify-center bg-navy py-6 md:py-10">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#061226]/95 via-[#0d2244]/80 to-[#075ff7]/40" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="absolute -inset-1 z-0 rounded-[3rem] bg-gradient-to-b from-[#13c8f4]/20 to-[#075ff7]/10 opacity-50 blur-2xl filter" />
        <div className="relative z-10 rounded-[2.5rem] shadow-2xl ring-1 ring-white/20">
          <RegisterDesk
            key={initialRole}
            google={pending ? { email: pending.email, name: pending.name } : null}
            next={next}
            showGoogle={google && !pending}
            initialRole={initialRole}
          />
        </div>
      </div>
    </div>
  );
}
