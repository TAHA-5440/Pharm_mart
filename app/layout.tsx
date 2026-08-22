import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { UmamiScript } from "@/components/umami-script";
import { PwaRegister } from "@/components/pwa-register";
import { getSession } from "@/lib/auth";
import { apexOrigin, tenantSlugFromHost } from "@/lib/site";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08172F",
};

export const metadata: Metadata = {
  title: {
    default: "ProcureX — Where Industry Connects",
    template: "%s · ProcureX",
  },
  description:
    "Where Industry Connects. Discover verified industrial suppliers, post one RFQ, and compare quotations. Pakistan-first B2B marketplace for pharma and food manufacturing.",
  applicationName: "ProcureX",
  appleWebApp: {
    capable: true,
    title: "ProcureX",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/procurex-x-mark.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  const host = (await headers()).get("host");
  const onTenant = Boolean(tenantSlugFromHost(host));

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ThemeProvider>
          <SiteHeader session={session} apexOrigin={onTenant ? apexOrigin() : undefined} />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          {onTenant ? null : <SiteFooter />}
          <UmamiScript />
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
