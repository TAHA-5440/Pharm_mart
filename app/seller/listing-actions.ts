"use server";

import { redirect } from "next/navigation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { ListingStatus, MachineCondition } from "@prisma/client";
import { prisma } from "@/lib/db";
import { listingSlug, requireSeller } from "@/lib/seller";

async function saveUpload(file: File, kind: string) {
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") return null;
  if (file.size > 8 * 1024 * 1024) return null;
  const bytes = await file.arrayBuffer();
  const uploadDir = path.join(process.cwd(), "public", "mock-uploads");
  await mkdir(uploadDir, { recursive: true });
  const ext = path.extname(file.name.replace(/[^a-zA-Z0-9.\-_ ]/g, "_")).slice(0, 8) || ".jpg";
  const unique = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await writeFile(path.join(uploadDir, unique), Buffer.from(bytes));
  return `/mock-uploads/${unique}`;
}

async function saveImages(formData: FormData, name: string, kind: string) {
  const urls: string[] = [];
  for (const value of formData.getAll(name)) {
    if (typeof value === "string" || value.size === 0) continue;
    if (!value.type.startsWith("image/")) continue;
    const url = await saveUpload(value, kind);
    if (url) urls.push(url);
  }
  return urls;
}

function listingStatusFor(orgApproved: boolean, previous?: ListingStatus): ListingStatus {
  if (previous === "archived" || previous === "sold") return previous;
  return orgApproved ? "live" : "pending_review";
}

async function linkSupplierType(orgId: string, categoryId: string | null) {
  if (!categoryId) return;
  await prisma.supplierCategory.upsert({
    where: { supplierId_categoryId: { supplierId: orgId, categoryId } },
    create: { supplierId: orgId, categoryId },
    update: {},
  });
}

export async function saveSellerProductAction(formData: FormData) {
  const { org } = await requireSeller();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const shortDesc = String(formData.get("shortDesc") ?? "").trim();
  if (!name || shortDesc.length < 8) redirect("/seller/products?error=listing");

  const existing = id
    ? await prisma.productListing.findFirst({ where: { id, supplierId: org.id } })
    : null;
  if (id && !existing) redirect("/seller/products?error=listing");

  const images = await saveImages(formData, "image", "product");
  const imageUrl = images[0] ?? existing?.imageUrl ?? null;
  const priceOnRequest = formData.get("priceOnRequest") === "on";
  const priceRaw = Number(formData.get("pricePkr"));
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const status = listingStatusFor(org.publicStatus === "approved", existing?.status);

  const data = {
    name,
    shortDesc,
    longDesc: String(formData.get("longDesc") ?? "").trim() || null,
    specs: String(formData.get("specs") ?? "").trim(),
    categoryId,
    imageUrl,
    priceOnRequest,
    pricePkr: priceOnRequest || !priceRaw ? null : priceRaw,
    leadDays: Number(formData.get("leadDays")) || null,
    status,
  };

  if (existing) {
    await prisma.productListing.update({ where: { id: existing.id }, data });
  } else {
    await prisma.productListing.create({
      data: { ...data, supplierId: org.id, slug: listingSlug(name) },
    });
  }
  await linkSupplierType(org.id, categoryId);
  redirect("/seller/products");
}

export async function archiveSellerProductAction(formData: FormData) {
  const { org } = await requireSeller();
  const id = String(formData.get("id") ?? "");
  await prisma.productListing.updateMany({
    where: { id, supplierId: org.id },
    data: { status: "archived" },
  });
  redirect("/seller/products");
}

export async function saveSellerMachineAction(formData: FormData) {
  const { org } = await requireSeller();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const manufacturer = String(formData.get("manufacturer") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  if (!title || !manufacturer || !model || description.length < 12 || !city) {
    redirect("/seller/machines?error=listing");
  }

  const existing = id
    ? await prisma.usedMachineListing.findFirst({ where: { id, sellerId: org.id } })
    : null;
  if (id && !existing) redirect("/seller/machines?error=listing");

  const images = await saveImages(formData, "photos", "machine");
  const photoUrls = images.length ? images.join(",") : existing?.photoUrls ?? "";
  const requestPrice = formData.get("requestPrice") === "on";
  const priceRaw = Number(formData.get("pricePkr"));
  const yearRaw = Number(formData.get("year"));
  const condition = String(formData.get("condition") ?? "good") as MachineCondition;
  const status = listingStatusFor(org.publicStatus === "approved", existing?.status);

  const data = {
    title,
    manufacturer,
    model,
    year: yearRaw || null,
    condition,
    serialNumber: String(formData.get("serialNumber") ?? "").trim() || null,
    city,
    description,
    photoUrls,
    warranty: String(formData.get("warranty") ?? "").trim() || null,
    installation: formData.get("installation") === "on",
    inspection: formData.get("inspection") === "on",
    requestPrice,
    pricePkr: requestPrice || !priceRaw ? null : priceRaw,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    status,
  };

  if (existing) {
    await prisma.usedMachineListing.update({ where: { id: existing.id }, data });
  } else {
    await prisma.usedMachineListing.create({
      data: { ...data, sellerId: org.id, slug: listingSlug(title) },
    });
  }
  await linkSupplierType(org.id, data.categoryId);
  redirect("/seller/machines");
}

export async function markMachineSoldAction(formData: FormData) {
  const { org } = await requireSeller();
  const id = String(formData.get("id") ?? "");
  await prisma.usedMachineListing.updateMany({
    where: { id, sellerId: org.id },
    data: { status: "sold" },
  });
  redirect("/seller/machines");
}

export async function archiveSellerMachineAction(formData: FormData) {
  const { org } = await requireSeller();
  const id = String(formData.get("id") ?? "");
  await prisma.usedMachineListing.updateMany({
    where: { id, sellerId: org.id },
    data: { status: "archived" },
  });
  redirect("/seller/machines");
}

export async function markQuoteDealAction(formData: FormData) {
  const { org } = await requireSeller();
  const id = String(formData.get("id") ?? "");
  const outcome = String(formData.get("outcome") ?? "") as "won" | "lost" | "withdrawn";
  if (!["won", "lost", "withdrawn"].includes(outcome)) redirect("/seller/quotes?error=deal");

  const quote = await prisma.quotation.findFirst({
    where: { id, supplierId: org.id },
  });
  if (!quote || !["submitted", "accepted", "won", "lost"].includes(quote.status)) {
    redirect("/seller/quotes?error=deal");
  }

  await prisma.quotation.update({
    where: { id: quote.id },
    data: { status: outcome },
  });
  redirect("/seller/quotes");
}
