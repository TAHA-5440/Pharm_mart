-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "jobTitle" TEXT,
    "role" TEXT NOT NULL,
    "active" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME,
    "buyerOrgId" TEXT,
    "supplierOrgId" TEXT
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "BuyerOrganisation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT,
    "industry" TEXT NOT NULL DEFAULT 'pharmaceutical',
    "city" TEXT NOT NULL,
    "address" TEXT,
    "ntn" TEXT,
    "website" TEXT,
    "about" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "SupplierOrganisation" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "verification" TEXT NOT NULL DEFAULT 'registered',
    "publicStatus" TEXT NOT NULL DEFAULT 'pending_review',
    "createdByAdmin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileViews" INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX "SupplierOrganisation_slug_key" ON "SupplierOrganisation"("slug");

CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'type',
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

CREATE TABLE "SupplierCategory" (
    "supplierId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    PRIMARY KEY ("supplierId", "categoryId")
);

CREATE TABLE "ProductListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "priceOnRequest" INTEGER NOT NULL DEFAULT 1,
    "leadDays" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "ProductListing_supplierId_slug_key" ON "ProductListing"("supplierId", "slug");

CREATE TABLE "UsedMachineListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "categoryId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "condition" TEXT NOT NULL DEFAULT 'good',
    "serialNumber" TEXT,
    "city" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrls" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT,
    "pricePkr" INTEGER,
    "requestPrice" INTEGER NOT NULL DEFAULT 0,
    "warranty" TEXT,
    "installation" INTEGER NOT NULL DEFAULT 0,
    "inspection" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "UsedMachineListing_slug_key" ON "UsedMachineListing"("slug");

CREATE TABLE "Rfq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerOrgId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'product',
    "industry" TEXT NOT NULL DEFAULT 'pharmaceutical',
    "categoryId" TEXT,
    "quantity" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neededBy" TEXT NOT NULL,
    "budgetPkr" INTEGER,
    "budgetVisible" INTEGER NOT NULL DEFAULT 0,
    "usedAllowed" INTEGER NOT NULL DEFAULT 0,
    "installation" INTEGER NOT NULL DEFAULT 0,
    "warrantyNeed" TEXT,
    "closingAt" DATETIME,
    "singleSupplierId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "qualified" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "machineId" TEXT
);

CREATE TABLE "RfqMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "notifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "RfqMatch_rfqId_supplierId_key" ON "RfqMatch"("rfqId", "supplierId");

CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "userId" TEXT,
    "pricePkr" INTEGER NOT NULL,
    "priceType" TEXT NOT NULL DEFAULT 'lump_sum',
    "validityDays" INTEGER NOT NULL DEFAULT 15,
    "deliveryDays" INTEGER NOT NULL,
    "warranty" TEXT NOT NULL,
    "installation" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "pdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Quotation_rfqId_supplierId_key" ON "Quotation"("rfqId", "supplierId");

CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT,
    "buyerUserId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "read" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "SavedSupplier" (
    "userId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    PRIMARY KEY ("userId", "supplierId")
);

CREATE TABLE "FavouriteListing" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    PRIMARY KEY ("userId", "listingId")
);

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
