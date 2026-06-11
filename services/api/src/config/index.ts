import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    prefix: process.env.REDIS_PREFIX || 'mufasal:',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  storage: {
    path: process.env.STORAGE_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@mufasal.com',
    fromName: process.env.SMTP_FROM_NAME || 'MUFASAL',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },

  payment: {
    mada: { apiKey: process.env.MADA_API_KEY || '', publishableKey: process.env.MADA_PUBLISHABLE_KEY || '', webhookSecret: process.env.MADA_WEBHOOK_SECRET || '' },
    stripe: { secretKey: process.env.STRIPE_SECRET_KEY || '', publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '', webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '' },
    stcpay: { apiKey: process.env.STCPAY_API_KEY || '', merchantId: process.env.STCPAY_MERCHANT_ID || '', apiUrl: process.env.STCPAY_API_URL || '' },
    tamara: { apiKey: process.env.TAMARA_API_KEY || '', apiUrl: process.env.TAMARA_API_URL || '' },
    tabby: { apiKey: process.env.TABBY_API_KEY || '', apiUrl: process.env.TABBY_API_URL || '' },
    sadad: { merchantId: process.env.SADAD_MERCHANT_ID || '', terminalId: process.env.SADAD_TERMINAL_ID || '', apiKey: process.env.SADAD_API_KEY || '' },
  },

  delivery: {
    uber: { clientId: process.env.UBER_CLIENT_ID || '', clientSecret: process.env.UBER_CLIENT_SECRET || '', apiUrl: process.env.UBER_API_URL || '' },
    careen: { apiKey: process.env.CAREEN_API_KEY || '', apiUrl: process.env.CAREEN_API_URL || '' },
    jeeny: { apiKey: process.env.JEENY_API_KEY || '', apiUrl: process.env.JEENY_API_URL || '' },
    smsa: { apiKey: process.env.SMSA_API_KEY || '', passphrase: process.env.SMSA_PASSPHRASE || '', accountNumber: process.env.SMSA_ACCOUNT_NUMBER || '', apiUrl: process.env.SMSA_API_URL || '' },
    aramex: { username: process.env.ARAMEX_USERNAME || '', password: process.env.ARAMEX_PASSWORD || '', accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || '', accountPin: process.env.ARAMEX_ACCOUNT_PIN || '', entity: process.env.ARAMEX_ENTITY || '', apiUrl: process.env.ARAMEX_API_URL || '' },
  },

  zatca: {
    apiUrl: process.env.ZATCA_API_URL || 'https://api.my.zatca.gov.sa/v2',
    environment: process.env.ZATCA_ENVIRONMENT || 'simulation',
    sellerName: process.env.ZATCA_SELLER_NAME || 'MUFASAL Tailoring',
    vatNumber: process.env.ZATCA_VAT_NUMBER || '310000000000003',
    sellerCategory: process.env.ZATCA_SELLER_CATEGORY || 'Retail',
    builderId: process.env.ZATCA_BUILDER_ID || '',
  },

  accounting: {
    quickbooks: { clientId: process.env.QUICKBOOKS_CLIENT_ID || '', clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '', companyId: process.env.QUICKBOOKS_COMPANY_ID || '' },
    qaid: { apiKey: process.env.QAID_API_KEY || '', apiUrl: process.env.QAID_API_URL || '' },
    quyoud: { apiKey: process.env.QUYOUD_API_KEY || '', apiUrl: process.env.QUYOUD_API_URL || '' },
    sap: { apiUrl: process.env.SAP_API_URL || '', username: process.env.SAP_USERNAME || '', password: process.env.SAP_PASSWORD || '' },
  },

  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
