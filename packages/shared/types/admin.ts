import { Permission } from './auth';

export interface SystemModule {
  key: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  isEnabled: boolean;
  parentModuleKey?: string;
  order: number;
  icon?: string;
  route?: string;
}

export type SettingValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'SELECT';

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: SettingValueType;
  category: string;
  label: string;
  labelAr?: string;
  description?: string;
  isActive: boolean;
  dependsOn?: string;
  dependsValue?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureToggleDependency {
  key: string;
  requiredValue: string;
}

export interface FeatureToggle {
  key: string;
  name: string;
  category: string;
  isEnabled: boolean;
  dependencies: FeatureToggleDependency[];
  autoDisable: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SystemReport {
  type: string;
  dateRange: { from: string; to: string };
  metrics: Record<string, number>;
  generatedBy: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalShops: number;
  totalMerchants: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingOrders: number;
  [key: string]: number;
}
