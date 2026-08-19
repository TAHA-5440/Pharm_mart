"use client";

import { forwardRef, useEffect } from "react";
import { recordClientEventAction } from "@/lib/analytics-actions";
import { recordSupplierProfileViewAction } from "@/lib/record-profile-view";
import type { ClientAnalyticsEventName } from "@/lib/analytics-events";

function once(key: string, run: () => void) {
  if (typeof sessionStorage === "undefined") return;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  run();
}

function umamiTrack(name: string, payload: Record<string, unknown>) {
  const umami = (window as Window & { umami?: { track: (n: string, d?: object) => void } }).umami;
  umami?.track(name, payload);
}

/** Real visit only — Link prefetch must not count. */
export function ProfileViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    once(`px-profile-view:${slug}`, () => {
      void recordSupplierProfileViewAction(slug);
      umamiTrack("profile_view", { slug });
    });
  }, [slug]);
  return null;
}

export function ListingViewBeacon({
  kind,
  listingId,
  slug,
  supplierId,
}: {
  kind: "product" | "machine";
  listingId: string;
  slug: string;
  supplierId: string;
}) {
  useEffect(() => {
    const payload = { kind, listingId, slug, supplierId };
    once(`px-listing-view:${kind}:${listingId}`, () => {
      void recordClientEventAction("listing_view", payload);
      umamiTrack("listing_view", payload);
    });
  }, [kind, listingId, slug, supplierId]);
  return null;
}

export function SearchQueryBeacon({
  q,
  type,
  category,
  city,
  results,
}: {
  q: string;
  type: string;
  category?: string;
  city?: string;
  results: number;
}) {
  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    const payload = { q: query, type, category: category ?? null, city: city ?? null, results };
    once(`px-search:${JSON.stringify(payload)}`, () => {
      void recordClientEventAction("search_query", payload);
      umamiTrack("search_query", payload);
    });
  }, [q, type, category, city, results]);
  return null;
}

export const TrackedCallLink = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    supplierId: string;
    className?: string;
    children: React.ReactNode;
  }
>(function TrackedCallLink({ href, supplierId, className, children, ...rest }, ref) {
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      {...rest}
      onClick={() => {
        const payload = { supplierId };
        void recordClientEventAction("call_click", payload);
        umamiTrack("call_click", payload);
      }}
    >
      {children}
    </a>
  );
});

export const TrackedDownloadLink = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    event: Extract<ClientAnalyticsEventName, "catalogue_download">;
    payload: Record<string, unknown>;
    className?: string;
    children: React.ReactNode;
  }
>(function TrackedDownloadLink({ href, event, payload, className, children, ...rest }, ref) {
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noreferrer" } : { download: true })}
      {...rest}
      onClick={() => {
        void recordClientEventAction(event, payload);
        umamiTrack(event, payload);
      }}
    >
      {children}
    </a>
  );
});
