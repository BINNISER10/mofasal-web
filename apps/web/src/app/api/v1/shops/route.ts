import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';

    const where: any = { isOpen: true };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (city) where.city = city;

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        take: limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true, name: true, nameAr: true, city: true, district: true,
          rating: true, reviewCount: true, orderCount: true, isOpen: true,
          isVerified: true, logo: true, coverImage: true,
        },
      }),
      prisma.shop.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { items: shops, total } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
