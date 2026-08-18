import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPkr(amount: number | null | undefined, onRequest = false) {
  if (onRequest || amount == null) return "On request";
  return `Rs ${amount.toLocaleString("en-PK")}`;
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
