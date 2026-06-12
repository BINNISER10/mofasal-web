'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDemoUserFromToken } from '@/lib/demoAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ROLE_ROUTES: Record<string, string> = {
  admin: '/dashboard/admin',
  tailor: '/dashboard/tailor',
  merchant: '/dashboard/merchant',
  rep: '/dashboard/rep',
  customer: '/dashboard/customer',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      const safety = setTimeout(() => {
        const token = localStorage.getItem('token');
        const demoUser = getDemoUserFromToken(token);
        if (demoUser) {
          router.replace(ROLE_ROUTES[demoUser.role] || '/');
        } else if (!token) {
          router.replace('/login');
        }
      }, 1500);
      return () => clearTimeout(safety);
    }
    if (!user) {
      router.replace('/login');
      return;
    }
    router.replace(ROLE_ROUTES[user.role] || '/');
  }, [user, isLoading, router]);

  return <LoadingSpinner fullScreen text="جاري التحميل..." />;
}
