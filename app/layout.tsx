import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { UmamiScript } from "@/components/umami-script";
import { PwaRegister } from "@/components/pwa-register";
import { getSession } from "@/lib/auth";
import { apexOrigin, tenantSlugFromHost } from "@/lib/site";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f4c3a",
};

export const metadata: Metadata = {
  title: {
    default: "ProcureX — Pakistan’s industrial procurement network",
    template: "%s · ProcureX",
  },
  description:
    "Find verified industrial suppliers. Request quotations. Buy equipment. Sell machinery. Pakistan-first B2B marketplace for pharma and food manufacturing.",
  applicationName: "ProcureX",
  appleWebApp: {
    capable: true,
    title: "ProcureX",
    statusBarStyle: "black-translucent",
  },
  icons: {
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
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
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
