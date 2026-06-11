/**
 * Centralized RBAC permission catalog.
 *
 * These code-level defaults act as a SAFE FALLBACK: even if a role record in the
 * database has no `permissions` seeded yet, `requirePermission` will still grant
 * access based on this map — so applying the middleware can never lock out a
 * legitimate role. Database `permissions` (Json) override these defaults per-shop.
 *
 * New format: module:action (e.g., orders:create, payroll:approve)
 */

export type PermissionMap = Record<string, boolean | string[]>;

// All modules
export const MODULES = [
  'orders',
  'products',
  'inventory',
  'manufacturing',
  'hr',
  'payroll',
  'accounting',
  'reports',
  'settings',
  'roles',
  'pos',
  'procurement',
  'b2b',
  'services',
  'measurements',
  'ai',
] as const;

// All actions
export const ACTIONS = ['view', 'create', 'update', 'delete', 'approve', 'export'] as const;

// Generate all possible permission keys
export const PERMISSIONS: Record<string, string> = MODULES.reduce((acc, module) => {
  ACTIONS.forEach((action) => {
    acc[`${module.toUpperCase()}_${action.toUpperCase()}`] = `${module}:${action}`;
  });
  return acc;
}, {} as Record<string, string>);

const ALL: PermissionMap = { all: true };

/**
 * Helper to create a permission set for a module
 */
function modulePerms(actions: string[]): string[] {
  return actions;
}

/**
 * Default permissions per role name using module:action format.
 * Role names match `req.user.role` (i.e. the `Role.name` stored in the database).
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionMap> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL,

  TAILOR_SHOP: {
    orders: modulePerms(ACTIONS),
    products: modulePerms(ACTIONS),
    inventory: modulePerms(ACTIONS),
    manufacturing: modulePerms(ACTIONS),
    hr: modulePerms(ACTIONS),
    payroll: ['view', 'approve'],
    accounting: modulePerms(ACTIONS),
    reports: modulePerms(ACTIONS),
    settings: modulePerms(ACTIONS),
    roles: ['view'],
    pos: modulePerms(ACTIONS),
    procurement: modulePerms(ACTIONS),
    services: modulePerms(ACTIONS),
    measurements: modulePerms(ACTIONS),
  },

  TAILOR: {
    orders: ['view', 'update'],
    products: ['view'],
    inventory: ['view'],
    manufacturing: ['view', 'update'],
    hr: ['view'],
    services: ['view'],
    measurements: ['view', 'create'],
  },

  STAFF: {
    orders: ['view'],
    products: ['view'],
    inventory: ['view'],
    reports: ['view'],
    services: ['view'],
    measurements: ['view'],
  },

  MERCHANT: {
    products: modulePerms(ACTIONS),
    inventory: modulePerms(ACTIONS),
    accounting: modulePerms(ACTIONS),
    reports: modulePerms(ACTIONS),
    procurement: modulePerms(ACTIONS),
    pos: modulePerms(ACTIONS),
    b2b: modulePerms(ACTIONS),
    settings: modulePerms(ACTIONS),
  },

  REPRESENTATIVE: {
    services: ['view', 'create'],
    orders: ['view', 'create'],
    measurements: ['view', 'create'],
  },

  CUSTOMER: {
    orders: ['view', 'create'],
    measurements: ['view', 'create'],
    ai: ['view'],
  },
};

/**
 * Check if a role has a specific permission (module:action format)
 */
export function hasPermission(
  rolePermissions: PermissionMap,
  permission: string
): boolean {
  // If all permissions are granted
  if (rolePermissions.all === true) return true;

  const [module, action] = permission.split(':');
  if (!module || !action) return false;

  const modulePerms = rolePermissions[module];
  if (!modulePerms) return false;

  // If module permissions is an array of actions
  if (Array.isArray(modulePerms)) {
    return modulePerms.includes(action);
  }

  // Legacy boolean format (backward compatibility)
  if (typeof modulePerms === 'boolean') {
    return modulePerms;
  }

  return false;
}

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
