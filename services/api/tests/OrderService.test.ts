import { OrderService } from '../src/services/OrderService';
import prisma from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    supplierProduct: {
      findFirst: jest.fn(),
    },
    purchaseOrder: {
      create: jest.fn(),
    },
  },
}));

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOrderNumber', () => {
    it('should generate a string starting with MUF-', () => {
      const num = OrderService.generateOrderNumber();
      expect(num).toMatch(/^MUF-/);
    });
  });

  describe('updateOrderStatus validation', () => {
    it('should throw an error if transitioning to an invalid status', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-1',
        status: 'PENDING',
      });

      await expect(
        OrderService.updateOrderStatus('order-1', 'READY_FOR_DELIVERY', 'user-1')
      ).rejects.toThrow('Cannot transition from PENDING to READY_FOR_DELIVERY');
    });

    it('should allow valid transitions', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-1',
        status: 'PENDING',
      });
      (prisma.order.update as jest.Mock).mockResolvedValue({
        id: 'order-1',
        status: 'CONFIRMED',
        customer: { id: 'cust-1', name: 'Ahmad', phone: '055' },
        shop: { id: 'shop-1', name: 'Tailor Shop' },
      });

      const updated = await OrderService.updateOrderStatus('order-1', 'CONFIRMED', 'user-1');
      expect(updated.status).toBe('CONFIRMED');
      expect(prisma.order.update).toHaveBeenCalled();
    });
  });

  describe('cancelOrder validation', () => {
    it('should throw an error if trying to cancel a COMPLETED order', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-1',
        status: 'COMPLETED',
      });

      await expect(OrderService.cancelOrder('order-1', 'user-1')).rejects.toThrow(
        'لا يمكن إلغاء الطلب في حالته الحالية'
      );
    });
  });

  describe('createB2BSubOrderForFabric', () => {
    it('should generate PO and decrement stock when fabric product is found', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-1',
        shopId: 'shop-1',
        orderNumber: 'MUF-1234',
      });
      (prisma.product.findFirst as jest.Mock).mockResolvedValue({
        id: 'prod-1',
        name: 'قماش صوف كحلي',
        stockQuantity: 10,
        costPrice: 80,
      });
      (prisma.supplierProduct.findFirst as jest.Mock).mockResolvedValue({
        supplierId: 'supplier-1',
        price: 90,
      });

      await OrderService.createB2BSubOrderForFabric('order-1', 'صوف كحلي', 3.5);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stockQuantity: { decrement: 4 } },
      });
      expect(prisma.purchaseOrder.create).toHaveBeenCalled();
    });
  });
});
