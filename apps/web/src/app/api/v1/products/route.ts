import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    const where: any = { isActive: true };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (categoryId) where.categoryId = categoryId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          shop: { select: { id: true, name: true, nameAr: true, rating: true } },
          category: { select: { id: true, name: true, nameAr: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { items: products, total } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
