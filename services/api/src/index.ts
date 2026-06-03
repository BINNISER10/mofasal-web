import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { socketService } from './services/SocketService';
import { FirebaseService } from './services/integrations/FirebaseService';
import { SmsService } from './services/integrations/SmsService';
import redisService from './services/RedisService';
import logger from './utils/logger';

// Import all route modules
import authRoutes from './routes/v1/auth.routes';
import userRoutes from './routes/v1/users.routes';
import shopRoutes from './routes/v1/shops.routes';
import serviceRoutes from './routes/v1/services.routes';
import orderRoutes from './routes/v1/orders.routes';
import productRoutes from './routes/v1/products.routes';
import deliveryRoutes from './routes/v1/delivery.routes';
import paymentRoutes from './routes/v1/payments.routes';
import reviewRoutes from './routes/v1/reviews.routes';
import notificationRoutes from './routes/v1/notifications.routes';
import adminRoutes from './routes/v1/admin.routes';
import conversationRoutes from './routes/v1/conversations.routes';
import zatcaRoutes from './routes/v1/zatca.routes';
import hrRoutes from './routes/v1/hr.routes';
import procurementRoutes from './routes/v1/procurement.routes';
import supplierRoutes from './routes/v1/supplier.routes';
import posRoutes from './routes/v1/pos.routes';
import reportRoutes from './routes/v1/reports.routes';
import accountingRoutes from './routes/v1/accounting.routes';
import aiRoutes from './routes/v1/ai.routes';
import couponRoutes from './routes/v1/coupon.routes';
import loyaltyRoutes from './routes/v1/loyalty.routes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Initialize external services
try { FirebaseService.initialize(); } catch { logger.warn('Firebase initialization skipped'); }
try { SmsService.initialize(); } catch { logger.warn('SMS initialization skipped'); }

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests, please try again later' } },
});
app.use('/api', limiter);

// Request logging
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.resolve(config.storage.path)));

// API Routes
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
app.use(`${apiPrefix}/reports`, reportRoutes);
app.use(`${apiPrefix}/accounting`, accountingRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);
app.use(`${apiPrefix}/coupons`, couponRoutes);
app.use(`${apiPrefix}/loyalty`, loyaltyRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'MUFASAL API is running', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
  try {
    await redisService.connect();
    logger.info('Redis connected');
  } catch (error) {
    logger.warn('Redis connection failed, continuing without cache', error);
  }

  server.listen(config.port, () => {
    logger.info(`MUFASAL API server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`API Prefix: ${apiPrefix}`);
  });
}

start();

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(async () => {
    await redisService.disconnect();
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
