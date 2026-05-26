export enum ProductCategory {
  FABRICS = 'FABRICS',
  THREADS = 'THREADS',
  BUTTONS = 'BUTTONS',
  ACCESSORIES = 'ACCESSORIES',
  ZIPPERS = 'ZIPPERS',
  LININGS = 'LININGS',
  LACES = 'LACES',
  RIBBONS = 'RIBBONS',
  ELASTICS = 'ELASTICS',
  OTHERS = 'OTHERS',
}

export enum ProductVisibility {
  PUBLIC = 'PUBLIC',
  TAILORS_ONLY = 'TAILORS_ONLY',
}

export interface Product {
  id: string;
  merchantId: string;
  merchantName: string;
  category: ProductCategory;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  unit: string;
  minOrderQuantity?: number;
  images: string[];
  tags: string[];
  visibility: ProductVisibility;
  isActive: boolean;
  hasVariants: boolean;
  rating: number;
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  nameAr?: string;
  value: string;
  price: number;
  stockQuantity: number;
  sku: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  productCount: number;
}

export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: InventoryMovementType;
  quantity: number;
  reference: string;
  referenceType: string;
  notes?: string;
  createdById: string;
  createdAt: string;
}

export interface CreateProductInput {
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  unit: string;
  minOrderQuantity?: number;
  images: string[];
  tags?: string[];
  visibility: ProductVisibility;
  isActive?: boolean;
  hasVariants?: boolean;
  variants?: Omit<ProductVariant, 'id' | 'productId'>[];
}

export interface UpdateProductInput {
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  category?: ProductCategory;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  unit?: string;
  minOrderQuantity?: number;
  images?: string[];
  tags?: string[];
  visibility?: ProductVisibility;
  isActive?: boolean;
  hasVariants?: boolean;
}

export interface ProductFilter {
  category?: ProductCategory;
  merchantId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  visibility?: ProductVisibility;
  isActive?: boolean;
  tags?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}
