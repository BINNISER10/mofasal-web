-- موعد التسليم وعنوان التوصيل على الطلب
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "estimatedDeliveryDate" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryAddress" JSONB;
