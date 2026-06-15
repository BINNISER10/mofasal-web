import prisma from '../config/database';

const MANUFACTURING_STAGES = [
  'CUTTING_FABRIC',
  'SEWING_ASSEMBLY',
  'IRONING_FINISHING',
  'PACKING_WRAPPING',
  'TAKING_MEASUREMENTS',
  'CONFIRMED',
];

const STAGE_STATUS: Record<string, string> = {
  PENDING: 'PENDING',
  CONFIRMED: 'PENDING',
  TAKING_MEASUREMENTS: 'IN_PROGRESS',
  CUTTING_FABRIC: 'IN_PROGRESS',
  SEWING_ASSEMBLY: 'IN_PROGRESS',
  IRONING_FINISHING: 'IN_PROGRESS',
  PACKING_WRAPPING: 'IN_PROGRESS',
  READY_FOR_DELIVERY: 'COMPLETED',
  DELIVERED: 'COMPLETED',
};

export class ManufacturingService {
  static async getTasks(shopId: string) {
    const orders = await prisma.order.findMany({
      where: {
        shopId,
        status: { in: MANUFACTURING_STAGES },
      },
      include: {
        assignedStaff: { select: { name: true } },
        customer: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return orders.map((order) => ({
      id: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      stage: order.status,
      status: STAGE_STATUS[order.status] || 'PENDING',
      assignedTo: order.assignedStaff?.name,
      estimatedHours: 2,
      actualHours: undefined,
      startedAt: order.createdAt.toISOString(),
      completedAt: STAGE_STATUS[order.status] === 'COMPLETED' ? order.updatedAt.toISOString() : undefined,
      customerName: order.customer?.name,
    }));
  }

  static async updateTaskStatus(orderId: string, shopId: string, status: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, shopId } });
    if (!order) return null;

    const stageProgress: Record<string, string> = {
      PENDING: 'CONFIRMED',
      IN_PROGRESS: 'SEWING_ASSEMBLY',
      COMPLETED: 'PACKING_WRAPPING',
    };

    if (stageProgress[status]) {
      return prisma.order.update({
        where: { id: orderId },
        data: { status: stageProgress[status] },
      });
    }
    return order;
  }
}
