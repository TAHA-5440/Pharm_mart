"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createSession,
  clearSession,
  hashPassword,
  recordLogin,
  verifyPassword,
} from "@/lib/auth";
import { matchSuppliersForRfq } from "@/lib/matching";
import { notifyUser } from "@/lib/notify";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { slugify } from "@/lib/utils";
import type { ListingStatus } from "@prisma/client";

async function saveMockUpload(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public", "mock-uploads");
  await mkdir(uploadDir, { recursive: true });
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_ ]/g, "_")}`;
  const filePath = path.join(uploadDir, safeName);
  await writeFile(filePath, buffer);
  return `/mock-uploads/${safeName}`;
}

async function optionalUpload(formData: FormData, key: string, existing?: string | null) {
  const file = formData.get(key);
  if (file && typeof file !== "string" && file.size > 0) {
    return saveMockUpload(file);
  }
  return existing ?? null;
}

async function requireSupplierSession() {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }
  return { ...session, supplierOrgId: session.supplierOrgId };
}

async function uniqueProductSlug(name: string, excludeId?: string) {
  const base = slugify(name);
  let slug = base;
  let n = 2;
  while (
    await prisma.productListing.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  password: z.string().min(8),
  role: z.enum(["buyer", "supplier"]),
  company: z.string().min(2),
  city: z.string().min(2),
  industry: z.enum(["pharmaceutical", "food_beverage", "other"]),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
    company: formData.get("company"),
    city: formData.get("city"),
    industry: formData.get("industry"),
  });
  if (!parsed.success) {
    return { error: "Please complete all fields with a valid email and 8+ character password." };
  }
  const data = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (exists) return { error: "An account with this email already exists." };

  const passwordHash = await hashPassword(data.password);
  const slug = data.company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

  if (data.role === "buyer") {
    const org = await prisma.buyerOrganisation.create({
      data: {
        legalName: data.company,
        industry: data.industry,
        city: data.city,
      },
    });
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: "buyer",
        buyerOrgId: org.id,
      },
    });
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: "buyer",
      buyerOrgId: org.id,
      supplierOrgId: null,
    });
    redirect("/buyer");
  }

  const address = String(formData.get("address") ?? "").trim();
  const ntn = String(formData.get("ntn") ?? "").trim();
  const cnic = String(formData.get("cnic") ?? "").trim();
  const businessProofFile = formData.get("businessProof");
  let businessProofUrl = "";
  if (businessProofFile && typeof businessProofFile !== "string" && businessProofFile.size > 0) {
    businessProofUrl = await saveMockUpload(businessProofFile);
  }

  if (!address || !ntn || !cnic || !businessProofUrl) {
    return { error: "Suppliers must provide Address, NTN, CNIC, and a valid Business Proof document." };
  }

  const uniqueSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const org = await prisma.supplierOrganisation.create({
    data: {
      legalName: data.company,
      displayName: data.company,
      slug: uniqueSlug,
      about: `${data.company} supplies industrial equipment and services in ${data.city}.`,
      city: data.city,
      address,
      ntn,
      cnic,
      businessProofUrl,
      phone: data.phone,
      email: data.email.toLowerCase(),
      industries: data.industry,
      publicStatus: "pending_review",
    },
  });
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      phone: data.phone,
      role: "supplier",
      supplierOrgId: org.id,
    },
  });
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

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
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
  if (user.role === "admin") redirect("/admin");
  if (user.role === "supplier") redirect("/seller");
  redirect("/buyer");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function createRfqAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "buyer" || !session.buyerOrgId) {
    redirect("/login?next=/rfq/new");
  }
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const neededBy = String(formData.get("neededBy") ?? "30 days").trim();
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const singleSupplierId = String(formData.get("singleSupplierId") ?? "") || null;
  if (title.length < 4 || description.length < 20 || !quantity || !city) {
    redirect("/rfq/new?error=incomplete");
  }
  const closing = new Date();
  closing.setDate(closing.getDate() + 14);
  const rfq = await prisma.rfq.create({
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
      installation: formData.get("installation") === "on",
      usedAllowed: formData.get("usedAllowed") === "on",
      status: "submitted",
      closingAt: closing,
    },
  });
  await notifyUser({
    userId: session.id,
    type: "rfq_submitted",
    title: "RFQ submitted",
    body: "We’ll review and notify matching suppliers.",
    href: `/buyer/rfqs/${rfq.id}`,
  });
  redirect(`/buyer/rfqs/${rfq.id}`);
}

export async function openRfqAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const rfqId = String(formData.get("rfqId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (!rfqId) redirect("/admin?desk=queue");
  if (!categoryId) redirect(`/admin/rfqs/${rfqId}?error=type`);

  const before = await prisma.rfq.findUnique({
    where: { id: rfqId },
    include: { matches: true },
  });
  if (!before) redirect("/admin?desk=queue");

  const alreadyNotified = new Set(before.matches.map((m) => m.supplierId));

  await prisma.rfq.update({
    where: { id: rfqId },
    data: { categoryId, status: "open", qualified: true },
  });
  await matchSuppliersForRfq(rfqId);

  const rfq = await prisma.rfq.findUnique({
    where: { id: rfqId },
    include: { matches: { include: { supplier: { include: { users: true } } } } },
  });
  if (!rfq) redirect("/admin?desk=queue");

  for (const match of rfq.matches) {
    if (alreadyNotified.has(match.supplierId)) continue;
    for (const user of match.supplier.users) {
      await notifyUser({
        userId: user.id,
        type: "rfq_open",
        title: "New RFQ",
        body: `${rfq.title} · ${rfq.city}`,
        href: "/seller",
      });
    }
  }
  redirect(`/admin/rfqs/${rfqId}`);
}

export async function rejectRfqAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const rfqId = String(formData.get("rfqId") ?? "");
  await prisma.rfq.update({
    where: { id: rfqId },
    data: { status: "rejected" },
  });
  redirect("/admin");
}

export async function approveSupplierAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const id = String(formData.get("supplierId") ?? "");
  await prisma.supplierOrganisation.update({
    where: { id },
    data: { publicStatus: "approved", verification: "business_verified" },
  });
  await prisma.productListing.updateMany({
    where: { supplierId: id, status: "pending_review" },
    data: { status: "live" },
  });
  redirect(`/admin/suppliers/${id}`);
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
    redirect("/seller?error=incomplete");
  }
  const rfq = await prisma.rfq.findUnique({
    where: { id: rfqId },
    include: { matches: true },
  });
  if (!rfq || rfq.status !== "open") redirect("/seller?error=closed");
  const matched = rfq.matches.some((m) => m.supplierId === session.supplierOrgId);
  if (!matched) redirect("/seller?error=notmatched");

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
  redirect("/seller");
}

export async function updateBusinessDetailsAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "supplier" || !session.supplierOrgId) {
    redirect("/login");
  }

  const address = String(formData.get("address") ?? "").trim();
  const ntn = String(formData.get("ntn") ?? "").trim();
  const cnic = String(formData.get("cnic") ?? "").trim();
  
  // For the mock file upload, we'll just check if a file was provided and create a mock URL
  // Or if it's a string URL from a simple input.
  const businessProofFile = formData.get("businessProof");
  let businessProofUrl = "";
  if (businessProofFile && typeof businessProofFile !== "string" && businessProofFile.size > 0) {
    businessProofUrl = await saveMockUpload(businessProofFile);
  }

  if (!address || !ntn || !cnic || !businessProofUrl) {
    redirect("/seller?error=incomplete_business_details");
  }

  await prisma.supplierOrganisation.update({
    where: { id: session.supplierOrgId },
    data: {
      address,
      ntn,
      cnic,
      businessProofUrl,
      publicStatus: "pending_review",
      rejectionReason: null,
    },
  });

  redirect("/seller");
}

export async function updateSupplierProfileAction(formData: FormData) {
  const session = await requireSupplierSession();
  const org = await prisma.supplierOrganisation.findUnique({
    where: { id: session.supplierOrgId },
  });
  if (!org) redirect("/seller");

  const displayName = String(formData.get("displayName") ?? "").trim();
  const legalName = String(formData.get("legalName") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim().slice(0, 120) || null;
  const about = String(formData.get("about") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const citiesServed = String(formData.get("citiesServed") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim() || null;
  const yearRaw = String(formData.get("yearEstablished") ?? "").trim();
  const yearEstablished = yearRaw ? Number(yearRaw) : null;
  const ntn = String(formData.get("ntn") ?? "").trim() || null;
  const cnic = String(formData.get("cnic") ?? "").trim() || null;
  const industries = formData
    .getAll("industry")
    .map(String)
    .filter(Boolean)
    .join(",");
  const servicesOffered = formData
    .getAll("service")
    .map(String)
    .filter(Boolean)
    .join(", ");
  const brands = String(formData.get("brands") ?? "").trim();
  const categoryIds = [...new Set(formData.getAll("categoryId").map(String).filter(Boolean))];

  if (!displayName || !legalName || !about || !city || !phone || !email) {
    redirect("/seller/profile?error=required");
  }
  if (!industries) {
    redirect("/seller/profile?error=industry");
  }

  const publicStatus =
    org.publicStatus === "rejected" || org.publicStatus === "draft"
      ? "pending_review"
      : org.publicStatus;

  const logoUrl = await optionalUpload(formData, "logo", org.logoUrl);
  const coverUrl = await optionalUpload(formData, "cover", org.coverUrl);
  const catalogueUrl = await optionalUpload(formData, "catalogue", org.catalogueUrl);
  const businessProofUrl = await optionalUpload(
    formData,
    "businessProof",
    org.businessProofUrl,
  );

  await prisma.$transaction([
    prisma.supplierOrganisation.update({
      where: { id: org.id },
      data: {
        displayName,
        legalName,
        tagline,
        about,
        city,
        citiesServed,
        address,
        phone,
        whatsapp,
        email,
        website,
        yearEstablished:
          yearEstablished && yearEstablished >= 1900 ? yearEstablished : null,
        ntn,
        cnic,
        industries,
        servicesOffered,
        brands,
        publicStatus,
        rejectionReason:
          publicStatus === "pending_review" ? null : org.rejectionReason,
        logoUrl,
        coverUrl,
        catalogueUrl,
        businessProofUrl,
      },
    }),
    prisma.supplierCategory.deleteMany({ where: { supplierId: org.id } }),
    ...categoryIds.map((categoryId) =>
      prisma.supplierCategory.create({
        data: { supplierId: org.id, categoryId },
      }),
    ),
  ]);

  redirect("/seller/profile?saved=1");
}

export async function saveProductAction(formData: FormData) {
  const session = await requireSupplierSession();
  const org = await prisma.supplierOrganisation.findUnique({
    where: { id: session.supplierOrgId },
  });
  if (!org) redirect("/seller");

  const productId = String(formData.get("productId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "product") === "service" ? "service" : "product";
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;
  const shortDesc = String(formData.get("shortDesc") ?? "").trim();
  const longDesc = String(formData.get("longDesc") ?? "").trim() || null;
  const specs = String(formData.get("specs") ?? "").trim();
  const leadRaw = String(formData.get("leadDays") ?? "").trim();
  const leadDays = leadRaw ? Number(leadRaw) : null;
  const priceOnRequest = formData.get("priceOnRequest") === "on";
  const priceRaw = String(formData.get("pricePkr") ?? "").trim();
  const pricePkr = !priceOnRequest && priceRaw ? Number(priceRaw) : null;
  const intent = String(formData.get("intent") ?? "publish");

  const existing = productId
    ? await prisma.productListing.findFirst({
        where: { id: productId, supplierId: org.id },
      })
    : null;
  if (productId && !existing) redirect("/seller/products?error=missing");

  if (!name || !shortDesc || !categoryId) {
    redirect(
      existing
        ? `/seller/products/${existing.id}?error=required`
        : "/seller/products/new?error=required",
    );
  }

  const imageUrl = await optionalUpload(formData, "image", existing?.imageUrl);
  const status: ListingStatus =
    intent === "draft"
      ? "draft"
      : org.publicStatus === "approved"
        ? "live"
        : "pending_review";

  if (status !== "draft" && kind === "product" && !imageUrl) {
    redirect(
      existing
        ? `/seller/products/${existing.id}?error=image`
        : "/seller/products/new?error=image",
    );
  }

  const slug = existing?.slug ?? (await uniqueProductSlug(name, existing?.id));

  const data = {
    name,
    slug,
    kind,
    categoryId,
    shortDesc,
    longDesc,
    specs,
    leadDays: leadDays && leadDays > 0 ? leadDays : null,
    priceOnRequest: priceOnRequest || !pricePkr,
    pricePkr: priceOnRequest ? null : pricePkr,
    imageUrl,
    status,
    supplierId: org.id,
  };

  if (existing) {
    await prisma.productListing.update({ where: { id: existing.id }, data });
  } else {
    await prisma.productListing.create({ data });
  }
  redirect("/seller/products?saved=1");
}

export async function archiveProductAction(formData: FormData) {
  const session = await requireSupplierSession();
  const productId = String(formData.get("productId") ?? "");
  await prisma.productListing.updateMany({
    where: { id: productId, supplierId: session.supplierOrgId },
    data: { status: "archived" },
  });
  redirect("/seller/products");
}

export async function approveProductAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const id = String(formData.get("productId") ?? "");
  await prisma.productListing.update({
    where: { id },
    data: { status: "live" },
  });
  redirect("/admin?desk=queue");
}

export async function rejectProductAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const id = String(formData.get("productId") ?? "");
  await prisma.productListing.update({
    where: { id },
    data: { status: "rejected" },
  });
  redirect("/admin?desk=queue");
}
