import prisma from '../config/database';
import logger from '../utils/logger';

export interface LoyaltyConfig {
  pointsPerRiyal: number;        // نقطة لكل كم ريال (default: 1 per 10 SAR)
  welcomeBonus: number;          // نقاط الترحيب (default: 100)
  referralBonus: number;         // نقاط الإحالة (default: 200)
  birthdayBonus: number;         // نقاط عيد الميلاد (default: 500)
  minPointsToRedeem: number;     // الحد الأدنى للصرف (default: 100)
  pointValueInRiyal: number;     // قيمة النقطة بالريال (default: 0.05 = 5 halala)
}

export class LoyaltyService {
  static readonly DEFAULT_CONFIG: LoyaltyConfig = {
    pointsPerRiyal: 0.1,        // 1 نقطة لكل 10 ريال
    welcomeBonus: 100,
    referralBonus: 200,
    birthdayBonus: 500,
    minPointsToRedeem: 100,
    pointValueInRiyal: 0.05,     // كل 100 نقطة = 5 ريال
  };

  /** الحصول على أو إنشاء رصيد نقاط العميل */
  static async getOrCreateBalance(customerId: string, shopId?: string) {
    let balance = await prisma.loyaltyBalance.findUnique({
      where: { customerId },
    });

    if (!balance) {
      balance = await prisma.loyaltyBalance.create({
        data: {
          customerId,
          shopId: shopId || null,
          points: this.DEFAULT_CONFIG.welcomeBonus,
          lifetimePoints: this.DEFAULT_CONFIG.welcomeBonus,
          tier: 'BRONZE',
        },
      });
      // تسجيل نقاط الترحيب
      await this.recordTransaction(customerId, 'WELCOME_BONUS', this.DEFAULT_CONFIG.welcomeBonus, null, 'مكافأة ترحيبية');
    }

    return balance;
  }

  /** إضافة نقاط من شراء */
  static async addPointsFromOrder(customerId: string, orderAmount: number, orderId: string, shopId?: string) {
    const points = Math.floor(orderAmount * this.DEFAULT_CONFIG.pointsPerRiyal);
    if (points <= 0) return null;

    const balance = await this.getOrCreateBalance(customerId, shopId);
    
    const updated = await prisma.loyaltyBalance.update({
      where: { customerId },
      data: {
        points: { increment: points },
        lifetimePoints: { increment: points },
        tier: this.calculateTier(balance.lifetimePoints + points),
      },
    });

    await this.recordTransaction(customerId, 'EARN', points, orderId, `نقاط من طلب بقيمة ${orderAmount} ريال`);
    
    logger.info(`Added ${points} loyalty points to customer ${customerId} for order ${orderId}`);
    return { balance: updated, pointsEarned: points };
  }

  /** صرف نقاط كخصم */
  static async redeemPoints(customerId: string, pointsToRedeem: number, orderId?: string) {
    const balance = await this.getOrCreateBalance(customerId);
    
    if (pointsToRedeem < this.DEFAULT_CONFIG.minPointsToRedeem) {
      throw new Error(`الحد الأدنى للصرف ${this.DEFAULT_CONFIG.minPointsToRedeem} نقطة`);
    }
    
    if (balance.points < pointsToRedeem) {
      throw new Error('رصيد النقاط غير كافٍ');
    }

    const discountValue = pointsToRedeem * this.DEFAULT_CONFIG.pointValueInRiyal;

    const updated = await prisma.loyaltyBalance.update({
      where: { customerId },
      data: { points: { decrement: pointsToRedeem } },
    });

    await this.recordTransaction(customerId, 'REDEEM', -pointsToRedeem, orderId || null, `صرف ${pointsToRedeem} نقطة كخصم ${discountValue.toFixed(2)} ريال`);

    return {
      balance: updated,
      pointsRedeemed: pointsToRedeem,
      discountValue: Math.round(discountValue * 100) / 100,
    };
  }

  /** حساب الخصم المتاح من النقاط */
  static async calculateAvailableDiscount(customerId: string, maxPoints?: number) {
    const balance = await this.getOrCreateBalance(customerId);
    const availablePoints = Math.min(
      maxPoints ? Math.min(maxPoints, balance.points) : balance.points,
      balance.points
    );
    
    const discountValue = availablePoints * this.DEFAULT_CONFIG.pointValueInRiyal;
    
    return {
      availablePoints,
      discountValue: Math.round(discountValue * 100) / 100,
      canRedeem: availablePoints >= this.DEFAULT_CONFIG.minPointsToRedeem,
      minPointsToRedeem: this.DEFAULT_CONFIG.minPointsToRedeem,
      pointValue: this.DEFAULT_CONFIG.pointValueInRiyal,
    };
  }

  /** إحالة صديق */
  static async processReferral(referrerId: string, referredCustomerId: string) {
    // إضافة نقاط للمحيل
    const referrerBalance = await this.getOrCreateBalance(referrerId);
    await prisma.loyaltyBalance.update({
      where: { customerId: referrerId },
      data: {
        points: { increment: this.DEFAULT_CONFIG.referralBonus },
        lifetimePoints: { increment: this.DEFAULT_CONFIG.referralBonus },
      },
    });
    await this.recordTransaction(referrerId, 'REFERRAL', this.DEFAULT_CONFIG.referralBonus, null, `مكافأة إحالة عميل جديد`);

    // إضافة نقاط ترحيب للمحال إليه
    const referredBalance = await this.getOrCreateBalance(referredCustomerId);
    await prisma.loyaltyBalance.update({
      where: { customerId: referredCustomerId },
      data: {
        points: { increment: this.DEFAULT_CONFIG.referralBonus },
        lifetimePoints: { increment: this.DEFAULT_CONFIG.referralBonus },
      },
    });
    await this.recordTransaction(referredCustomerId, 'REFERRAL_BONUS', this.DEFAULT_CONFIG.referralBonus, null, `مكافأة التسجيل بالإحالة`);

    return {
      referrerPoints: this.DEFAULT_CONFIG.referralBonus,
      referredPoints: this.DEFAULT_CONFIG.referralBonus,
    };
  }

  /** مكافأة عيد الميلاد */
  static async giveBirthdayBonus(customerId: string) {
    const today = new Date();
    const thisYear = today.getFullYear();
    
    // التحقق من عدم منح المكافأة هذا العام
    const existing = await prisma.loyaltyTransaction.findFirst({
      where: {
        customerId,
        type: 'BIRTHDAY',
        createdAt: { gte: new Date(`${thisYear}-01-01`) },
      },
    });
    
    if (existing) return null; // منحت مسبقاً هذا العام

    const balance = await this.getOrCreateBalance(customerId);
    await prisma.loyaltyBalance.update({
      where: { customerId },
      data: {
        points: { increment: this.DEFAULT_CONFIG.birthdayBonus },
        lifetimePoints: { increment: this.DEFAULT_CONFIG.birthdayBonus },
      },
    });
    
    await this.recordTransaction(customerId, 'BIRTHDAY', this.DEFAULT_CONFIG.birthdayBonus, null, `مكافأة عيد ميلاد ${thisYear}`);
    
    return { pointsGiven: this.DEFAULT_CONFIG.birthdayBonus };
  }

  /** سجل معاملات النقاط */
  static async getTransactionHistory(customerId: string, page = 1, limit = 20) {
    const [transactions, total] = await Promise.all([
      prisma.loyaltyTransaction.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.loyaltyTransaction.count({ where: { customerId } }),
    ]);

    return { transactions, total, page, limit };
  }

  /** ترتيب العملاء (Leaderboard) */
  static async getLeaderboard(shopId?: string, limit = 10) {
    const where = shopId ? { shopId } : {};
    
    const topCustomers = await prisma.loyaltyBalance.findMany({
      where,
      orderBy: { lifetimePoints: 'desc' },
      take: limit,
      include: {
        customer: { select: { name: true, phone: true } },
      },
    });

    return topCustomers.map((entry, index) => ({
      rank: index + 1,
      customerId: entry.customerId,
      name: entry.customer?.name || 'عميل',
      points: entry.points,
      lifetimePoints: entry.lifetimePoints,
      tier: entry.tier,
    }));
  }

  /** حساب الرتبة (Tier) */
  private static calculateTier(lifetimePoints: number): string {
    if (lifetimePoints >= 10000) return 'PLATINUM';
    if (lifetimePoints >= 5000) return 'GOLD';
    if (lifetimePoints >= 1000) return 'SILVER';
    return 'BRONZE';
  }

  /** تسجيل معاملة */
  private static async recordTransaction(
    customerId: string,
    type: string,
    points: number,
    orderId: string | null,
    description: string
  ) {
    await prisma.loyaltyTransaction.create({
      data: {
        customerId,
        type,
        points,
        orderId,
        description,
      },
    });
  }

  /** إحصائيات برنامج الولاء للمحل */
  static async getShopStats(shopId?: string) {
    const where = shopId ? { shopId } : {};
    
    const [
      totalMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      activeThisMonth,
    ] = await Promise.all([
      prisma.loyaltyBalance.count({ where }),
      prisma.loyaltyBalance.aggregate({ where, _sum: { lifetimePoints: true } }),
      prisma.loyaltyTransaction.aggregate({
        where: { type: 'REDEEM' },
        _sum: { points: true },
      }),
      prisma.loyaltyTransaction.groupBy({
        by: ['customerId'],
        where: {
          createdAt: { gte: new Date(new Date().setDate(1)) }, // من بداية الشهر
        },
        _count: { customerId: true },
      }),
    ]);

    return {
      totalMembers,
      totalPointsIssued: totalPointsIssued._sum.lifetimePoints || 0,
      totalPointsRedeemed: Math.abs(totalPointsRedeemed._sum.points || 0),
      activeThisMonth: activeThisMonth.length,
      averagePointsPerMember: totalMembers > 0 
        ? Math.round((totalPointsIssued._sum.lifetimePoints || 0) / totalMembers) 
        : 0,
    };
  }
}
