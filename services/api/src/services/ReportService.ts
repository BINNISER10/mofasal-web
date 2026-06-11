import prisma from '../config/database';

interface ReportRange {
  startDate?: Date;
  endDate?: Date;
}

function buildOrderWhere(shopId: string, range: ReportRange, onlyPaid = false): any {
  const where: any = { shopId };
  if (onlyPaid) where.paymentStatus = 'PAID';
  if (range.startDate || range.endDate) {
    where.createdAt = {};
    if (range.startDate) where.createdAt.gte = range.startDate;
    if (range.endDate) where.createdAt.lte = range.endDate;
  }
  return where;
}

export class ReportService {
  static async getSummary(shopId: string, range: ReportRange) {
    const baseWhere = buildOrderWhere(shopId, range);
    const paidWhere = buildOrderWhere(shopId, range, true);

    const [paidAgg, totalOrders, statusGroups] = await Promise.all([
      prisma.order.aggregate({ where: paidWhere, _sum: { grandTotal: true, vatAmount: true }, _count: true }),
      prisma.order.count({ where: baseWhere }),
      prisma.order.groupBy({ by: ['status'], where: baseWhere, _count: true }),
    ]);

    const statusMap: Record<string, number> = {};
    statusGroups.forEach((g) => { statusMap[g.status] = g._count as number; });

    const totalRevenue = paidAgg._sum.grandTotal || 0;
    const paidOrders = paidAgg._count || 0;

    return {
      totalRevenue,
      totalVat: paidAgg._sum.vatAmount || 0,
      totalOrders,
      paidOrders,
      avgOrderValue: paidOrders > 0 ? Math.round((totalRevenue / paidOrders) * 100) / 100 : 0,
      pendingOrders: statusMap['PENDING'] || 0,
      completedOrders: statusMap['DELIVERED'] || 0,
      cancelledOrders: (statusMap['CANCELLED'] || 0) + (statusMap['RETURNED'] || 0),
      statusBreakdown: statusMap,
    };
  }

  static async getSalesTrend(shopId: string, range: ReportRange, granularity: 'day' | 'month' = 'day') {
    const where = buildOrderWhere(shopId, range, true);
    const orders = await prisma.order.findMany({
      where,
      select: { grandTotal: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const buckets: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = granularity === 'month'
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!buckets[key]) buckets[key] = { revenue: 0, orders: 0 };
      buckets[key].revenue += o.grandTotal || 0;
      buckets[key].orders += 1;
    });

    return Object.entries(buckets)
      .map(([date, v]) => ({ date, revenue: Math.round(v.revenue * 100) / 100, orders: v.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static async getTopProducts(shopId: string, range: ReportRange, limit = 10) {
    const orderWhere: any = { shopId, paymentStatus: 'PAID' };
    if (range.startDate || range.endDate) {
      orderWhere.createdAt = {};
      if (range.startDate) orderWhere.createdAt.gte = range.startDate;
      if (range.endDate) orderWhere.createdAt.lte = range.endDate;
    }

    const grouped = await prisma.orderItem.groupBy({
      by: ['name'],
      where: { order: orderWhere },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: limit,
    });

    return grouped.map((g) => ({
      name: g.name,
      quantity: g._sum.quantity || 0,
      revenue: Math.round((g._sum.totalPrice || 0) * 100) / 100,
    }));
  }

  static async getPaymentBreakdown(shopId: string, range: ReportRange) {
    const where = buildOrderWhere(shopId, range, true);
    const grouped = await prisma.order.groupBy({
      by: ['paymentMethod'],
      where,
      _sum: { grandTotal: true },
      _count: true,
    });

    return grouped.map((g) => ({
      method: g.paymentMethod || 'UNKNOWN',
      revenue: Math.round((g._sum.grandTotal || 0) * 100) / 100,
      count: g._count as number,
    }));
  }

  static async getOverview(shopId: string, range: ReportRange) {
    const [summary, salesTrend, topProducts, paymentBreakdown] = await Promise.all([
      this.getSummary(shopId, range),
      this.getSalesTrend(shopId, range, 'day'),
      this.getTopProducts(shopId, range, 10),
      this.getPaymentBreakdown(shopId, range),
    ]);
    return { summary, salesTrend, topProducts, paymentBreakdown };
  }
}
