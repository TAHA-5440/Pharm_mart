"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileUp } from "lucide-react";
import { registerAction } from "@/app/actions";
import { AuthDivider, GoogleLink } from "@/components/google-button";
import { CITIES, cn } from "@/lib/utils";
import {
  formatCnic,
  validateProofFile,
  validateRegisterOrg,
  type FieldErrors,
} from "@/lib/register-rules";

const field =
  "mt-1 h-9 w-full rounded-xl border border-rule bg-paper px-3 text-sm text-ink outline-none transition placeholder:text-ink/40 hover:border-mark/40 focus:border-mark focus:bg-sheet focus:ring-4 focus:ring-mark/15";
const fieldErr = "border-stop focus:border-stop focus:ring-stop/15";
const ease = [0.2, 0.8, 0.2, 1] as const;

function Star() {
  return (
    <span className="ml-0.5 font-semibold text-stop" aria-hidden>
      *
    </span>
  );
}

function Optional() {
  return <span className="ml-1 text-xs font-normal text-ink-soft">(optional)</span>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-stop">{children}</p>;
}

export function RegisterDesk({
  google,
  next,
  showGoogle,
  initialRole = "buyer",
}: {
  google?: { email: string; name: string } | null;
  next?: string;
  showGoogle?: boolean;
  initialRole?: "buyer" | "supplier";
}) {
  const role = initialRole;
  const supplierFields = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [plantName, setPlantName] = useState<string | null>(null);
  const [plantPreview, setPlantPreview] = useState<string | null>(null);
  const [proofName, setProofName] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    return () => {
      if (plantPreview) URL.revokeObjectURL(plantPreview);
    };
  }, [plantPreview]);

  function onPlant(file: File | undefined) {
    if (!file) {
      setPlantName(null);
      setPlantPreview(null);
      return;
    }
    setPlantName(file.name);
    setPlantPreview(URL.createObjectURL(file));
  }

  return (
    <form
      className="relative flex flex-1 flex-col"
      noValidate
      action={async (fd) => {
        fd.set("role", role);
        setPending(true);
        setError(null);
        setFieldErrors({});

        const proof = fd.get("businessProof");
        const proofFile = proof && typeof proof !== "string" ? proof : null;
        const checked = validateRegisterOrg(
          {
            name: String(fd.get("name") ?? ""),
            email: google?.email ?? String(fd.get("email") ?? ""),
            phone: String(fd.get("phone") ?? ""),
            password: google ? undefined : String(fd.get("password") ?? "") || undefined,
            role,
            company: String(fd.get("company") ?? ""),
            city: String(fd.get("city") ?? ""),
            industry: String(fd.get("industry") ?? "") as
              | "pharmaceutical"
              | "food_beverage"
              | "other",
            address: String(fd.get("address") ?? ""),
            ntn: String(fd.get("ntn") ?? ""),
            cnic: String(fd.get("cnic") ?? ""),
          },
          { google: Boolean(google) },
        );
        if (!checked.data) {
          setPending(false);
          setError(checked.error ?? "Please check the highlighted fields.");
          setFieldErrors(checked.fields ?? {});
          return;
        }
        if (role === "supplier") {
          const proofError = validateProofFile(proofFile);
          if (proofError) {
            setPending(false);
            setError(proofError);
            setFieldErrors({ businessProof: proofError });
            return;
          }
        }

        const res = await registerAction(fd);
        setPending(false);
        if (res?.error) {
          setError(res.error);
          setFieldErrors(res.fields ?? {});
        }
      }}
    >
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {google ? <input type="hidden" name="googleFinish" value="1" /> : null}
      <input type="hidden" name="role" value={role} />
      <input
        id="plant-photo"
        name="plantPhoto"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => onPlant(e.target.files?.[0])}
      />
      <div className="grid overflow-hidden rounded-[1.75rem] md:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.35fr)]">
        <div className="relative hidden min-h-[28rem] overflow-hidden md:block md:min-h-[calc(100dvh-8rem)]">
          <motion.div
            className="absolute inset-0"
            animate={reduce ? undefined : { scale: role === "supplier" ? 1.06 : 1 }}
            transition={{ duration: 0.55, ease }}
          >
            {plantPreview ? (
              // blob: preview — next/image cannot optimize local object URLs
              // eslint-disable-next-line @next/next/no-img-element
              <img src={plantPreview} alt="Your plant" className="size-full object-cover" />
            ) : (
              <Image
                src="/images/hero.jpg"
                alt="Manufacturing plant"
                fill
                priority
                sizes="40vw"
                className="object-cover"
              />
            )}
          </motion.div>
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 top-0 p-5 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease }}
              >
                <p className="text-[11px] font-medium tracking-[0.18em] text-white/70 uppercase">
                  {role === "supplier" ? "Supplier profile" : "Buyer plant"}
                </p>
                <p className="mt-1 max-w-sm text-xl font-semibold text-white">
                  Show the floor, not a stock photo.
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <label htmlFor="plant-photo" className="absolute inset-x-4 bottom-4 cursor-pointer md:inset-x-5 md:bottom-5">
            <span className="glass-ink flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-white">
              <span>
                <span className="block text-sm font-medium">
                  {plantName ? "Change plant photo" : "Upload plant photo"}
                </span>
                <span className="mt-0.5 block text-xs text-white/75">
                  {plantName ?? "JPG, PNG or WebP · optional"}
                </span>
              </span>
              <span className="glass-pill shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-ink">
                Choose
              </span>
            </span>
          </label>
        </div>

        <div className="relative z-10 flex flex-col bg-sheet/80">
        <div className="glass flex flex-1 flex-col p-4 md:p-5 lg:px-7 lg:py-4">
          <div className="pb-3">
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                {google
                  ? "Finish your organisation"
                  : role === "supplier"
                    ? "Create a supplier account"
                    : "Create a buyer account"}
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                {google
                  ? `Linked to ${google.email}. Add the company that will post or quote.`
                  : role === "supplier"
                    ? "Suppliers are reviewed before they receive RFQs. Buyers stay free."
                    : "Buyers stay free. Suppliers are reviewed before they receive RFQs."}{" "}
                <span className="text-stop">*</span>{" "}
                {google
                  ? "Only your name and company are required."
                  : "Only name, company, email, and a password are required."}
              </p>

              <p className="mt-3 text-sm font-medium text-ink">
                Account type
                <Star />
              </p>
              <div
                className="mt-2 grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-label="Account type"
              >
                {(
                  [
                    ["buyer", "Buyer", "Post RFQs"],
                    ["supplier", "Supplier", "Send quotes"],
                  ] as const
                ).map(([value, label, hint]) => {
                  const on = role === value;
                  const q = new URLSearchParams();
                  q.set("role", value);
                  if (next) q.set("next", next);
                  if (google) q.set("google", "1");
                  return (
                    <Link
                      key={value}
                      href={`/register?${q.toString()}`}
                      role="radio"
                      aria-checked={on}
                      scroll
                      className={cn(
                        "overflow-hidden rounded-2xl border px-4 py-2.5 text-left transition-colors duration-200",
                        on
                          ? "border-mark bg-mark text-white"
                          : "border-rule bg-white text-ink hover:border-mark/40",
                      )}
                    >
                      <span className="block text-sm font-semibold">{label}</span>
                      <span className={cn("mt-0.5 block text-xs", on ? "text-white/80" : "text-ink-soft")}>
                        {hint}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                {role === "supplier"
                  ? "You'll send quotes on matched RFQs. Extra company details appear below."
                  : "You'll post RFQs and compare quotations. Switch to Supplier to quote instead."}
              </p>

              {showGoogle ? (
                <div className="mt-3 space-y-2">
                  <GoogleLink next={next} />
                  <AuthDivider />
                </div>
              ) : null}

              {error ? <p className="mt-2 text-sm text-stop">{error}</p> : null}

              <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink">
                  Your name
                  <Star />
                  <input
                    name="name"
                    required
                    minLength={2}
                    defaultValue={google?.name ?? ""}
                    className={cn(field, fieldErrors.name && fieldErr)}
                  />
                  {fieldErrors.name ? <Hint>{fieldErrors.name}</Hint> : null}
                </label>
                <label className="block text-sm font-medium text-ink">
                  Company
                  <Star />
                  <input
                    name="company"
                    required
                    minLength={2}
                    placeholder="Plant or company name"
                    className={cn(field, fieldErrors.company && fieldErr)}
                  />
                  {fieldErrors.company ? <Hint>{fieldErrors.company}</Hint> : null}
                </label>
                <label className="block text-sm font-medium text-ink">
                  Email
                  <Star />
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={google?.email ?? ""}
                    readOnly={Boolean(google)}
                    className={cn(field, "read-only:bg-sage", fieldErrors.email && fieldErr)}
                  />
                  {fieldErrors.email ? <Hint>{fieldErrors.email}</Hint> : null}
                </label>
                <label className="block text-sm font-medium text-ink">
                  Phone
                  <Optional />
                  <input
                    name="phone"
                    inputMode="tel"
                    placeholder="03XXXXXXXXX"
                    className={cn(field, fieldErrors.phone && fieldErr)}
                  />
                  {fieldErrors.phone ? <Hint>{fieldErrors.phone}</Hint> : null}
                </label>
                <label className="block text-sm font-medium text-ink">
                  City
                  <Optional />
                  <select name="city" className={cn(field, fieldErrors.city && fieldErr)}>
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  {fieldErrors.city ? <Hint>{fieldErrors.city}</Hint> : null}
                </label>
                <label className="block text-sm font-medium text-ink">
                  Industry
                  <Optional />
                  <select name="industry" className={cn(field, fieldErrors.industry && fieldErr)}>
                    <option value="pharmaceutical">Pharmaceutical</option>
                    <option value="food_beverage">Food & Beverage</option>
                    <option value="other">Other</option>
                  </select>
                  {fieldErrors.industry ? <Hint>{fieldErrors.industry}</Hint> : null}
                </label>
                {google ? null : (
                  <label className="block text-sm font-medium text-ink sm:col-span-2">
                    Password (8+ characters)
                    <Star />
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      className={cn(field, fieldErrors.password && fieldErr)}
                    />
                    {fieldErrors.password ? <Hint>{fieldErrors.password}</Hint> : null}
                  </label>
                )}
              </div>

              <label htmlFor="plant-photo" className="mt-2 flex cursor-pointer items-center gap-3 md:hidden">
                <span className="glass flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-sm">
                  {plantName ?? "Upload plant photo (optional)"}
                  <span className="shrink-0 rounded-full bg-mark px-3 py-1 text-xs font-medium text-white">
                    Choose
                  </span>
                </span>
              </label>

              {role === "supplier" ? (
                <div ref={supplierFields} className="mt-3">
                  <div className="glass grid grid-cols-1 gap-x-4 gap-y-2 rounded-2xl p-2.5 sm:grid-cols-2">
                    <p className="text-sm font-medium text-ink sm:col-span-2">
                      Supplier details
                    </p>
                    <p className="text-xs text-ink-soft sm:col-span-2">
                      Verification can wait — add NTN and proof later from the seller desk.
                    </p>
                    <label className="block text-sm font-medium text-ink sm:col-span-2">
                      Business address
                      <Optional />
                      <input
                        name="address"
                        placeholder="Street, area, city"
                        className={cn(field, fieldErrors.address && fieldErr)}
                      />
                      {fieldErrors.address ? <Hint>{fieldErrors.address}</Hint> : null}
                    </label>
                    <label className="block text-sm font-medium text-ink">
                      NTN
                      <Optional />
                      <input
                        name="ntn"
                        inputMode="numeric"
                        placeholder="1234567"
                        className={cn(field, fieldErrors.ntn && fieldErr)}
                      />
                      {fieldErrors.ntn ? <Hint>{fieldErrors.ntn}</Hint> : null}
                    </label>
                    <label className="block text-sm font-medium text-ink">
                      CNIC
                      <Optional />
                      <input
                        name="cnic"
                        inputMode="numeric"
                        placeholder="35202-1234567-1"
                        className={cn(field, fieldErrors.cnic && fieldErr)}
                        onChange={(e) => {
                          e.target.value = formatCnic(e.target.value);
                        }}
                      />
                      {fieldErrors.cnic ? <Hint>{fieldErrors.cnic}</Hint> : null}
                    </label>
                    <label className="block text-sm font-medium text-ink sm:col-span-2">
                      Business proof
                      <Optional />
                      <span
                        className={cn(
                          "mt-1 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-rule bg-paper px-3 py-2 transition hover:border-mark hover:bg-sage",
                          fieldErrors.businessProof && "border-stop",
                        )}
                      >
                        <input
                          name="businessProof"
                          type="file"
                          accept="image/*,.pdf"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setProofName(file?.name ?? null);
                            const proofError = validateProofFile(file);
                            setFieldErrors((prev) => ({
                              ...prev,
                              businessProof: proofError ?? undefined,
                            }));
                          }}
                        />
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mark text-white">
                          <FileUp className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {proofName ?? "Letterhead, card, or utility bill"}
                          </span>
                          <span className="block text-xs text-ink-soft">
                            {proofName ? "Click to replace · PDF or image" : "PDF or image"}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-mark px-3 py-1.5 text-xs font-semibold text-white">
                          {proofName ? "Replace" : "Browse"}
                        </span>
                      </span>
                      {fieldErrors.businessProof ? <Hint>{fieldErrors.businessProof}</Hint> : null}
                    </label>
                  </div>
                </div>
              ) : null}
            </div>

          <div className="mt-2 flex shrink-0 flex-wrap items-center gap-4 border-t border-white/50 pt-3">
            <motion.button
              type="submit"
              whileHover={reduce ? undefined : { y: -1 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="min-h-11 rounded-full bg-mark px-7 text-sm font-semibold text-white hover:bg-steel"
            >
              {pending ? "Saving…" : google ? "Finish registration" : "Create account"}
            </motion.button>
            <p className="text-sm text-ink-soft">
              Already registered?{" "}
              <Link href="/login" className="font-medium text-steel">
                Log in
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </form>
  );
}
