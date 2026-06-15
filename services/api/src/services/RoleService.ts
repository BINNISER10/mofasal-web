import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { DEFAULT_ROLE_PERMISSIONS } from '../config/permissions';

const SYSTEM_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'TAILOR_SHOP', 'TAILOR', 'MERCHANT', 'REPRESENTATIVE', 'CUSTOMER', 'STAFF']);

const DISPLAY_NAMES: Record<string, { en: string; ar: string }> = {
  ADMIN: { en: 'System Admin', ar: 'مدير النظام' },
  TAILOR_SHOP: { en: 'Tailor Shop Manager', ar: 'مدير محل الخياطة' },
  TAILOR: { en: 'Tailor', ar: 'خياط' },
  MERCHANT: { en: 'Merchant', ar: 'تاجر' },
  REPRESENTATIVE: { en: 'Representative', ar: 'مندوب' },
  CUSTOMER: { en: 'Customer', ar: 'عميل' },
  STAFF: { en: 'Staff', ar: 'موظف' },
};

function mapRole(role: {
  id: string;
  name: string;
  displayName?: string | null;
  displayNameAr?: string | null;
  permissions: unknown;
  isSystem?: boolean;
  createdAt?: Date;
  _count?: { users: number };
}) {
  const labels = DISPLAY_NAMES[role.name];
  return {
    id: role.id,
    name: role.name,
    displayName: role.displayName || labels?.en || role.name,
    displayNameAr: role.displayNameAr || labels?.ar || role.name,
    permissions: role.permissions as Record<string, boolean | string[]>,
    userCount: role._count?.users ?? 0,
    isSystem: role.isSystem ?? SYSTEM_ROLES.has(role.name),
    createdAt: role.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

export class RoleService {
  static async getRoles(shopId?: string) {
    const roles = await prisma.role.findMany({
      where: shopId ? { shopId } : undefined,
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return roles.map(mapRole);
  }

  static async getRole(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw ApiError.notFound('Role not found');
    return mapRole(role);
  }

  static async createRole(shopId: string, data: {
    name: string;
    displayName?: string;
    displayNameAr?: string;
    permissions: Record<string, boolean | string[]>;
    parentId?: string;
  }) {
    const existing = await prisma.role.findFirst({ where: { shopId, name: data.name } });
    if (existing) throw ApiError.badRequest('Role name already exists');
    const role = await prisma.role.create({
      data: {
        shopId,
        name: data.name.toUpperCase().replace(/\s+/g, '_'),
        displayName: data.displayName,
        displayNameAr: data.displayNameAr,
        permissions: data.permissions,
        parentId: data.parentId,
        isSystem: false,
      },
      include: { _count: { select: { users: true } } },
    });
    return mapRole(role);
  }

  static async updateRole(id: string, data: Partial<{
    displayName: string;
    displayNameAr: string;
    permissions: Record<string, boolean | string[]>;
    parentId: string;
  }>) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw ApiError.notFound('Role not found');
    if ((role.isSystem ?? SYSTEM_ROLES.has(role.name)) && data.permissions) {
      throw ApiError.forbidden('Cannot modify system role permissions');
    }
    const updated = await prisma.role.update({
      where: { id },
      data,
      include: { _count: { select: { users: true } } },
    });
    return mapRole(updated);
  }

  static async deleteRole(id: string) {
    const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
    if (!role) throw ApiError.notFound('Role not found');
    if (role.isSystem ?? SYSTEM_ROLES.has(role.name)) throw ApiError.forbidden('Cannot delete system role');
    if (role._count.users > 0) throw ApiError.badRequest('Role has assigned users');
    await prisma.role.delete({ where: { id } });
    return { message: 'Role deleted' };
  }

  static getDefaultPermissions(roleName: string) {
    return DEFAULT_ROLE_PERMISSIONS[roleName] || {};
  }
}
