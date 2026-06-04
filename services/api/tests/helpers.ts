import express from 'express';
import cors from 'cors';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler';
import { requestId } from '../src/middleware/requestId';
import { responseTime } from '../src/middleware/responseTime';
import { sanitize } from '../src/middleware/sanitize';

import authRoutes from '../src/routes/v1/auth.routes';
import userRoutes from '../src/routes/v1/users.routes';
import shopRoutes from '../src/routes/v1/shops.routes';
import serviceRoutes from '../src/routes/v1/services.routes';
import orderRoutes from '../src/routes/v1/orders.routes';
import productRoutes from '../src/routes/v1/products.routes';
import deliveryRoutes from '../src/routes/v1/delivery.routes';
import paymentRoutes from '../src/routes/v1/payments.routes';
import reviewRoutes from '../src/routes/v1/reviews.routes';
import notificationRoutes from '../src/routes/v1/notifications.routes';
import adminRoutes from '../src/routes/v1/admin.routes';
import conversationRoutes from '../src/routes/v1/conversations.routes';
import zatcaRoutes from '../src/routes/v1/zatca.routes';
import hrRoutes from '../src/routes/v1/hr.routes';
import procurementRoutes from '../src/routes/v1/procurement.routes';
import supplierRoutes from '../src/routes/v1/supplier.routes';
import posRoutes from '../src/routes/v1/pos.routes';
import accountingRoutes from '../src/routes/v1/accounting.routes';
import reportsRoutes from '../src/routes/v1/reports.routes';
import aiRoutes from '../src/routes/v1/ai.routes';
import couponRoutes from '../src/routes/v1/coupon.routes';
import loyaltyRoutes from '../src/routes/v1/loyalty.routes';

const ROLE_USER_MAP: Record<string, string> = {
  ADMIN: 'test-admin-id',
  CUSTOMER: 'test-customer-id',
  TAILOR_SHOP: 'test-tailor-id',
  MERCHANT: 'test-merchant-id',
  TAILOR: 'test-tailor-id',
  SUPER_ADMIN: 'test-admin-id',
};

export function createTestApp() {
  const app = express();

  app.use(cors({ origin: config.cors.origin, credentials: true }));
  app.use(compression());
  app.use(requestId);
  app.use(responseTime);
  app.use(sanitize);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const apiPrefix = config.apiPrefix;
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/shops`, shopRoutes);
  app.use(`${apiPrefix}/services`, serviceRoutes);
  app.use(`${apiPrefix}/orders`, orderRoutes);
  app.use(`${apiPrefix}/products`, productRoutes);
  app.use(`${apiPrefix}/delivery`, deliveryRoutes);
  app.use(`${apiPrefix}/payments`, paymentRoutes);
  app.use(`${apiPrefix}/reviews`, reviewRoutes);
  app.use(`${apiPrefix}/notifications`, notificationRoutes);
  app.use(`${apiPrefix}/admin`, adminRoutes);
  app.use(`${apiPrefix}/conversations`, conversationRoutes);
  app.use(`${apiPrefix}/zatca`, zatcaRoutes);
  app.use(`${apiPrefix}/hr`, hrRoutes);
  app.use(`${apiPrefix}/procurement`, procurementRoutes);
  app.use(`${apiPrefix}/suppliers`, supplierRoutes);
  app.use(`${apiPrefix}/pos`, posRoutes);
  app.use(`${apiPrefix}/accounting`, accountingRoutes);
  app.use(`${apiPrefix}/reports`, reportsRoutes);
  app.use(`${apiPrefix}/ai`, aiRoutes);
  app.use(`${apiPrefix}/coupons`, couponRoutes);
  app.use(`${apiPrefix}/loyalty`, loyaltyRoutes);

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'MUFASAL API is running', timestamp: new Date().toISOString() });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function generateTestToken(overrides?: Record<string, unknown>): string {
  const role = (overrides?.role as string) || 'ADMIN';
  const userId = (overrides?.userId as string) || ROLE_USER_MAP[role] || 'test-user-id';

  return jwt.sign(
    {
      userId,
      role,
      shopId: overrides?.shopId || 'test-shop-id',
    },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
}
