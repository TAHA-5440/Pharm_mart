import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth-forms";
import { AuthDivider, GoogleLink } from "@/components/google-button";
import { isGoogleConfigured } from "@/lib/google";
import { safeNextPath } from "@/lib/auth";

export const metadata = { title: "Log in" };

const ERRORS: Record<string, string> = {
  google: "Google sign-in failed. Try again, or use email and password.",
  google_config: "Google login is not configured on this deployment.",
  disabled: "This account is disabled.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next) ?? undefined;
  const error = params.error ? ERRORS[params.error] : null;
  const google = isGoogleConfigured();

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-6 md:py-4">
      <div className="grid overflow-hidden rounded-[1.75rem] bg-sheet shadow-[0_24px_80px_-32px_rgba(16,20,16,0.35)] ring-1 ring-rule md:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative min-h-48 md:min-h-[calc(100dvh-7.5rem)]">
          <Image
            src="/images/workshop.jpg"
            alt="Workshop steel and tools"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/55 to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 text-xl font-semibold text-white md:text-2xl">
            One requirement. Multiple verified quotations.
          </p>
        </div>
        <div className="flex flex-col justify-center p-6 md:p-10">
          <p className="text-[11px] font-medium tracking-[0.16em] text-mark uppercase">
            ProcureX
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Demo: maria.s@example.com / password123
          </p>
          {error ? <p className="mt-4 text-sm text-stop">{error}</p> : null}
          <div className="mt-6 space-y-4">
            {google ? (
              <>
                <GoogleLink next={next} />
                <AuthDivider />
              </>
            ) : null}
            <LoginForm next={next} />
          </div>
          <p className="mt-6 text-sm">
            New here?{" "}
            <Link href="/register" className="font-medium text-steel">
              Register as buyer or supplier
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
