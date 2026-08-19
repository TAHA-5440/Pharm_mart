import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { establishSession, afterLoginPath, safeNextPath } from "@/lib/auth";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  isGoogleConfigured,
  setGooglePending,
} from "@/lib/google";

function clearOauthCookies(jar: Awaited<ReturnType<typeof cookies>>) {
  jar.delete(GOOGLE_STATE_COOKIE);
  jar.delete(GOOGLE_VERIFIER_COOKIE);
  jar.delete(GOOGLE_NEXT_COOKIE);
}

export async function GET(request: Request) {
  if (!isGoogleConfigured()) redirect("/login?error=google_config");

  const url = new URL(request.url);
  if (url.searchParams.get("error")) redirect("/login?error=google");

  const jar = await cookies();
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = jar.get(GOOGLE_STATE_COOKIE)?.value;
  const verifier = jar.get(GOOGLE_VERIFIER_COOKIE)?.value;
  const next = safeNextPath(jar.get(GOOGLE_NEXT_COOKIE)?.value);

  if (!code || !state || !cookieState || state !== cookieState || !verifier) {
    redirect("/login?error=google");
  }

  let profile;
  try {
    const tokens = await exchangeGoogleCode(code, verifier);
    profile = await fetchGoogleProfile(tokens.access_token);
  } catch {
    clearOauthCookies(jar);
    redirect("/login?error=google");
  }

  const [byGoogle, byEmail] = await Promise.all([
    prisma.user.findUnique({ where: { googleId: profile.googleId } }),
    prisma.user.findUnique({ where: { email: profile.email } }),
  ]);

  if (byGoogle && byEmail && byGoogle.id !== byEmail.id) {
    clearOauthCookies(jar);
    redirect("/login?error=google");
  }

  const existing = byGoogle ?? byEmail;
  if (existing) {
    if (!existing.googleId) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { googleId: profile.googleId },
      });
    }
    const signedIn = await establishSession(existing);
    clearOauthCookies(jar);
    if (signedIn.error || !signedIn.href) redirect("/login?error=disabled");
    redirect(afterLoginPath(existing.role, next));
  }

  await setGooglePending(profile);
  clearOauthCookies(jar);
  redirect(
    next
      ? `/register?google=1&next=${encodeURIComponent(next)}`
      : "/register?google=1",
  );
}
