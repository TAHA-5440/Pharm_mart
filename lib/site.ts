/** Edge-safe site host helpers. No Node APIs. */

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "mail",
  "ftp",
  "cdn",
  "assets",
  "static",
  "login",
  "register",
  "marketplace",
  "seller",
  "buyer",
  "docs",
  "status",
  "blog",
  "help",
  "support",
  "auth",
  "staging",
  "dev",
  "preview",
]);

export function parseAppHost(raw?: string) {
  const fallback =
    raw ||
    process.env.APP_HOST ||
    process.env.AUTH_URL ||
    "http://localhost:3000";
  const withProto = fallback.includes("://") ? fallback : `http://${fallback}`;
  try {
    const url = new URL(withProto);
    return {
      hostname: url.hostname,
      port: url.port,
      protocol: url.protocol.replace(":", "") || "http",
    };
  } catch {
    return { hostname: "localhost", port: "3000", protocol: "http" };
  }
}

export function apexOrigin() {
  const { hostname, port, protocol } = parseAppHost();
  const portPart = port && port !== "80" && port !== "443" ? `:${port}` : "";
  return `${protocol}://${hostname}${portPart}`;
}

export function tenantSlugFromHost(hostHeader: string | null | undefined) {
  if (!hostHeader) return null;
  const host = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  const { hostname: apex } = parseAppHost();
  if (!host || !apex || host === apex || host === `www.${apex}`) return null;
  const suffix = `.${apex}`;
  if (!host.endsWith(suffix)) return null;
  const slug = host.slice(0, -suffix.length);
  if (!slug || slug.includes(".") || RESERVED_SUBDOMAINS.has(slug)) return null;
  return slug;
}

export function isPublicSuffixHost(hostname: string) {
  return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
}

export function supplierSubdomainsEnabled() {
  const { hostname } = parseAppHost();
  if (isPublicSuffixHost(hostname)) return false;
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return true;
  return process.env.SUPPLIER_SUBDOMAINS === "1";
}

export function supplierVanityOrigin(slug: string) {
  if (!supplierSubdomainsEnabled() || RESERVED_SUBDOMAINS.has(slug)) return null;
  const { hostname, port, protocol } = parseAppHost();
  const portPart = port && port !== "80" && port !== "443" ? `:${port}` : "";
  return `${protocol}://${slug}.${hostname}${portPart}`;
}

export function supplierPath(slug: string) {
  return `/suppliers/${slug}`;
}

/** In-app href: vanity host when enabled, otherwise the path. */
export function supplierHref(slug: string) {
  const vanity = supplierVanityOrigin(slug);
  return vanity ? `${vanity}/` : supplierPath(slug);
}

export function supplierCanonicalUrl(slug: string) {
  return `${apexOrigin()}${supplierPath(slug)}`;
}

export function sessionCookieDomain() {
  const explicit = process.env.COOKIE_DOMAIN?.trim();
  if (explicit) {
    const host = explicit.replace(/^\./, "");
    if (isPublicSuffixHost(host) || host === "vercel.app") return undefined;
    return explicit.startsWith(".") ? explicit : `.${explicit}`;
  }
  const { hostname } = parseAppHost();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return ".localhost";
  return undefined;
}

export function uniqueSupplierSlug(base: string) {
  const cleaned =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "supplier";
  const core = RESERVED_SUBDOMAINS.has(cleaned) ? `co-${cleaned}` : cleaned;
  return `${core}-${Math.random().toString(36).slice(2, 6)}`;
}
