-- Shop branding (White-Label)
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "branding" JSONB;

-- Role display fields
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "displayNameAr" TEXT;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "Role_shopId_name_idx" ON "Role"("shopId", "name");

-- Pricing tiers (B2B)
CREATE TABLE IF NOT EXISTS "PricingTier" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "b2bPrice" DOUBLE PRECISION,
    "b2cPrice" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingTier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PricingTier_shopId_productId_idx" ON "PricingTier"("shopId", "productId");
CREATE INDEX IF NOT EXISTS "PricingTier_shopId_isActive_idx" ON "PricingTier"("shopId", "isActive");

DO $$ BEGIN
  ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
