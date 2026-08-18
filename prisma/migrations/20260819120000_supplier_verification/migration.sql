-- AlterTable
ALTER TABLE "SupplierOrganisation" ADD COLUMN IF NOT EXISTS "cnic" TEXT;
ALTER TABLE "SupplierOrganisation" ADD COLUMN IF NOT EXISTS "businessProofUrl" TEXT;
ALTER TABLE "SupplierOrganisation" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
