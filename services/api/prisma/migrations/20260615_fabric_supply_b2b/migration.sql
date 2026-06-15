-- B2B طلبات توريد القماش (تاجر → خياط / عميل)
CREATE TABLE IF NOT EXISTS "FabricSupplyOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "merchantShopId" TEXT NOT NULL,
    "buyerShopId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "linkedOrderId" TEXT,
    "deliveryTarget" TEXT NOT NULL DEFAULT 'TAILOR_SHOP',
    "deliveryAddress" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FabricSupplyOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FabricSupplyOrderItem" (
    "id" TEXT NOT NULL,
    "fabricSupplyOrderId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'meter',
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "FabricSupplyOrderItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FabricSupplyOrder_orderNumber_key" ON "FabricSupplyOrder"("orderNumber");
CREATE INDEX IF NOT EXISTS "FabricSupplyOrder_merchantShopId_status_createdAt_idx" ON "FabricSupplyOrder"("merchantShopId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "FabricSupplyOrder_buyerShopId_status_createdAt_idx" ON "FabricSupplyOrder"("buyerShopId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "FabricSupplyOrder_linkedOrderId_idx" ON "FabricSupplyOrder"("linkedOrderId");
CREATE INDEX IF NOT EXISTS "FabricSupplyOrderItem_fabricSupplyOrderId_idx" ON "FabricSupplyOrderItem"("fabricSupplyOrderId");
CREATE INDEX IF NOT EXISTS "FabricSupplyOrderItem_productId_idx" ON "FabricSupplyOrderItem"("productId");

ALTER TABLE "FabricSupplyOrder" DROP CONSTRAINT IF EXISTS "FabricSupplyOrder_merchantShopId_fkey";
ALTER TABLE "FabricSupplyOrder" ADD CONSTRAINT "FabricSupplyOrder_merchantShopId_fkey" FOREIGN KEY ("merchantShopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FabricSupplyOrder" DROP CONSTRAINT IF EXISTS "FabricSupplyOrder_buyerShopId_fkey";
ALTER TABLE "FabricSupplyOrder" ADD CONSTRAINT "FabricSupplyOrder_buyerShopId_fkey" FOREIGN KEY ("buyerShopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FabricSupplyOrder" DROP CONSTRAINT IF EXISTS "FabricSupplyOrder_buyerUserId_fkey";
ALTER TABLE "FabricSupplyOrder" ADD CONSTRAINT "FabricSupplyOrder_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FabricSupplyOrder" DROP CONSTRAINT IF EXISTS "FabricSupplyOrder_linkedOrderId_fkey";
ALTER TABLE "FabricSupplyOrder" ADD CONSTRAINT "FabricSupplyOrder_linkedOrderId_fkey" FOREIGN KEY ("linkedOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FabricSupplyOrderItem" DROP CONSTRAINT IF EXISTS "FabricSupplyOrderItem_fabricSupplyOrderId_fkey";
ALTER TABLE "FabricSupplyOrderItem" ADD CONSTRAINT "FabricSupplyOrderItem_fabricSupplyOrderId_fkey" FOREIGN KEY ("fabricSupplyOrderId") REFERENCES "FabricSupplyOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FabricSupplyOrderItem" DROP CONSTRAINT IF EXISTS "FabricSupplyOrderItem_productId_fkey";
ALTER TABLE "FabricSupplyOrderItem" ADD CONSTRAINT "FabricSupplyOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
