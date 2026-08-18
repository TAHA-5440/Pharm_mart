import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
  matcher: ["/buyer/:path*", "/seller/:path*", "/admin/:path*", "/rfq/:path*"],
};
