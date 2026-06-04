/* eslint-disable @typescript-eslint/no-explicit-any */

const ROLE_USERS: Record<string, any> = {
  'test-admin-id': { id: 'test-admin-id', name: 'Test Admin', email: 'admin@test.com', status: 'ACTIVE', role: { name: 'ADMIN' }, shopId: 'test-shop', avatar: null, phone: '0501234567', password: '$2a$12$glwsvJa8iJ28YrMeihaPK.Yyb8mqNHG7qyJ6B0MbAIY7tqyZvHQcC' },
  'test-customer-id': { id: 'test-customer-id', name: 'Test Customer', email: 'customer@test.com', status: 'ACTIVE', role: { name: 'CUSTOMER' }, shopId: null, avatar: null, phone: '0501234568', password: '$2a$12$glwsvJa8iJ28YrMeihaPK.Yyb8mqNHG7qyJ6B0MbAIY7tqyZvHQcC' },
  'test-tailor-id': { id: 'test-tailor-id', name: 'Test Tailor', email: 'tailor@test.com', status: 'ACTIVE', role: { name: 'TAILOR_SHOP' }, shopId: 'test-shop', avatar: null, phone: '0501234569', password: '$2a$12$glwsvJa8iJ28YrMeihaPK.Yyb8mqNHG7qyJ6B0MbAIY7tqyZvHQcC' },
  'test-merchant-id': { id: 'test-merchant-id', name: 'Test Merchant', email: 'merchant@test.com', status: 'ACTIVE', role: { name: 'MERCHANT' }, shopId: 'test-shop', avatar: null, phone: '0501234570', password: '$2a$12$glwsvJa8iJ28YrMeihaPK.Yyb8mqNHG7qyJ6B0MbAIY7tqyZvHQcC' },
  'test-user-id': { id: 'test-user-id', name: 'Test Admin', email: 'admin@test.com', status: 'ACTIVE', role: { name: 'ADMIN' }, shopId: 'test-shop', avatar: null, phone: '0501234567', password: '$2a$12$glwsvJa8iJ28YrMeihaPK.Yyb8mqNHG7qyJ6B0MbAIY7tqyZvHQcC' },
  'customer-user-id': { id: 'customer-user-id', name: 'Test Customer', email: 'customer@test.com', status: 'ACTIVE', role: { name: 'CUSTOMER' }, shopId: null, avatar: null, phone: '0501234568', password: '$2a$12$glwsvJa8iJ28YrMeihaPK.Yyb8mqNHG7qyJ6B0MbAIY7tqyZvHQcC' },
};

const DEFAULT_ADMIN = ROLE_USERS['test-user-id'];

function createMockPrisma(): any {
  const mock: any = {
    employee: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'emp-1', ...d.data })), update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: d.where?.id || 'emp-1', ...d.data })), delete: jest.fn().mockResolvedValue({}), count: jest.fn().mockResolvedValue(0) },
    department: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'dept-1', ...d.data })), update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'dept-1', ...d.data })), delete: jest.fn().mockResolvedValue({}), count: jest.fn().mockResolvedValue(0) },
    attendance: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'att-1', ...d.data })), update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'att-1', ...d.data })) },
    leaveRequest: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'leave-1', ...d.data })), update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'leave-1', ...d.data })) },
    payroll: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'pay-1', ...d.data })), update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'pay-1', ...d.data })) },
    purchaseOrder: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'po-1', ...d.data })), update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'po-1', ...d.data })), delete: jest.fn().mockResolvedValue({}), count: jest.fn().mockResolvedValue(0) },
    purchaseOrderItem: { createMany: jest.fn().mockResolvedValue({ count: 0 }), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    supplier: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'supp-1', ...d.data })), update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'supp-1', ...d.data })), delete: jest.fn().mockResolvedValue({}), count: jest.fn().mockResolvedValue(0) },
    supplierProduct: { create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'sp-1', ...d.data })), delete: jest.fn().mockResolvedValue({}), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    pOSSession: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'session-1', ...d.data })), update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'session-1', ...d.data })), count: jest.fn().mockResolvedValue(0) },
    pOSOrder: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'order-1', ...d.data })) },
    user: {
      findUnique: jest.fn().mockImplementation((query: any) => {
        const id = query.where?.id;
        if (id && ROLE_USERS[id]) {
          return Promise.resolve({ ...ROLE_USERS[id] });
        }
        if (query.where?.email) {
          const match = Object.values(ROLE_USERS).find((u) => u.email === query.where.email);
          return Promise.resolve(match ? { ...match } : null);
        }
        if (query.where?.phone) {
          const match = Object.values(ROLE_USERS).find((u) => u.phone === query.where.phone);
          return Promise.resolve(match ? { ...match } : null);
        }
        return Promise.resolve({ ...DEFAULT_ADMIN });
      }),
      findFirst: jest.fn().mockImplementation((query: any) => {
        if (query.where?.OR) {
          for (const condition of query.where.OR) {
            if (condition.email) {
              const match = Object.values(ROLE_USERS).find((u) => u.email === condition.email);
              if (match) return Promise.resolve({ ...match });
            }
            if (condition.phone) {
              const match = Object.values(ROLE_USERS).find((u) => u.phone === condition.phone);
              if (match) return Promise.resolve({ ...match });
            }
          }
        }
        return Promise.resolve(null);
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'user-1', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: d.where?.id || 'user-1', ...d.data, role: { name: 'ADMIN' } })),
    },
    role: {
      findUnique: jest.fn().mockResolvedValue({ id: 'role-1', name: 'ADMIN' }),
      findFirst: jest.fn().mockImplementation((query: any) => {
        const name = query.where?.name || 'ADMIN';
        return Promise.resolve({ id: `role-${name.toLowerCase()}`, name });
      }),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'role-1', ...d.data })),
    },
    shop: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockImplementation((query: any) => {
        if (query.where?.id) {
          return Promise.resolve({ id: query.where.id, name: 'Test Shop', isVerified: false, isOpen: true, rating: 0, commissionRate: 0 });
        }
        return Promise.resolve(null);
      }),
      findFirst: jest.fn().mockImplementation((query: any) => {
        return Promise.resolve({ id: 'shop-1', name: 'Test Shop', isVerified: false, isOpen: true, rating: 0 });
      }),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'shop-1', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: d.where?.id || 'shop-1', ...d.data })),
      count: jest.fn().mockResolvedValue(0),
    },
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'prod-1', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'prod-1', ...d.data })),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    order: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockImplementation((query: any) => {
        const id = query.where?.id;
        if (id && (id.includes('-') && id.length > 20) || id === 'test-order-id') {
          return Promise.resolve({
            id,
            orderNumber: 'ORD-001',
            status: 'COMPLETED',
            customerId: 'test-admin-id',
            shopId: 'test-shop',
            totalAmount: 500,
            vatAmount: 75,
            grandTotal: 575,
            paymentStatus: 'PAID',
            paymentMethod: null,
            items: [],
            customer: { id: 'test-admin-id', name: 'Test Admin' },
            shop: { id: 'test-shop', name: 'Test Shop', lat: 24.7136, lng: 46.6753, shopVehicles: [{ id: 'sv-1', driverName: 'Test Driver', driverPhone: '0501111111', isActive: true }] },
          });
        }
        return Promise.resolve(null);
      }),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'ord-1', orderNumber: 'ORD-001', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'ord-1', ...d.data })),
      count: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue({ _sum: { grandTotal: 0 }, _count: 0 }),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    account: { findMany: jest.fn().mockResolvedValue([{ id: 'acc-1000', shopId: 'test-shop', code: '1000', name: 'النقدية', type: 'ASSET', balance: 0 }, { id: 'acc-2000', shopId: 'test-shop', code: '2000', name: 'الذمم الدائنة', type: 'LIABILITY', balance: 0 }]), findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'acc-1', ...d.data })), createMany: jest.fn().mockResolvedValue({ count: 0 }), update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'acc-1', ...d.data })) },
    journalEntry: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'je-1', ...(d.data || {}), lines: [] })) },
    journalLine: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'jl-1', ...(d.data || {}) })) },
    aIProfile: { findUnique: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]), upsert: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'aip-1', ...(d.create || {}) })) },
    userBehaviorLog: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'ubl-1', ...(d.data || {}) })) },
    coupon: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'cpn-1', code: 'TEST', type: 'PERCENTAGE', value: 10, isActive: true, ...(d.data || {}) })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'cpn-1', ...(d.data || {}) })),
      count: jest.fn().mockResolvedValue(0),
    },
    couponUsage: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'cu-1', ...(d.data || {}) })),
      count: jest.fn().mockResolvedValue(0),
    },
    loyaltyBalance: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'lb-1', points: 0, lifetimePoints: 0, tier: 'BRONZE', ...(d.data || {}) })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'lb-1', ...(d.data || {}) })),
      aggregate: jest.fn().mockResolvedValue({ _sum: { points: 0 }, _count: 0 }),
      count: jest.fn().mockResolvedValue(0),
    },
    loyaltyTransaction: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'lt-1', ...(d.data || {}) })),
      aggregate: jest.fn().mockResolvedValue({ _sum: { points: 0 }, _count: 0 }),
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    notification: {
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'notif-1', ...d.data })),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockImplementation((query: any) => {
        if (query.where?.id) {
          return Promise.resolve({ id: query.where.id, userId: query.where.userId || 'test-user-id', isRead: false, title: 'Test Notification' });
        }
        return Promise.resolve(null);
      }),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'notif-1', isRead: true, ...d.data })),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
    },
    conversation: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'conv-1', ...d.data, messages: [] })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'conv-1', ...d.data })),
    },
    message: {
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'msg-1', ...d.data, sender: { id: 'test-user-id', name: 'Test Admin', avatar: null, role: 'ADMIN' } })),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'msg-1', ...d.data })),
      count: jest.fn().mockResolvedValue(0),
    },
    review: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'rev-1', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'rev-1', ...d.data })),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue({ _avg: { shopRating: 5, tailorRating: 4, representativeRating: 4 }, _count: 1 }),
    },
    paymentTransaction: {
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'ptx-1', ...d.data })),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'ptx-1', ...d.data })),
      count: jest.fn().mockResolvedValue(0),
    },
    invoice: {
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'inv-1', ...d.data })),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
    },
    service: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'svc-1', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'svc-1', ...d.data })),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    measurement: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'meas-1', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'meas-1', ...d.data })),
      upsert: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'meas-1', ...d.create })),
    },
    userMeasurement: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'umeas-1', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'umeas-1', ...d.data })),
      upsert: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'umeas-1', ...d.create })),
    },
    address: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'addr-1', ...d.data })),
    },
    userAddress: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'uaddr-1', ...d.data })),
    },
    deliveryRequest: {
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'dr-1', ...d.data })),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockImplementation((query: any) => {
        if (query.where?.orderId) return Promise.resolve(null);
        return Promise.resolve(null);
      }),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'dr-1', ...d.data })),
      count: jest.fn().mockResolvedValue(0),
    },
    shopVehicle: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'sv-1', ...d.data })),
    },
    serviceRequest: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'sr-1', ...d.data })),
    },
    orderItem: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'oi-1', ...d.data })),
      groupBy: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 0, totalPrice: 0 }, _count: 0 }),
    },
    taxRecord: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'tax-1', ...d.data })),
    },
    systemSetting: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'ss-1', ...d.create })),
    },
    moduleStatus: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'ms-1', ...d.create })),
    },
    systemConfig: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'cfg-1', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'cfg-1', ...d.data })),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    systemModule: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'mod-1', ...d.data })),
      update: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'mod-1', ...d.data })),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
    },
    auditLog: {
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'al-1', ...d.data })),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    analyticsEvent: {
      create: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 'ae-1', ...d.data })),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }]),
    $disconnect: jest.fn(),
  };

  mock.$transaction = jest.fn((fn: any) => {
    if (Array.isArray(fn)) {
      return Promise.all(fn);
    }
    return fn(mock);
  });

  return mock;
}

const mockPrisma = createMockPrisma();
export default mockPrisma;
export { createMockPrisma };
