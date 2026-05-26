import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

export class UserService {
  static async getUsers(filters: { role?: string; status?: string; page?: number; limit?: number; search?: string }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: { id: true, name: true, phone: true, email: true, role: { select: { name: true } }, status: true, avatar: true, phoneVerified: true, emailVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const mapped = users.map((u) => ({ ...u, role: u.role.name }));

    return { users: mapped, total, page, limit };
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, phone: true, email: true, role: { select: { name: true } }, status: true, avatar: true, phoneVerified: true, emailVerified: true, createdAt: true },
    });
    if (!user) throw ApiError.notFound('User not found');
    return { ...user, role: user.role.name };
  }

  static async updateUser(id: string, data: { name?: string; email?: string; role?: string; status?: string; avatar?: string }) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.status) updateData.status = data.status;
    if (data.avatar) updateData.avatar = data.avatar;
    if (data.role) {
      const role = await prisma.role.findFirst({ where: { name: data.role } });
      if (role) updateData.roleId = role.id;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, phone: true, email: true, role: { select: { name: true } }, status: true, avatar: true },
    });
    return { ...user, role: user.role.name };
  }

  static async deleteUser(id: string) {
    await prisma.user.update({ where: { id }, data: { status: 'BANNED' as any } });
    return { message: 'User deactivated' };
  }

  static async getAddresses(userId: string) {
    return prisma.userAddress.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
  }

  static async createAddress(userId: string, data: any) {
    if (data.isDefault) {
      await prisma.userAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return prisma.userAddress.create({ data: { ...data, userId } });
  }

  static async updateAddress(userId: string, addressId: string, data: any) {
    const address = await prisma.userAddress.findFirst({ where: { id: addressId, userId } });
    if (!address) throw ApiError.notFound('Address not found');

    if (data.isDefault) {
      await prisma.userAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return prisma.userAddress.update({ where: { id: addressId }, data });
  }

  static async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.userAddress.findFirst({ where: { id: addressId, userId } });
    if (!address) throw ApiError.notFound('Address not found');
    await prisma.userAddress.delete({ where: { id: addressId } });
    return { message: 'Address deleted' };
  }

  static async getMeasurements(userId: string) {
    return prisma.userMeasurement.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  static async createMeasurement(userId: string, data: { name: string; data: any }) {
    return prisma.userMeasurement.create({ data: { userId, name: data.name, data: data.data } });
  }

  static async updateMeasurement(userId: string, measurementId: string, data: { name?: string; data?: any }) {
    const measurement = await prisma.userMeasurement.findFirst({ where: { id: measurementId, userId } });
    if (!measurement) throw ApiError.notFound('Measurement not found');
    return prisma.userMeasurement.update({ where: { id: measurementId }, data });
  }

  static async deleteMeasurement(userId: string, measurementId: string) {
    const measurement = await prisma.userMeasurement.findFirst({ where: { id: measurementId, userId } });
    if (!measurement) throw ApiError.notFound('Measurement not found');
    await prisma.userMeasurement.delete({ where: { id: measurementId } });
    return { message: 'Measurement deleted' };
  }
}
