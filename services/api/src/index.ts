import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { requestTimeout } from './middleware/timeout';
import { responseTime } from './middleware/responseTime';
import { sanitize } from './middleware/sanitize';
import { socketService } from './services/SocketService';
import { FirebaseService } from './services/integrations/FirebaseService';
import { SmsService } from './services/integrations/SmsService';
import redisService from './services/RedisService';
import logger from './utils/logger';
import { swaggerSpec } from './config/swagger';
import monitoringService from './services/MonitoringService';
import { startNotificationWorker, stopNotificationWorker } from './queues/notification.queue';

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
import accountingRoutes from './routes/v1/accounting.routes';
import reportsRoutes from './routes/v1/reports.routes';
import rolesRoutes from './routes/v1/roles.routes';
import manufacturingRoutes from './routes/v1/manufacturing.routes';
import pricingRoutes from './routes/v1/pricing.routes';

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Initialize external services
try { FirebaseService.initialize(); } catch { logger.warn('Firebase initialization skipped'); }
try { SmsService.initialize(); } catch { logger.warn('SMS initialization skipped'); }

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: config.isProd ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'", 'https://api.mufasal.com', 'wss://api.mufasal.com'],
    },
  } : false,
  hsts: config.isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}));

const allowedOrigins = config.cors.origin.split(',').map((o: string) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Remaining', 'X-Request-Id', 'X-Response-Time'],
  maxAge: 86400,
}));
app.use(compression());
app.use(requestId);
app.use(responseTime);
app.use(requestTimeout(30000));
app.use(sanitize);

// Monitoring middleware
app.use((req, _res, next) => {
  monitoringService.incrementRequestCount();
  next();
});

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests, please try again later' } },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { success: false, error: { message: 'Too many auth attempts, please try again later' } },
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many write requests' } },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests' } },
});

app.use('/api', generalLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', writeLimiter);

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

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MUFASAL API Docs',
  customfavIcon: '/favicon.ico',
}));
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health & monitoring
app.get('/health', async (_req, res) => {
  const health = await monitoringService.getHealth();
  const statusCode = health.data.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.get('/health/live', (_req, res) => {
  res.json({ success: true, status: 'alive' });
});

app.get('/health/ready', async (_req, res) => {
  try {
    await monitoringService.checkDatabase();
    res.json({ success: true, status: 'ready' });
  } catch {
    res.status(503).json({ success: false, status: 'not ready' });
  }
});

app.get('/metrics', async (_req, res) => {
  const accept = _req.headers.accept || '';
  if (accept.includes('text/plain') || accept.includes('application/openmetrics-text')) {
    const metrics = await monitoringService.getMetrics();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics.prometheus);
  } else {
    const metrics = await monitoringService.getMetrics();
    res.json(metrics.json);
  }
});

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
app.use(`${apiPrefix}/accounting`, accountingRoutes);
app.use(`${apiPrefix}/reports`, reportsRoutes);
app.use(`${apiPrefix}/roles`, rolesRoutes);
app.use(`${apiPrefix}/manufacturing`, manufacturingRoutes);
app.use(`${apiPrefix}/pricing`, pricingRoutes);

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  monitoringService.incrementErrorCount();
  errorHandler(err, _req, res, next);
});
app.use(notFoundHandler);

// Start server
async function start() {
  try {
    await redisService.connect();
    logger.info('Redis connected');
    await startNotificationWorker();
  } catch (error) {
    logger.warn('Redis connection failed, continuing without cache', error);
    await startNotificationWorker();
  }

  server.listen(config.port, () => {
    logger.info(`MUFASAL API server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`API Prefix: ${apiPrefix}`);
    logger.info(`Swagger docs: http://localhost:${config.port}/api-docs`);
  });
}

start();

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(async () => {
    await stopNotificationWorker();
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
