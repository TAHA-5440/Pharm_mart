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

async function saveMockUpload(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public", "mock-uploads");
  await mkdir(uploadDir, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_ ]/g, "_");
  const filePath = path.join(uploadDir, safeName);
  await writeFile(filePath, buffer);
  return `/mock-uploads/${safeName}`;
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
  await matchSuppliersForRfq(rfqId);
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
        href: "/seller",
      });
    }
  }
  redirect("/admin");
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
