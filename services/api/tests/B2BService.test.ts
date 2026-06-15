import { B2BService } from '../src/services/B2BService';
import prisma from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    shop: { findUnique: jest.fn(), findMany: jest.fn() },
    product: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    pricingTier: { findFirst: jest.fn() },
    fabricSupplyOrder: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  },
}));

describe('B2BService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: (tx: typeof prisma) => unknown) => fn(prisma));
  });

  it('generateOrderNumber should start with B2B-', () => {
    expect(B2BService.generateOrderNumber()).toMatch(/^B2B-/);
  });

  it('create should reject same merchant and buyer shop', async () => {
    await expect(
      B2BService.create({
        buyerUserId: 'u1',
        buyerShopId: 'shop-1',
        merchantShopId: 'shop-1',
        items: [{ productId: 'p1', quantity: 3 }],
      }),
    ).rejects.toThrow('لا يمكن طلب القماش من نفس المتجر');
  });

  it('create should build order with line items', async () => {
    (prisma.shop.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'merchant-1', name: 'متجر', city: 'الرياض' })
      .mockResolvedValueOnce({ id: 'buyer-1', name: 'خياط', address: 'شارع', city: 'الرياض' });
    (prisma.product.findFirst as jest.Mock).mockResolvedValue({
      id: 'prod-1',
      name: 'Cotton',
      nameAr: 'قطن',
      price: 100,
      stockQuantity: 50,
      unit: 'meter',
    });
    (prisma.pricingTier.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.fabricSupplyOrder.create as jest.Mock).mockResolvedValue({
      id: 'b2b-1',
      orderNumber: 'B2B-TEST',
      status: 'PENDING',
      items: [],
    });

    const order = await B2BService.create({
      buyerUserId: 'u1',
      buyerShopId: 'buyer-1',
      merchantShopId: 'merchant-1',
      items: [{ productId: 'prod-1', quantity: 3 }],
      deliveryTarget: 'TAILOR_SHOP',
    });

    expect(order.orderNumber).toBe('B2B-TEST');
    expect(prisma.fabricSupplyOrder.create).toHaveBeenCalled();
  });
});
