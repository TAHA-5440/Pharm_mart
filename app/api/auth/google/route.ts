import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth";
import {
  createOAuthState,
  createPkce,
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  googleAuthorizationUrl,
  isGoogleConfigured,
  oauthCookieOptions,
} from "@/lib/google";

export async function GET(request: Request) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_config", request.url));
  }

  const next = safeNextPath(new URL(request.url).searchParams.get("next") ?? "") ?? "";
  const state = createOAuthState();
  const { verifier, challenge } = createPkce();
  const res = NextResponse.redirect(googleAuthorizationUrl(state, challenge));
  const cookie = oauthCookieOptions();
  res.cookies.set(GOOGLE_STATE_COOKIE, state, cookie);
  res.cookies.set(GOOGLE_VERIFIER_COOKIE, verifier, cookie);
  res.cookies.set(GOOGLE_NEXT_COOKIE, next, cookie);
  return res;
}
