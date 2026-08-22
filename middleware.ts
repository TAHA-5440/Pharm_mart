import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { apexOrigin, tenantSlugFromHost } from "@/lib/site";

function toApex(request: NextRequest) {
  const dest = new URL(apexOrigin());
  dest.pathname = request.nextUrl.pathname;
  dest.search = request.nextUrl.search;
  return dest;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const slug = tenantSlugFromHost(request.headers.get("host") ?? request.nextUrl.host);

  if (slug) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = `/suppliers/${slug}`;
      return NextResponse.rewrite(url);
    }
    if (pathname === `/suppliers/${slug}`) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    const dest = toApex(request);
    return NextResponse.redirect(dest);
  }

  const token = request.cookies.get("pharmstore_session")?.value;
  let role: string | null = null;
  if (token && process.env.AUTH_SECRET) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.AUTH_SECRET),
      );
      role = String(payload.role ?? "");
    } catch {
      role = null;
    }
  }

  const need = (r: string) => {
    if (role === r) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  };

  if (pathname.startsWith("/buyer")) return need("buyer");
  if (pathname.startsWith("/seller")) return need("supplier");
  if (pathname.startsWith("/admin")) return need("admin");
  if (pathname.startsWith("/rfq") && !role) return need("buyer");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.png|brand/|images/|icons/|mock-uploads/|sw.js).*)"],
};
