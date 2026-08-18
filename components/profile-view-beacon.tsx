"use client";

import { useEffect } from "react";
import { recordSupplierProfileViewAction } from "@/lib/record-profile-view";

/** Counts a real visit after mount so Link prefetch does not inflate views. */
export function ProfileViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `px-profile-view:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void recordSupplierProfileViewAction(slug);
  }, [slug]);

  return null;
}
