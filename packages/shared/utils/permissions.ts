import { Permission, UserRole } from '../types/auth';

export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((p) => userPermissions.includes(p));
}

const MODULE_PERMISSION_MAP: Record<string, Permission> = {
  users: Permission.MANAGE_USERS,
  orders: Permission.MANAGE_ORDERS,
  inventory: Permission.MANAGE_INVENTORY,
  finances: Permission.MANAGE_FINANCES,
  settings: Permission.MANAGE_SETTINGS,
  reports: Permission.VIEW_REPORTS,
  staff: Permission.MANAGE_STAFF,
  delivery: Permission.MANAGE_DELIVERY,
  payments: Permission.MANAGE_PAYMENTS,
  products: Permission.MANAGE_PRODUCTS,
  reviews: Permission.MANAGE_REVIEWS,
  marketplace: Permission.MANAGE_MARKETPLACE,
  audit: Permission.VIEW_AUDIT_LOGS,
  modules: Permission.MANAGE_MODULES,
};

export function canAccessModule(userRole: UserRole, moduleKey: string): boolean {
  if (userRole === UserRole.SUPER_ADMIN) return true;
  const required = MODULE_PERMISSION_MAP[moduleKey];
  if (!required) return false;
  return hasPermission(ROLE_PERMISSIONS[userRole] ?? [], required);
}

import { ROLE_PERMISSIONS } from '../constants/permissions';

export function filterByPermissions<T>(
  items: T[],
  userPermissions: Permission[],
  itemPermissionKey: keyof T
): T[] {
  return items.filter((item) => {
    const perm = item[itemPermissionKey];
    if (typeof perm === 'string') {
      return userPermissions.includes(perm as Permission);
    }
    return true;
  });
}

export function canManageUser(
  actorRole: UserRole,
  targetRole: UserRole
): boolean {
  const hierarchy: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 100,
    [UserRole.ADMIN]: 80,
    [UserRole.MANAGER]: 60,
    [UserRole.TAILOR_SHOP]: 50,
    [UserRole.MERCHANT]: 40,
    [UserRole.TAILOR]: 30,
    [UserRole.STAFF]: 20,
    [UserRole.CUSTOMER]: 10,
  };
  return (hierarchy[actorRole] ?? 0) > (hierarchy[targetRole] ?? 0);
}
