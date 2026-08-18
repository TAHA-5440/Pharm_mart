import { z } from "zod";

export function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function isPkMobile(value: string) {
  const n = digits(value);
  if (n.length === 11 && n.startsWith("03")) return true;
  if (n.length === 12 && n.startsWith("923")) return true;
  if (n.length === 10 && n.startsWith("3")) return true;
  return false;
}

export function normalizePkMobile(value: string) {
  let n = digits(value);
  if (n.startsWith("92") && n.length >= 12) n = `0${n.slice(2)}`;
  else if (n.length === 10 && n.startsWith("3")) n = `0${n}`;
  return n;
}

export function isNtn(value: string) {
  const n = digits(value);
  return n.length === 7 || n.length === 13;
}

export function isCnic(value: string) {
  return digits(value).length === 13;
}

export function formatCnic(value: string) {
  const n = digits(value).slice(0, 13);
  if (n.length <= 5) return n;
  if (n.length <= 12) return `${n.slice(0, 5)}-${n.slice(5)}`;
  return `${n.slice(0, 5)}-${n.slice(5, 12)}-${n.slice(12)}`;
}

const name = z
  .string()
  .trim()
  .min(2, "Enter your full name.")
  .max(80, "Name is too long.")
  .refine((v) => /[a-zA-Z\u0600-\u06FF]/.test(v), "Name must include letters.");

const company = z
  .string()
  .trim()
  .min(2, "Enter the company or plant name.")
  .max(120, "Company name is too long.");

const phone = z.string().trim();

export const registerOrgSchema = z.object({
  name,
  email: z.string().email("Enter a valid email."),
  phone,
  password: z.string().min(8, "Password must be 8+ characters.").optional(),
  role: z.enum(["buyer", "supplier"]),
  company,
  city: z.string(),
  industry: z.string(),
  address: z.string().optional(),
  ntn: z.string().optional(),
  cnic: z.string().optional(),
});

export type RegisterOrgInput = z.infer<typeof registerOrgSchema>;
export type FieldErrors = Partial<Record<string, string>>;

export function firstZodError(error: z.ZodError): { error: string; fields: FieldErrors } {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fields[key]) fields[key] = issue.message;
  }
  const errorMessage = error.issues[0]?.message ?? "Please check the highlighted fields.";
  return { error: errorMessage, fields };
}

export function validateRegisterOrg(
  raw: RegisterOrgInput,
  opts: { google: boolean },
): { data?: RegisterOrgInput; error?: string; fields?: FieldErrors } {
  const parsed = registerOrgSchema.safeParse(raw);
  if (!parsed.success) return firstZodError(parsed.error);
  const data = parsed.data;

  if (!opts.google && !data.password) {
    return { error: "Password must be 8+ characters.", fields: { password: "Password must be 8+ characters." } };
  }

  const fields: FieldErrors = {};
  if (data.phone && !isPkMobile(data.phone)) {
    fields.phone = "Enter a Pakistani mobile like 03XXXXXXXXX, or leave blank.";
  }

  const industry =
    data.industry === "food_beverage" || data.industry === "other"
      ? data.industry
      : "pharmaceutical";
  const city = data.city.trim() || "Lahore";

  if (data.role === "supplier") {
    const address = (data.address ?? "").trim();
    const ntn = data.ntn ?? "";
    const cnic = data.cnic ?? "";
    if (address && address.length < 10) {
      fields.address = "Address is too short, or leave it blank for now.";
    }
    if (ntn.trim() && !isNtn(ntn)) {
      fields.ntn = "NTN must be 7 or 13 digits, or leave blank.";
    }
    if (cnic.trim() && !isCnic(cnic)) {
      fields.cnic = "CNIC must be 13 digits, or leave blank.";
    }
  }

  if (Object.keys(fields).length) {
    return { error: Object.values(fields)[0], fields };
  }

  return {
    data: {
      ...data,
      city,
      industry,
      phone: data.phone ? normalizePkMobile(data.phone) : "",
      ntn: data.ntn?.trim() ? digits(data.ntn) : "",
      cnic: data.cnic?.trim() ? digits(data.cnic) : "",
    },
  };
}

export function validateProofFile(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  const okType =
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    /\.(pdf|jpe?g|png|webp)$/i.test(file.name);
  if (!okType) return "Business proof must be a PDF or image.";
  if (file.size > 8 * 1024 * 1024) return "Business proof must be under 8 MB.";
  return null;
}
