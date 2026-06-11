import { Prisma } from '@prisma/client';

export interface ShopFilters {
  search?: string;
  city?: string;
  category?: string;
  isOpen?: boolean;
  isVerified?: boolean;
  minRating?: number;
  maxRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ShopUpdateData {
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  logo?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  isOpen?: boolean;
  commissionRate?: number;
  minOrderAmount?: number;
  deliveryRadius?: number;
}

export interface ShopServiceUpdateData {
  name?: string;
  nameAr?: string;
  description?: string;
  price?: number;
  duration?: number;
  isActive?: boolean;
}

export interface ShopVehicleUpdateData {
  type?: string;
  plateNumber?: string;
  driverName?: string;
  driverPhone?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  merchantId?: string;
  shopId?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductUpdateData {
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  categoryId?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  unit?: string;
  images?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
  tags?: string;
  isActive?: boolean;
}

export interface ProductVariantUpdateData {
  name?: string;
  sku?: string;
  price?: number;
  stockQuantity?: number;
  attributes?: Record<string, string>;
  images?: string[];
}

export interface CategoryUpdateData {
  name?: string;
  nameAr?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface GatewayResult {
  success: boolean;
  reference?: string;
  status?: string;
  message?: string;
}

export interface OrderFilters {
  status?: string;
  customerId?: string;
  shopId?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DeliveryProvider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export interface SupplierCreateData {
  name: string;
  nameAr?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export interface SupplierUpdateData {
  name?: string;
  nameAr?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  isActive?: boolean;
}

export interface SupplierProductData {
  productId?: string;
  name: string;
  nameAr?: string;
  sku?: string;
  supplierPrice: number;
  currency?: string;
  minOrderQuantity?: number;
  leadTimeDays?: number;
}

export interface POSOrderItem {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
}

export interface POSOrderData {
  sessionId: string;
  items: POSOrderItem[];
  paymentMethod?: string;
  customerId?: string;
  notes?: string;
}

export interface PurchaseOrderData {
  supplierId: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }[];
  expectedDeliveryDate?: string;
  notes?: string;
}

export interface ServiceWhereClause {
  shopId?: string;
  customerId?: string;
  serviceType?: string;
  status?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewAggregateResult {
  _avg: {
    shopRating: number | null;
    tailorRating: number | null;
    representativeRating: number | null;
  };
  _count: number;
}
