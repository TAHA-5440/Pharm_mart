"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  clearSession,
  hashPassword,
  afterLoginPath,
  recordLogin,
  safeNextPath,
  verifyPassword,
} from "@/lib/auth";
import { matchSuppliersForRfq } from "@/lib/matching";
import { notifyUser } from "@/lib/notify";
import { trackEvent } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { clearGooglePending, getGooglePending } from "@/lib/google";
import { uniqueSupplierSlug } from "@/lib/site";
import { digits, isCnic, isNtn, isPkMobile, normalizePkMobile, validateProofFile, validateRegisterOrg } from "@/lib/register-rules";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function saveMockUpload(file: File, kind = "file") {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public", "mock-uploads");
  await mkdir(uploadDir, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_ ]/g, "_");
  const ext = path.extname(safeName).slice(0, 8) || "";
  const unique = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(uploadDir, unique);
  await writeFile(filePath, buffer);
  return `/mock-uploads/${unique}`;
}

async function savePlantPhoto(formData: FormData) {
  const plant = formData.get("plantPhoto");
  if (!plant || typeof plant === "string" || plant.size === 0) return null;
  if (!plant.type.startsWith("image/")) {
    return { error: "Plant photo must be a JPG, PNG, or WebP image." as const };
  }
  if (plant.size > 8 * 1024 * 1024) {
    return { error: "Plant photo must be under 8 MB." as const };
  }
  return { url: await saveMockUpload(plant, "plant") };
}

export async function registerAction(formData: FormData) {
  const google = await getGooglePending();
  if (String(formData.get("googleFinish") ?? "") === "1" && !google) {
    return {
      error: "Google sign-in expired. Continue with Google again.",
      fields: { form: "Google sign-in expired. Continue with Google again." },
    };
  }

  const checked = validateRegisterOrg(
    {
      name: String(formData.get("name") ?? ""),
      email: google?.email ?? String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      password: google ? undefined : String(formData.get("password") ?? "") || undefined,
      role: String(formData.get("role") ?? "") as "buyer" | "supplier",
      company: String(formData.get("company") ?? ""),
      city: String(formData.get("city") ?? ""),
      industry: String(formData.get("industry") ?? "") as "pharmaceutical" | "food_beverage" | "other",
      address: String(formData.get("address") ?? ""),
      ntn: String(formData.get("ntn") ?? ""),
      cnic: String(formData.get("cnic") ?? ""),
    },
    { google: Boolean(google) },
  );
  if (!checked.data) {
    return { error: checked.error ?? "Please check the highlighted fields.", fields: checked.fields ?? {} };
  }
  const data = checked.data;

  if (data.role === "supplier") {
    const proof = formData.get("businessProof");
    const proofFile = proof && typeof proof !== "string" ? proof : null;
    const proofError = validateProofFile(proofFile);
    if (proofError) return { error: proofError, fields: { businessProof: proofError } };
  }

  const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (exists) return { error: "An account with this email already exists.", fields: { email: "An account with this email already exists." } };

  const passwordHash = google ? null : await hashPassword(data.password!);
  const plant = await savePlantPhoto(formData);
  if (plant && "error" in plant) {
    return { error: plant.error, fields: { plantPhoto: plant.error } };
  }
  const coverUrl = plant && "url" in plant ? plant.url : undefined;

  if (data.role === "buyer") {
    const org = await prisma.buyerOrganisation.create({
      data: {
        legalName: data.company,
        industry: (data.industry as "pharmaceutical" | "food_beverage" | "other") || "pharmaceutical",
        city: data.city || "Lahore",
      },
    });
    if (coverUrl) {
      await prisma.$executeRaw`
        UPDATE "BuyerOrganisation" SET "coverUrl" = ${coverUrl} WHERE id = ${org.id}
      `;
    }
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        googleId: google?.googleId,
        name: data.name,
        phone: data.phone || null,
        role: "buyer",
        buyerOrgId: org.id,
      },
    });
    if (google) await clearGooglePending();
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: "buyer",
      buyerOrgId: org.id,
      supplierOrgId: null,
    });
    redirect(afterLoginPath("buyer", String(formData.get("next") ?? "")));
  }

  const businessProofFile = formData.get("businessProof");
  const businessProofUrl =
    businessProofFile && typeof businessProofFile !== "string" && businessProofFile.size > 0
      ? await saveMockUpload(businessProofFile, "proof")
      : "";

  const uniqueSlug = uniqueSupplierSlug(data.company);
  const org = await prisma.supplierOrganisation.create({
    data: {
      legalName: data.company,
      displayName: data.company,
      slug: uniqueSlug,
      about: `${data.company} supplies industrial equipment and services in ${data.city}.`,
      city: data.city,
      address: data.address?.trim() || null,
      ntn: data.ntn || null,
      cnic: data.cnic || null,
      businessProofUrl: businessProofUrl || null,
      coverUrl,
      phone: data.phone || "",
      email: data.email.toLowerCase(),
      industries: data.industry || "pharmaceutical",
      publicStatus: "pending_review",
    },
  });
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      googleId: google?.googleId,
      name: data.name,
      phone: data.phone || null,
      role: "supplier",
      supplierOrgId: org.id,
    },
  });
  if (google) await clearGooglePending();
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: "supplier",
    buyerOrgId: null,
    supplierOrgId: org.id,
  });
  redirect("/seller");
}

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));
  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return { error: "Can't reach the database. Try again in a moment." };
  }
  if (!user) return { error: "Email or password is incorrect." };
  if (!user.passwordHash) {
    return { error: "This account uses Google. Continue with Google to log in." };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }
  if (!user.active) return { error: "This account is disabled." };
  await recordLogin(user.id);
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    buyerOrgId: user.buyerOrgId,
    supplierOrgId: user.supplierOrgId,
  });
  redirect(afterLoginPath(user.role, next));
}

export async function logoutAction(formData?: FormData) {
  await clearSession();
  const next = formData instanceof FormData ? safeNextPath(String(formData.get("next") ?? "")) : null;
  redirect(next ?? "/");
}

export async function createRfqAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/rfq/new");
  if (session.role !== "buyer") redirect("/rfq/new");
  if (!session.buyerOrgId) redirect("/rfq/new?error=org");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const neededBy = String(formData.get("neededBy") ?? "30 days").trim();
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const singleSupplierId = String(formData.get("singleSupplierId") ?? "") || null;
  const machineId = String(formData.get("machineId") ?? "") || null;
  if (title.length < 4 || description.length < 20 || !quantity || !city) {
    redirect("/rfq/new?error=incomplete");
  }
  const closing = new Date();
  closing.setDate(closing.getDate() + 14);
  const buyerOrg = await prisma.buyerOrganisation.findUnique({
    where: { id: session.buyerOrgId },
    select: { industry: true },
  });
  let rfq;
  try {
    rfq = await prisma.rfq.create({
      data: {
        buyerOrgId: session.buyerOrgId,
        buyerUserId: session.id,
        title,
        description,
        quantity,
        city,
        neededBy,
        categoryId,
        singleSupplierId,
        machineId,
        industry: buyerOrg?.industry ?? "pharmaceutical",
        installation: formData.get("installation") === "on",
        usedAllowed: formData.get("usedAllowed") === "on",
        status: "submitted",
        closingAt: closing,
      },
    });
  } catch {
    redirect("/rfq/new?error=save");
  }
  await notifyUser({
    userId: session.id,
    type: "rfq_submitted",
    title: "RFQ submitted",
    body: "We’ll review and notify matching suppliers.",
    href: `/buyer/rfqs/${rfq.id}`,
  });
  await trackEvent(
    "rfq_submit",
    {
      rfqId: rfq.id,
      city,
      categoryId,
      singleSupplierId,
      industry: rfq.industry,
    },
    session.id,
  );
  redirect(`/buyer/rfqs/${rfq.id}`);
}

export async function openRfqAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const rfqId = String(formData.get("rfqId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const industryRaw = String(formData.get("industry") ?? "");
  const industry =
    industryRaw === "pharmaceutical" || industryRaw === "food_beverage" || industryRaw === "other"
      ? industryRaw
      : null;

  const existing = await prisma.rfq.findUnique({ where: { id: rfqId } });
  if (!existing || !["submitted", "under_review"].includes(existing.status)) {
    redirect("/admin");
  }

  if (categoryId) {
    const type = await prisma.category.findFirst({
      where: { id: categoryId, active: true },
    });
    if (!type) redirect("/admin?error=type");
  }

  await prisma.rfq.update({
    where: { id: rfqId },
    data: {
      categoryId,
      ...(industry ? { industry } : {}),
    },
  });

  const matchedIds = await matchSuppliersForRfq(rfqId);
  const rfq = await prisma.rfq.update({
    where: { id: rfqId },
    data: { status: "open", qualified: true },
    include: { matches: { include: { supplier: { include: { users: true } } } } },
  });
  for (const match of rfq.matches) {
    for (const user of match.supplier.users) {
      await notifyUser({
        userId: user.id,
        type: "rfq_open",
        title: "New RFQ",
        body: `${rfq.title} · ${rfq.city}`,
        href: "/seller/rfqs",
      });
    }
  }
  await notifyUser({
    userId: rfq.buyerUserId,
    type: "rfq_open",
    title: "RFQ is open",
    body: `${rfq.title} — ${matchedIds.length} supplier${matchedIds.length === 1 ? "" : "s"} can quote.`,
    href: `/buyer/rfqs/${rfq.id}`,
  });
  await trackEvent(
    "rfq_open",
    { rfqId: rfq.id, matchCount: matchedIds.length, categoryId, industry: rfq.industry },
    session.id,
  );
  for (const supplierId of matchedIds) {
    await trackEvent("rfq_match", { rfqId: rfq.id, supplierId }, session.id);
  }
  redirect(`/admin?opened=${matchedIds.length}`);
}

export async function rejectRfqAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const rfqId = String(formData.get("rfqId") ?? "");
  const rfq = await prisma.rfq.update({
    where: { id: rfqId },
    data: { status: "rejected" },
  });
  await notifyUser({
    userId: rfq.buyerUserId,
    type: "rfq_rejected",
    title: "RFQ not opened",
    body: "Ops declined this requirement. Suppliers were not notified.",
    href: `/buyer/rfqs/${rfq.id}`,
  });
  redirect("/admin");
}

export async function approveSupplierAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const id = String(formData.get("supplierId") ?? "");
  await prisma.$transaction([
    prisma.supplierOrganisation.update({
      where: { id },
      data: { publicStatus: "approved", verification: "business_verified" },
    }),
    prisma.productListing.updateMany({
      where: { supplierId: id, status: "pending_review" },
      data: { status: "live" },
    }),
    prisma.usedMachineListing.updateMany({
      where: { sellerId: id, status: "pending_review" },
      data: { status: "live" },
    }),
  ]);
  redirect("/admin");
}

export async function rejectSupplierAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const id = String(formData.get("supplierId") ?? "");
  const reason = String(formData.get("rejectionReason") ?? "").trim();
  await prisma.supplierOrganisation.update({
    where: { id },
    data: { publicStatus: "rejected", rejectionReason: reason },
  });
  redirect("/admin");
}

export async function submitQuoteAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }
  const rfqId = String(formData.get("rfqId") ?? "");
  const pricePkr = Number(formData.get("pricePkr"));
  const deliveryDays = Number(formData.get("deliveryDays"));
  const warranty = String(formData.get("warranty") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!rfqId || !pricePkr || !deliveryDays || !warranty) {
    redirect("/seller/rfqs?error=incomplete");
  }
  const rfq = await prisma.rfq.findUnique({
    where: { id: rfqId },
    include: { matches: true },
  });
  if (!rfq || rfq.status !== "open") redirect("/seller/rfqs?error=closed");
  const matched = rfq.matches.some((m) => m.supplierId === session.supplierOrgId);
  if (!matched) redirect("/seller/rfqs?error=notmatched");

  const existingQuote = await prisma.quotation.findUnique({
    where: { rfqId_supplierId: { rfqId, supplierId: session.supplierOrgId } },
    select: { id: true },
  });
  await prisma.quotation.upsert({
    where: {
      rfqId_supplierId: { rfqId, supplierId: session.supplierOrgId },
    },
    create: {
      rfqId,
      supplierId: session.supplierOrgId,
      userId: session.id,
      pricePkr,
      deliveryDays,
      warranty,
      notes,
      installation: formData.get("installation") === "on",
      status: "submitted",
    },
    update: {
      pricePkr,
      deliveryDays,
      warranty,
      notes,
      installation: formData.get("installation") === "on",
      status: "submitted",
    },
  });
  await notifyUser({
    userId: rfq.buyerUserId,
    type: "quote_submitted",
    title: "New quotation",
    body: `A supplier quoted on “${rfq.title}”.`,
    href: `/buyer/rfqs/${rfq.id}`,
  });
  await trackEvent(
    "quote_submit",
    { rfqId, supplierId: session.supplierOrgId, revised: Boolean(existingQuote), pricePkr },
    session.id,
  );
  redirect("/seller/quotes");
}

export async function updateBusinessDetailsAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }

  const existing = await prisma.supplierOrganisation.findUnique({
    where: { id: session.supplierOrgId },
    select: { businessProofUrl: true, publicStatus: true },
  });
  if (!existing) redirect("/login");

  const address = String(formData.get("address") ?? "").trim();
  const ntn = String(formData.get("ntn") ?? "").trim();
  const cnic = String(formData.get("cnic") ?? "").trim();
  const proofFile = formData.get("businessProof");
  const proofError = validateProofFile(proofFile && typeof proofFile !== "string" ? proofFile : null);
  if (proofError) redirect("/seller/documents?error=proof");
  const proof =
    proofFile && typeof proofFile !== "string" && proofFile.size > 0
      ? await saveMockUpload(proofFile, "proof")
      : existing.businessProofUrl || "";

  if (!address || address.length < 10 || !isNtn(ntn) || !isCnic(cnic) || !proof) {
    redirect("/seller/documents?error=incomplete_business_details");
  }

  await prisma.supplierOrganisation.update({
    where: { id: session.supplierOrgId },
    data: {
      address,
      ntn: digits(ntn),
      cnic: digits(cnic),
      businessProofUrl: proof,
      publicStatus: existing.publicStatus === "approved" ? "approved" : "pending_review",
      rejectionReason: null,
    },
  });

  redirect("/seller/documents");
}

export async function updateSellerProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }

  const about = String(formData.get("about") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const catalogueUrl = String(formData.get("catalogueUrl") ?? "").trim();
  const plant = await savePlantPhoto(formData);
  const categoryIds = [...new Set(formData.getAll("categoryIds").map(String).filter(Boolean))];

  if (plant && "error" in plant) {
    redirect("/seller/profile?error=plant_photo");
  }

  const validTypes = categoryIds.length
    ? await prisma.category.findMany({
        where: { id: { in: categoryIds }, kind: "type", active: true },
        select: { id: true },
      })
    : [];
  const orgId = session.supplierOrgId;

  await prisma.$transaction([
    prisma.supplierOrganisation.update({
      where: { id: orgId },
      data: {
        ...(about ? { about } : {}),
        ...(phone ? { phone: isPkMobile(phone) ? normalizePkMobile(phone) : phone } : {}),
        whatsapp: whatsapp ? (isPkMobile(whatsapp) ? normalizePkMobile(whatsapp) : whatsapp) : null,
        website: website || null,
        catalogueUrl: catalogueUrl || null,
        ...(plant && "url" in plant ? { coverUrl: plant.url } : {}),
      },
    }),
    prisma.supplierCategory.deleteMany({ where: { supplierId: orgId } }),
    ...(validTypes.length
      ? [
          prisma.supplierCategory.createMany({
            data: validTypes.map((c) => ({ supplierId: orgId, categoryId: c.id })),
          }),
        ]
      : []),
  ]);

  redirect("/seller/profile");
}
