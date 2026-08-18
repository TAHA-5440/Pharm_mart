import "server-only";
import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const GOOGLE_STATE_COOKIE = "pharmstore_google_state";
export const GOOGLE_VERIFIER_COOKIE = "pharmstore_google_verifier";
export const GOOGLE_NEXT_COOKIE = "pharmstore_google_next";
export const GOOGLE_PENDING_COOKIE = "pharmstore_google_pending";

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

export function publicAppUrl() {
  const explicit = process.env.AUTH_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}

export function googleRedirectUri() {
  return `${publicAppUrl()}/api/auth/google/callback`;
}

export function oauthCookieOptions(maxAge = 600) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

export function createPkce() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function createOAuthState() {
  return randomBytes(24).toString("base64url");
}

export function googleAuthorizationUrl(state: string, challenge: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", googleRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeGoogleCode(code: string, verifier: string) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    code,
    grant_type: "authorization_code",
    redirect_uri: googleRedirectUri(),
    code_verifier: verifier,
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error("token_exchange_failed");
  }
  return res.json() as Promise<{ access_token: string }>;
}

export async function fetchGoogleProfile(
  accessToken: string,
): Promise<GoogleProfile> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("userinfo_failed");
  const data = (await res.json()) as {
    sub?: string;
    email?: string;
    name?: string;
  };
  if (!data.sub || !data.email) throw new Error("no_email");
  return {
    googleId: data.sub,
    email: data.email.toLowerCase(),
    name: (data.name ?? data.email.split("@")[0]).slice(0, 80),
  };
}

export async function setGooglePending(profile: GoogleProfile) {
  const token = await new SignJWT({
    googleId: profile.googleId,
    email: profile.email,
    name: profile.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("20m")
    .sign(secret());
  const jar = await cookies();
  jar.set(GOOGLE_PENDING_COOKIE, token, oauthCookieOptions(60 * 20));
}

export async function getGooglePending(): Promise<GoogleProfile | null> {
  if (!process.env.AUTH_SECRET) return null;
  const jar = await cookies();
  const token = jar.get(GOOGLE_PENDING_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const email = String(payload.email ?? "");
    const googleId = String(payload.googleId ?? "");
    const name = String(payload.name ?? "");
    if (!email || !googleId) return null;
    return { email, googleId, name };
  } catch {
    return null;
  }
}

export async function clearGooglePending() {
  const jar = await cookies();
  jar.delete(GOOGLE_PENDING_COOKIE);
}
