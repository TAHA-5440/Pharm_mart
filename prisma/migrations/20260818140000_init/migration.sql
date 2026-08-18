-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('buyer', 'supplier', 'admin');

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('registered', 'business_verified', 'verified_supplier', 'industry_verified', 'premium_verified', 'certified_seller');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'pending_review', 'live', 'rejected', 'archived', 'sold', 'withdrawn');

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('draft', 'submitted', 'under_review', 'changes_requested', 'open', 'rejected', 'expired', 'cancelled', 'closed');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('draft', 'submitted', 'withdrawn', 'accepted', 'declined', 'expired', 'won', 'lost');

-- CreateEnum
CREATE TYPE "RfqType" AS ENUM ('product', 'service', 'turnkey', 'spare_parts', 'used_machine');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('pharmaceutical', 'food_beverage', 'other');

-- CreateEnum
CREATE TYPE "MachineCondition" AS ENUM ('new_unused', 'excellent', 'good', 'fair', 'as_is', 'refurbished');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "jobTitle" TEXT,
    "role" "UserRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "buyerOrgId" TEXT,
    "supplierOrgId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerOrganisation" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT,
    "industry" "Industry" NOT NULL DEFAULT 'pharmaceutical',
    "city" TEXT NOT NULL,
    "address" TEXT,
    "ntn" TEXT,
    "website" TEXT,
    "about" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerOrganisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierOrganisation" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "about" TEXT NOT NULL,
    "yearEstablished" INTEGER,
    "city" TEXT NOT NULL,
    "citiesServed" TEXT NOT NULL DEFAULT '',
    "address" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "industries" TEXT NOT NULL DEFAULT 'pharmaceutical',
    "servicesOffered" TEXT NOT NULL DEFAULT '',
    "brands" TEXT NOT NULL DEFAULT '',
    "ntn" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "catalogueUrl" TEXT,
    "verification" "VerificationLevel" NOT NULL DEFAULT 'registered',
    "publicStatus" "OrgStatus" NOT NULL DEFAULT 'pending_review',
    "createdByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileViews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SupplierOrganisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'type',
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierCategory" (
    "supplierId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "SupplierCategory_pkey" PRIMARY KEY ("supplierId","categoryId")
);

-- CreateTable
CREATE TABLE "ProductListing" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "categoryId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'product',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "longDesc" TEXT,
    "specs" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "pricePkr" INTEGER,
    "priceOnRequest" BOOLEAN NOT NULL DEFAULT true,
    "leadDays" INTEGER,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsedMachineListing" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "categoryId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "condition" "MachineCondition" NOT NULL DEFAULT 'good',
    "serialNumber" TEXT,
    "city" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrls" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT,
    "pricePkr" INTEGER,
    "requestPrice" BOOLEAN NOT NULL DEFAULT false,
    "warranty" TEXT,
    "installation" BOOLEAN NOT NULL DEFAULT false,
    "inspection" BOOLEAN NOT NULL DEFAULT false,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsedMachineListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rfq" (
    "id" TEXT NOT NULL,
    "buyerOrgId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "RfqType" NOT NULL DEFAULT 'product',
    "industry" "Industry" NOT NULL DEFAULT 'pharmaceutical',
    "categoryId" TEXT,
    "quantity" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neededBy" TEXT NOT NULL,
    "budgetPkr" INTEGER,
    "budgetVisible" BOOLEAN NOT NULL DEFAULT false,
    "usedAllowed" BOOLEAN NOT NULL DEFAULT false,
    "installation" BOOLEAN NOT NULL DEFAULT false,
    "warrantyNeed" TEXT,
    "closingAt" TIMESTAMP(3),
    "singleSupplierId" TEXT,
    "status" "RfqStatus" NOT NULL DEFAULT 'draft',
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "machineId" TEXT,

    CONSTRAINT "Rfq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RfqMatch" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RfqMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "userId" TEXT,
    "pricePkr" INTEGER NOT NULL,
    "priceType" TEXT NOT NULL DEFAULT 'lump_sum',
    "validityDays" INTEGER NOT NULL DEFAULT 15,
    "deliveryDays" INTEGER NOT NULL,
    "warranty" TEXT NOT NULL,
    "installation" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "pdfUrl" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT,
    "buyerUserId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSupplier" (
    "userId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,

    CONSTRAINT "SavedSupplier_pkey" PRIMARY KEY ("userId","supplierId")
);

-- CreateTable
CREATE TABLE "FavouriteListing" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "FavouriteListing_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierOrganisation_slug_key" ON "SupplierOrganisation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductListing_supplierId_slug_key" ON "ProductListing"("supplierId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "UsedMachineListing_slug_key" ON "UsedMachineListing"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RfqMatch_rfqId_supplierId_key" ON "RfqMatch"("rfqId", "supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_rfqId_supplierId_key" ON "Quotation"("rfqId", "supplierId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_buyerOrgId_fkey" FOREIGN KEY ("buyerOrgId") REFERENCES "BuyerOrganisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supplierOrgId_fkey" FOREIGN KEY ("supplierOrgId") REFERENCES "SupplierOrganisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCategory" ADD CONSTRAINT "SupplierCategory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierOrganisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCategory" ADD CONSTRAINT "SupplierCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductListing" ADD CONSTRAINT "ProductListing_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierOrganisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductListing" ADD CONSTRAINT "ProductListing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedMachineListing" ADD CONSTRAINT "UsedMachineListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SupplierOrganisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedMachineListing" ADD CONSTRAINT "UsedMachineListing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_buyerOrgId_fkey" FOREIGN KEY ("buyerOrgId") REFERENCES "BuyerOrganisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqMatch" ADD CONSTRAINT "RfqMatch_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqMatch" ADD CONSTRAINT "RfqMatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierOrganisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierOrganisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSupplier" ADD CONSTRAINT "SavedSupplier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSupplier" ADD CONSTRAINT "SavedSupplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierOrganisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteListing" ADD CONSTRAINT "FavouriteListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteListing" ADD CONSTRAINT "FavouriteListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "UsedMachineListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

