import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPkr(amount: number | null | undefined, onRequest = false) {
  if (onRequest || amount == null) return "On request";
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

export function formatWhen(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return slug || "item";
}

export const INDUSTRY_LABEL: Record<string, string> = {
  pharmaceutical: "Pharmaceutical",
  food_beverage: "Food & Beverage",
  other: "Other",
};

export const VERIFICATION_LABEL: Record<string, string> = {
  registered: "REGISTERED",
  business_verified: "BUSINESS VERIFIED",
  verified_supplier: "VERIFIED SUPPLIER",
  industry_verified: "INDUSTRY VERIFIED",
  premium_verified: "PREMIUM VERIFIED",
  certified_seller: "CERTIFIED SELLER",
};

export const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Gujranwala",
  "Sialkot",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Other",
] as const;

export const SERVICE_OPTIONS = [
  "Manufacturing",
  "Dealer",
  "Installation",
  "Maintenance",
  "Validation/Calibration",
  "Automation",
  "Fabrication",
  "Trading (used)",
] as const;
