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
    <AuthShell heading="Welcome Back">
      <p className="mt-3 text-center text-sm font-medium text-ink-soft">
        {demoHint(needed)}
      </p>
      {error ? (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 rounded-xl border border-stop/20 bg-stop/10 p-3 text-center text-sm font-medium text-stop">
          {error}
        </div>
      ) : null}
      <div className="mt-8 space-y-4">
        {google ? (
          <>
            <GoogleLink next={next} />
            <AuthDivider />
          </>
        ) : null}
        <LoginForm next={next} />
      </div>
      <p className="mt-8 text-center text-sm font-medium text-ink-soft">
        New here?{" "}
        <Link
          href="/register"
          className="text-mark transition-colors hover:text-steel hover:underline"
        >
          Create an account
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-navy">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        {/* Rich vibrant gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#061226]/95 via-[#0d2244]/80 to-[#075ff7]/40" />
      </div>

      {/* Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-md px-4 py-8 sm:px-6 md:max-w-lg">
        {/* Glow effect behind the card */}
        <div className="absolute -inset-0.5 z-0 rounded-[2.5rem] bg-gradient-to-b from-[#13c8f4]/30 to-[#075ff7]/10 opacity-50 blur-2xl filter" />
        
        <div className="glass relative z-10 overflow-hidden rounded-[2rem] px-6 py-10 shadow-2xl sm:px-10 sm:py-12">
          <div className="mb-6 flex justify-center transition-transform duration-500 hover:scale-105">
            <BrandMark height={44} className="drop-shadow-sm" />
          </div>
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-ink drop-shadow-sm">
            {heading}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}
