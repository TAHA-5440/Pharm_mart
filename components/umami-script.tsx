import Script from "next/script";

export function UmamiScript() {
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  if (!id) return null;
  const src = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim() || "https://cloud.umami.is/script.js";
  return <Script src={src} data-website-id={id} strategy="afterInteractive" />;
}
