import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { AuthDivider, GoogleLink } from "@/components/google-button";
import { isGoogleConfigured } from "@/lib/google";
import {
  getSession,
  homeForRole,
  pathAllowedForRole,
  roleNeededForPath,
  safeNextPath,
} from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";
import { BrandMark } from "@/components/brand-mark";
import type { UserRole } from "@prisma/client";

export const metadata = { title: "Log in" };

const ERRORS: Record<string, string> = {
  google: "Google sign-in failed. Try again, or use email and password.",
  google_config: "Google login is not configured on this deployment.",
  disabled: "This account is disabled.",
};

const DEMO: Record<UserRole, string> = {
  buyer: "maria.s@example.com",
  supplier: "laura.c@example.net",
  admin: "sarah.b@example.net",
};

const ROLE_LABEL: Record<UserRole, string> = {
  buyer: "buyer",
  supplier: "supplier",
  admin: "admin",
};

const DESK_LABEL: Record<UserRole, string> = {
  buyer: "buyer desk",
  supplier: "seller desk",
  admin: "admin desk",
};

function demoHint(role?: UserRole | null) {
  if (!role) return "Demo: maria.s@example.com / password123";
  return `Demo ${ROLE_LABEL[role]}: ${DEMO[role]} / password123`;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next) ?? undefined;
  const error = params.error ? ERRORS[params.error] : null;
  const google = isGoogleConfigured();
  const session = await getSession();
  const needed = next ? roleNeededForPath(next) : null;

  if (session && (!next || pathAllowedForRole(next, session.role))) {
    redirect(next && pathAllowedForRole(next, session.role) ? next : homeForRole(session.role));
  }

  if (session && next && needed && !pathAllowedForRole(next, session.role)) {
    const loginAgain = `/login?next=${encodeURIComponent(next)}`;
    return (
      <AuthShell heading="Wrong desk">
        <p className="mt-2 text-sm text-ink-soft">
          The {DESK_LABEL[needed]} needs a {ROLE_LABEL[needed]} account. You are signed in as{" "}
          {session.name}, a {ROLE_LABEL[session.role]}. One login is either a buyer or a supplier
          in this version — not both.
        </p>
        <div className="mt-8 space-y-3">
          <MarkButton href={homeForRole(session.role)} className="w-full">
            Back to your desk
          </MarkButton>
          <form action={logoutAction}>
            <input type="hidden" name="next" value={loginAgain} />
            <button className="block w-full text-center text-sm text-steel underline" type="submit">
              Log out and sign in as a {ROLE_LABEL[needed]}
            </button>
          </form>
        </div>
        <p className="mt-6 text-sm text-ink-soft">{demoHint(needed)}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell heading="Log in">
      <p className="mt-2 text-sm text-ink-soft">{demoHint(needed)}</p>
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
    </AuthShell>
  );
}

function AuthShell({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-6 md:py-4">
      <div className="grid overflow-hidden rounded-[1.75rem] bg-sheet shadow-[0_24px_80px_-32px_rgba(16,20,16,0.35)] ring-1 ring-rule md:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative min-h-48 overflow-hidden md:min-h-[calc(100dvh-7.5rem)]">
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
            Where Industry Connects.
          </p>
        </div>
        <div className="relative z-10 flex flex-col justify-center p-6 md:p-10">
          <BrandMark height={36} />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{heading}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
