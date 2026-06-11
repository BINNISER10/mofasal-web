import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

interface ProductWhereClause {
  isActive?: boolean;
  categoryId?: string;
  shopId?: string;
  visibility?: string;
  price?: { gte?: number; lte?: number };
  OR?: object[];
}

export class ProductService {
  static async createProduct(data: {
    shopId?: string; name: string; nameAr?: string; description?: string; categoryId?: string;
    price: number; costPrice?: number; stockQuantity?: number; unit?: string;
    images?: string[]; visibility?: string; tags?: string;
  }) {
    return prisma.product.create({
      data: {
        shopId: data.shopId || (await this.getDefaultShopId()),
        name: data.name, nameAr: data.nameAr, description: data.description, categoryId: data.categoryId,
        price: data.price, costPrice: data.costPrice || 0,
        stockQuantity: data.stockQuantity || 0, unit: data.unit || 'piece',
        sku: `SKU-${Date.now()}`,
        type: 'PHYSICAL',
        images: data.images || [], visibility: data.visibility || 'PUBLIC',
        tags: data.tags,
      },
      include: { category: true, variants: true },
    });
  }

  static async getProducts(filters: {
    categoryId?: string; shopId?: string; search?: string; minPrice?: number; maxPrice?: number;
    tags?: string; isActive?: boolean; page?: number; limit?: number; visibility?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: ProductWhereClause = { isActive: true };
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.shopId) where.shopId = filters.shopId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.visibility) where.visibility = filters.visibility;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { nameAr: { contains: filters.search, mode: 'insensitive' } },
        { tags: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true, variants: true, shop: { select: { id: true, name: true, logo: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  static async searchProducts(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameAr: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip, take: limit,
        include: { category: true, variants: true, shop: { select: { id: true, name: true, logo: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({
        where: { isActive: true, OR: [{ name: { contains: query, mode: 'insensitive' } }, { nameAr: { contains: query, mode: 'insensitive' } }] },
      }),
    ]);
    return { products, total, page, limit };
  }

  static async getProductsByCategory(categoryId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId, isActive: true },
        skip, take: limit,
        include: { category: true, variants: true, shop: { select: { id: true, name: true, logo: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: { categoryId, isActive: true } }),
    ]);
    return { products, total, page, limit };
  }

  static async getMerchantProducts(merchantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { shopId: merchantId, isActive: true },
        skip, take: limit,
        include: { category: true, variants: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: { shopId: merchantId, isActive: true } }),
    ]);
    return { products, total, page, limit };
  }

  static async updateStockSimple(productId: string, stock: number) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Product not found');
    return prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: stock },
    });
  }

  static async toggleVisibility(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Product not found');
    const newVisibility = product.visibility === 'PUBLIC' ? 'HIDDEN' : 'PUBLIC';
    return prisma.product.update({
      where: { id: productId },
      data: { visibility: newVisibility },
    });
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        shop: { select: { id: true, name: true, logo: true, nameAr: true } },
        inventoryMovements: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  }

  static async updateProduct(id: string, data: Partial<{
    name: string;
    nameAr: string;
    description: string;
    categoryId: string;
    price: number;
    compareAtPrice: number;
    costPrice: number;
    stockQuantity: number;
    unit: string;
    images: string[];
    visibility: string;
    tags: string;
    isActive: boolean;
  }>) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Product not found');
    return prisma.product.update({ where: { id }, data, include: { category: true, variants: true } });
  }

  static async deleteProduct(id: string) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return { message: 'Product deactivated' };
  }

  static async createVariant(productId: string, data: { name: string; price?: number; stock?: number; sku?: string }) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Product not found');
    return prisma.productVariant.create({ data: { ...data, productId, stock: data.stock || 0 } });
  }

  static async updateVariant(productId: string, variantId: string, data: Partial<{
    name: string;
    sku: string;
    price: number;
    stockQuantity: number;
    attributes: Record<string, string>;
    images: string[];
  }>) {
    const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!variant) throw ApiError.notFound('Variant not found');
    return prisma.productVariant.update({ where: { id: variantId }, data });
  }

  static async deleteVariant(productId: string, variantId: string) {
    const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!variant) throw ApiError.notFound('Variant not found');
    await prisma.productVariant.delete({ where: { id: variantId } });
    return { message: 'Variant deleted' };
  }

  static async adjustStock(productId: string, type: 'IN' | 'OUT', quantity: number, reference?: string, notes?: string, createdById?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Product not found');

    if (type === 'OUT' && product.stockQuantity < quantity) {
      throw ApiError.badRequest('Insufficient stock');
    }

    const [movement] = await Promise.all([
      prisma.inventoryMovement.create({
        data: { productId, type: type as 'IN' | 'OUT', quantity, reference, notes, createdById },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stockQuantity: type === 'IN' ? product.stockQuantity + quantity : product.stockQuantity - quantity },
      }),
    ]);

    return movement;
  }

  static async getCategories(filters: { parentId?: string; isActive?: boolean }) {
    const where: { parentId?: string; isActive?: boolean } = {};
    if (filters.parentId !== undefined) where.parentId = filters.parentId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    return prisma.category.findMany({
      where,
      include: { children: true, _count: { select: { products: true } } },
      orderBy: { order: 'asc' },
    });
  }

  static async createCategory(data: { name: string; nameAr?: string; slug: string; description?: string; image?: string; parentId?: string; order?: number }) {
    return prisma.category.create({ data });
  }

  static async updateCategory(id: string, data: Partial<{
    name: string;
    nameAr: string;
    description: string;
    image: string;
    sortOrder: number;
    isActive: boolean;
  }>) {
    return prisma.category.update({ where: { id }, data });
  }

  static async deleteCategory(id: string) {
    await prisma.category.update({ where: { id }, data: { isActive: false } });
    return { message: 'Category deactivated' };
  }

  static async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { category: true } } } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId }, include: { items: { include: { product: { include: { category: true } } } } } });
    }
    return cart;
  }

  static async addToCart(userId: string, productId: string, quantity: number, variantId?: string) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId || null },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      });
    }

    return prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity },
      include: { product: true },
    });
  }

  static async updateCartItem(userId: string, itemId: string, quantity: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw ApiError.notFound('Cart not found');

    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw ApiError.notFound('Cart item not found');

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return { message: 'Item removed' };
    }

    return prisma.cartItem.update({ where: { id: itemId }, data: { quantity }, include: { product: true } });
  }

  static async removeFromCart(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw ApiError.notFound('Cart not found');
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw ApiError.notFound('Cart item not found');
    await prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed' };
  }

  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { message: 'Cart cleared' };
  }

  private static async getDefaultShopId(): Promise<string> {
    const shop = await prisma.shop.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!shop) throw ApiError.internal('No shop available');
    return shop.id;
  }
}
