import { Response, NextFunction } from 'express';
import { ProductService } from '../../services/ProductService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';

const SHOP_SCOPED_ROLES = ['MERCHANT', 'TAILOR', 'TAILOR_SHOP'];

export class ProductController {
  static async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, shopId: req.body.shopId || req.body.merchantId || req.user?.shopId };
      const product = await ProductService.createProduct(data);
      sendCreated(res, product, 'Product created');
    } catch (error) { next(error); }
  }

  static async getProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { categoryId, shopId, merchantId, search, minPrice, maxPrice, tags, page, limit, sort } = req.query;
      const allowedSort = ['smart', 'newest', 'price_asc', 'price_desc'];
      let effectiveShopId = (shopId || merchantId) as string | undefined;
      // ERP: التاجر/الخياط يرى منتجات محله فقط عند الطلب المصادَق
      if (!effectiveShopId && req.user && SHOP_SCOPED_ROLES.includes(req.user.role) && req.user.shopId) {
        effectiveShopId = req.user.shopId;
      }
      const result = await ProductService.getProducts({
        categoryId: categoryId as string, shopId: effectiveShopId, search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        tags: tags as string, page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        sort: allowedSort.includes(sort as string) ? (sort as any) : undefined,
      });
      sendPaginated(res, result.products, result.total, result.page, result.limit);
    } catch (error) { next(error); }
  }

  static async getProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      sendSuccess(res, product);
    } catch (error) { next(error); }
  }

  static async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      sendSuccess(res, product, 'Product updated');
    } catch (error) { next(error); }
  }

  static async deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.deleteProduct(req.params.id);
      sendSuccess(res, result, 'Product deactivated');
    } catch (error) { next(error); }
  }

  static async createVariant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const variant = await ProductService.createVariant(req.params.productId, req.body);
      sendCreated(res, variant, 'Variant created');
    } catch (error) { next(error); }
  }

  static async updateVariant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const variant = await ProductService.updateVariant(req.params.productId, req.params.variantId, req.body);
      sendSuccess(res, variant, 'Variant updated');
    } catch (error) { next(error); }
  }

  static async deleteVariant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.deleteVariant(req.params.productId, req.params.variantId);
      sendSuccess(res, result, 'Variant deleted');
    } catch (error) { next(error); }
  }

  static async adjustStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const movement = await ProductService.adjustStock(req.params.productId, req.body.type, req.body.quantity, req.body.reference, req.body.notes, req.user!.id);
      sendSuccess(res, movement, 'Stock adjusted');
    } catch (error) { next(error); }
  }

  static async getInventoryMovements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user?.shopId;
      if (!shopId) throw ApiError.badRequest('Shop context required');
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const movements = await ProductService.getInventoryMovements(shopId, limit);
      sendSuccess(res, movements);
    } catch (error) { next(error); }
  }

  static async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await ProductService.getCategories({});
      sendSuccess(res, categories);
    } catch (error) { next(error); }
  }

  static async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await ProductService.createCategory(req.body);
      sendCreated(res, category, 'Category created');
    } catch (error) { next(error); }
  }

  static async updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await ProductService.updateCategory(req.params.id, req.body);
      sendSuccess(res, category, 'Category updated');
    } catch (error) { next(error); }
  }

  static async deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.deleteCategory(req.params.id);
      sendSuccess(res, result, 'Category deactivated');
    } catch (error) { next(error); }
  }

  static async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await ProductService.getCart(req.user!.id);
      sendSuccess(res, cart);
    } catch (error) { next(error); }
  }

  static async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await ProductService.addToCart(req.user!.id, req.body.productId, req.body.quantity, req.body.variantId);
      sendSuccess(res, item, 'Item added to cart');
    } catch (error) { next(error); }
  }

  static async updateCartItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await ProductService.updateCartItem(req.user!.id, req.params.itemId, req.body.quantity);
      sendSuccess(res, item, 'Cart updated');
    } catch (error) { next(error); }
  }

  static async removeFromCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.removeFromCart(req.user!.id, req.params.itemId);
      sendSuccess(res, result, 'Item removed');
    } catch (error) { next(error); }
  }

  static async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.clearCart(req.user!.id);
      sendSuccess(res, result, 'Cart cleared');
    } catch (error) { next(error); }
  }
}
