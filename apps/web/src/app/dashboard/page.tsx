'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      const routes: Record<string, string> = {
        admin: '/dashboard/admin',
        tailor: '/dashboard/tailor',
        merchant: '/dashboard/merchant',
        customer: '/dashboard/customer',
      };
      router.push(routes[user.role as string] || '/');
    }
  }, [user, isLoading, router]);

  return <LoadingSpinner fullScreen text="جاري التحميل..." />;
}
