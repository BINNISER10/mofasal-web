import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth';
import { ProductController } from '../../controllers/v1/products.controller';

const router = Router();

const productSchema = z.object({
  merchantId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  images: z.array(z.string()).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'HIDDEN']).optional(),
  tags: z.string().optional(),
});

const variantSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  price: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  sku: z.string().optional(),
});

const stockSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: z.number().int().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().uuid().optional(),
  order: z.number().int().optional(),
});

router.get('/', optionalAuth, ProductController.getProducts);
router.get('/inventory/movements', authenticate, authorize('MERCHANT', 'ADMIN', 'TAILOR_SHOP'), ProductController.getInventoryMovements);
router.get('/:id', optionalAuth, ProductController.getProduct);
router.post('/', authenticate, authorize('MERCHANT', 'ADMIN'), validate(productSchema), ProductController.createProduct);
router.put('/:id', authenticate, authorize('MERCHANT', 'ADMIN'), ProductController.updateProduct);
router.delete('/:id', authenticate, authorize('MERCHANT', 'ADMIN'), ProductController.deleteProduct);

router.post('/:productId/variants', authenticate, authorize('MERCHANT', 'ADMIN'), validate(variantSchema), ProductController.createVariant);
router.put('/:productId/variants/:variantId', authenticate, authorize('MERCHANT', 'ADMIN'), ProductController.updateVariant);
router.delete('/:productId/variants/:variantId', authenticate, authorize('MERCHANT', 'ADMIN'), ProductController.deleteVariant);
router.post('/:productId/stock', authenticate, authorize('MERCHANT', 'ADMIN'), validate(stockSchema), ProductController.adjustStock);

router.get('/categories/list', ProductController.getCategories);
router.post('/categories', authenticate, authorize('ADMIN'), validate(categorySchema), ProductController.createCategory);
router.put('/categories/:id', authenticate, authorize('ADMIN'), ProductController.updateCategory);
router.delete('/categories/:id', authenticate, authorize('ADMIN'), ProductController.deleteCategory);

router.get('/cart/my', authenticate, ProductController.getCart);
router.post('/cart/add', authenticate, ProductController.addToCart);
router.put('/cart/item/:itemId', authenticate, ProductController.updateCartItem);
router.delete('/cart/item/:itemId', authenticate, ProductController.removeFromCart);
router.delete('/cart/clear', authenticate, ProductController.clearCart);

export default router;
