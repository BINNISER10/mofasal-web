// خادم Express الموحّد (Node.js + Prisma) — المنفذ 4001
// Local dev: http://10.0.2.2:4001/api/v1 (Android emulator)
// Local dev: http://localhost:4001/api/v1 (iOS simulator)
// Production: https://api.mufasal.com/api/v1
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:4001/api/v1'
  : 'https://api.mufasal.com/api/v1';

export const API_TIMEOUT = 30000;

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Language': 'ar',
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/profile',
    OTP_SEND: '/auth/send-verification',
    OTP_VERIFY: '/auth/verify-phone',
  },
  SHOPS: {
    LIST: '/shops',
    SEARCH: '/shops/search',
    NEARBY: '/shops/nearby',
    DETAILS: (id: string) => `/shops/${id}`,
    REVIEWS: (id: string) => `/shops/${id}/reviews`,
    SERVICES: (id: string) => `/shops/${id}/services`,
  },
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAILS: (id: string) => `/orders/${id}`,
    TRACKING: (id: string) => `/orders/${id}/tracking`,
    STATUS: (id: string) => `/orders/${id}/status`,
    CONFIRM: (id: string) => `/orders/${id}/confirm`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
  PRODUCTS: {
    LIST: '/products',
    SEARCH: '/products/search',
    CATEGORY: (cat: string) => `/products/category/${cat}`,
    DETAILS: (id: string) => `/products/${id}`,
    MERCHANT: (id: string) => `/products/merchant/${id}`,
  },
  DELIVERY: {
    CREATE: '/delivery',
    TRACK: (id: string) => `/delivery/${id}/track`,
    PROVIDERS: '/delivery/providers',
    ESTIMATE: '/delivery/estimate',
  },
  PAYMENTS: {
    PROCESS: '/payments/process',
    METHODS: '/payments/methods',
    TRANSACTIONS: '/payments/transactions',
    CONFIRM: '/payments/confirm',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
  MEASUREMENTS: {
    LIST: '/measurements',
    CREATE: '/measurements',
    UPDATE: (id: string) => `/measurements/${id}`,
    DELETE: (id: string) => `/measurements/${id}`,
  },
  ADDRESSES: {
    LIST: '/addresses',
    CREATE: '/addresses',
    UPDATE: (id: string) => `/addresses/${id}`,
    DELETE: (id: string) => `/addresses/${id}`,
    SET_DEFAULT: (id: string) => `/addresses/${id}/default`,
  },
};
