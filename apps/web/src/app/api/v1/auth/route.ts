import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = req.nextUrl.pathname;

    // Register
    if (path.endsWith('/auth/register')) {
      const { name, phone, email, password } = body;
      if (!name || !password || (!phone && !email)) {
        return NextResponse.json({ success: false, message: 'الرجاء تعبئة جميع الحقول المطلوبة' }, { status: 422 });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, phone, email, password: hashedPassword, status: 'ACTIVE' },
        select: { id: true, name: true, email: true, phone: true, status: true },
      });

      const token = jwt.sign({ userId: user.id, role: 'CUSTOMER' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
      return NextResponse.json({ success: true, data: { user, access_token: token } }, { status: 201 });
    }

    // Login
    if (path.endsWith('/auth/login')) {
      const { identifier, password } = body;
      if (!identifier || !password) {
        return NextResponse.json({ success: false, message: 'الرجاء إدخال رقم الهاتف وكلمة المرور' }, { status: 422 });
      }

      const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { phone: identifier }] },
        include: { role: { select: { name: true } } },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return NextResponse.json({ success: false, message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
      }

      const token = jwt.sign({ userId: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
      const { password: _, roleId: __, ...safe } = user;
      return NextResponse.json({ success: true, data: { user: { ...safe, role: user.role.name }, access_token: token } });
    }

    return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Auth error:', error?.message);
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
