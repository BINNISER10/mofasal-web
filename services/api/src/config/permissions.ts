/**
 * Centralized RBAC permission catalog.
 *
 * These code-level defaults act as a SAFE FALLBACK: even if a role record in the
 * database has no `permissions` seeded yet, `requirePermission` will still grant
 * access based on this map — so applying the middleware can never lock out a
 * legitimate role. Database `permissions` (Json) override these defaults per-shop.
 */

export type PermissionMap = Record<string, boolean>;

// All known permission keys (resource-level).
export const PERMISSIONS = {
  ORDERS: 'orders',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  FINANCES: 'finances',
  ACCOUNTING: 'accounting',
  REPORTS: 'reports',
  HR: 'hr',
  STAFF: 'staff',
  PROCUREMENT: 'procurement',
  SUPPLIERS: 'suppliers',
  POS: 'pos',
  USERS: 'users',
  SHOPS: 'shops',
  SETTINGS: 'settings',
  B2B: 'b2b',
  MANUFACTURING: 'manufacturing',
  SERVICES: 'services',
  MEASUREMENTS: 'measurements',
  AI: 'ai',
} as const;

const ALL: PermissionMap = { all: true };

/**
 * Default permissions per role name. Role names match `req.user.role`
 * (i.e. the `Role.name` stored in the database / encoded in the JWT).
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionMap> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL,

  TAILOR_SHOP: {
    orders: true, products: true, inventory: true,
    finances: true, accounting: true, reports: true,
    hr: true, staff: true, procurement: true, suppliers: true,
    manufacturing: true, pos: true, settings: true, services: true, measurements: true,
    b2b: true,
  },

  TAILOR: {
    orders: true, products: true, inventory: true,
    finances: true, reports: true,
    hr: true, staff: true, procurement: true, suppliers: true,
    manufacturing: true, settings: true, services: true, measurements: true,
    b2b: true,
  },

  STAFF: {
    orders: true, products: true, inventory: true,
    reports: true, services: true, measurements: true,
  },

  MERCHANT: {
    products: true, inventory: true, finances: true,
    accounting: true, reports: true, procurement: true,
    suppliers: true, pos: true, b2b: true, settings: true,
  },

  REPRESENTATIVE: {
    services: true, orders: true, measurements: true,
  },

  CUSTOMER: {
    orders: true, measurements: true, ai: true,
  },
};

/**
 * Resolve the effective permission map for a role: DB permissions take
 * precedence, falling back to the code-level defaults for that role.
 */
export function resolvePermissions(
  roleName: string,
  dbPermissions?: Record<string, unknown> | null
): PermissionMap {
  const defaults = DEFAULT_ROLE_PERMISSIONS[roleName] || {};
  const fromDb = (dbPermissions as PermissionMap) || {};
  return { ...defaults, ...fromDb };
}
