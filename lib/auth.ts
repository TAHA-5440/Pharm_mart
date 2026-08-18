import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { UserRole } from "@prisma/client";

const COOKIE = "pharmstore_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  buyerOrgId: string | null;
  supplierOrgId: string | null;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    buyerOrgId: user.buyerOrgId ?? "",
    supplierOrgId: user.supplierOrgId ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  if (!process.env.AUTH_SECRET) return null;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as SessionUser["role"],
      buyerOrgId: payload.buyerOrgId ? String(payload.buyerOrgId) : null,
      supplierOrgId: payload.supplierOrgId ? String(payload.supplierOrgId) : null,
    };
  } catch {
    return null;
  }
}

export async function requireUser(role?: UserRole) {
  const session = await getSession();
  if (!session) return null;
  if (role && session.role !== role) return null;
  return session;
}

export async function recordLogin(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

export function homeForRole(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "supplier") return "/seller";
  return "/buyer";
}

export function safeNextPath(next: string | null | undefined) {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return null;
  }
  return next;
}

export async function establishSession(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  buyerOrgId: string | null;
  supplierOrgId: string | null;
  active: boolean;
}): Promise<{ error: string; href?: undefined } | { error: null; href: string }> {
  if (!user.active) return { error: "This account is disabled." };
  await recordLogin(user.id);
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    buyerOrgId: user.buyerOrgId,
    supplierOrgId: user.supplierOrgId,
  });
  return { error: null, href: homeForRole(user.role) };
}
