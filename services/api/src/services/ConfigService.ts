import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';

export class ConfigService {
  static async getConfig(key: string) {
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    if (!config || !config.isActive) throw ApiError.notFound('Config not found');
    return this.parseValue(config);
  }

  static async getConfigsByCategory(category: string) {
    const configs = await prisma.systemConfig.findMany({
      where: { category, isActive: true },
      orderBy: { key: 'asc' },
    });
    return configs.map((c) => this.parseValue(c));
  }

  static async getAllConfigs() {
    const configs = await prisma.systemConfig.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' },
    });
    return configs.map((c) => this.parseValue(c));
  }

  static async setConfig(key: string, value: string, data?: {
    type?: string; category?: string; label?: string; labelAr?: string;
    description?: string; descriptionAr?: string; dependsOn?: string; dependsValue?: string;
  }) {
    const existing = await prisma.systemConfig.findUnique({ where: { key } });

    if (existing) {
      if (existing.dependsOn) {
        const dependency = await prisma.systemConfig.findUnique({ where: { key: existing.dependsOn } });
        if (!dependency || !dependency.isActive || (existing.dependsValue && dependency.value !== existing.dependsValue)) {
          throw ApiError.badRequest(`Config depends on ${existing.dependsOn}=${existing.dependsValue} which is not met`);
        }
      }

      return prisma.systemConfig.update({
        where: { key },
        data: { value, ...data, type: data?.type || existing.type },
      });
    }

    if (data?.dependsOn) {
      const dependency = await prisma.systemConfig.findUnique({ where: { key: data.dependsOn } });
      if (!dependency || !dependency.isActive || (data.dependsValue && dependency.value !== data.dependsValue)) {
        throw ApiError.badRequest(`Dependency ${data.dependsOn}=${data.dependsValue} not met`);
      }
    }

    return prisma.systemConfig.create({
      data: { key, value, type: data?.type || 'string', ...data },
    });
  }

  static async deleteConfig(key: string) {
    await prisma.systemConfig.update({ where: { key }, data: { isActive: false } });
    return { message: 'Config deleted' };
  }

  static async toggleConfig(key: string) {
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    if (!config) throw ApiError.notFound('Config not found');

    if (config.dependsOn && !config.isActive) {
      const dependency = await prisma.systemConfig.findUnique({ where: { key: config.dependsOn } });
      if (!dependency || !dependency.isActive || (config.dependsValue && dependency.value !== config.dependsValue)) {
        throw ApiError.badRequest(`Cannot enable: dependency ${config.dependsOn}=${config.dependsValue} not met`);
      }
    }

    const updated = await prisma.systemConfig.update({
      where: { key },
      data: { isActive: !config.isActive },
    });

    if (!updated.isActive) {
      await prisma.systemConfig.updateMany({
        where: { dependsOn: key, isActive: true },
        data: { isActive: false },
      });
    }

    return updated;
  }

  static async getModules() {
    return prisma.systemModule.findMany({
      where: { isEnabled: true },
      orderBy: { order: 'asc' },
    });
  }

  static async toggleModule(key: string, enabled: boolean) {
    const module_ = await prisma.systemModule.findUnique({ where: { key } });
    if (!module_) throw ApiError.notFound('Module not found');

    if (!enabled) {
      await prisma.systemModule.updateMany({
        where: { parentModuleKey: key },
        data: { isEnabled: false },
      });
    }

    if (enabled && module_.parentModuleKey) {
      const parent = await prisma.systemModule.findUnique({ where: { key: module_.parentModuleKey } });
      if (!parent || !parent.isEnabled) {
        throw ApiError.badRequest('Parent module must be enabled first');
      }
    }

    return prisma.systemModule.update({
      where: { key },
      data: { isEnabled: enabled },
    });
  }

  static async bulkUpdate(configs: Array<{ key: string; value: string }>) {
    const results = [];
    for (const config of configs) {
      try {
        const updated = await this.setConfig(config.key, config.value);
        results.push(updated);
      } catch (error) {
        logger.warn(`Failed to update config ${config.key}`, error);
      }
    }
    return results;
  }

  private static parseValue(config: { value: string; type: string; key: string; description?: string | null; createdAt?: Date | null; updatedAt?: Date | null; [key: string]: unknown }) {
    let parsedValue: string | number | boolean | Record<string, unknown>;
    if (config.type === 'number') parsedValue = Number(config.value);
    else if (config.type === 'boolean') parsedValue = config.value === 'true' || config.value === '1';
    else if (config.type === 'json') { try { parsedValue = JSON.parse(config.value); } catch { parsedValue = config.value; } }
    else parsedValue = config.value;

    return { ...config, parsedValue };
  }
}
