'use client';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/hooks/useAuth';
import { hydrateAuthFromStorage, useAuthStore, type User } from '@/lib/stores/authStore';
import { getDemoUserFromToken } from '@/lib/demoAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAppStore } from '@/lib/stores/appStore';
import { cn } from '@/lib/utils/cn';
import {
  Search,
  Bell,
  Globe,
  ChevronDown,
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const Sidebar = dynamic(
  () => import('@/components/shared/Sidebar').then((m) => m.Sidebar),
  { ssr: false, loading: () => null }
);

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  return getDemoUserFromToken(localStorage.getItem('token'));
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const { language, setLanguage, isRTL, sidebarOpen, setSidebarOpen } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [storedUser, setStoredUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const activeUser = user ?? storedUser;

  useLayoutEffect(() => {
    hydrateAuthFromStorage();
    const demo = readStoredUser();
    if (demo) setStoredUser(demo);
    setReady(true);
    useAuthStore.getState().setLoading(false);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setShowUserMenu(false);
  }, [pathname, setSidebarOpen]);

  useEffect(() => {
    if (!ready) return;
    const safety = setTimeout(() => {
      hydrateAuthFromStorage();
      const demo = readStoredUser();
      if (demo) setStoredUser(demo);
      useAuthStore.getState().setLoading(false);
    }, 400);
    return () => clearTimeout(safety);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    if (!isLoading && !isAuthenticated && !activeUser) {
      router.replace('/login');
    }
  }, [ready, isLoading, isAuthenticated, activeUser, router]);

  useEffect(() => {
    if (!activeUser) return;
    import('@/lib/api/notifications').then(({ notificationsApi }) =>
      notificationsApi.list({ limit: '10' }).then((res: any) => {
        const items = res?.notifications ?? res?.items ?? [];
        setUnreadCount(items.filter((n: any) => !n.isRead).length);
      }).catch(() => setUnreadCount(0))
    );
  }, [activeUser?.id]);

  if (!ready || (!activeUser && isLoading)) {
    return <LoadingSpinner fullScreen text={isRTL ? 'جاري التحميل...' : 'Loading...'} />;
  }
  if (!activeUser) return null;

  const isAdmin = pathname.startsWith('/dashboard/admin');
  const isTailor = pathname.startsWith('/dashboard/tailor');
  const isMerchant = pathname.startsWith('/dashboard/merchant');
  const isCustomer = pathname.startsWith('/dashboard/customer');
  const isRep = pathname.startsWith('/dashboard/rep');

  const getDashboardTitle = () => {
    if (isAdmin) return isRTL ? 'لوحة الإدارة' : 'Admin Dashboard';
    if (isTailor) return isRTL ? 'لوحة المتجر' : 'Shop Dashboard';
    if (isMerchant) return isRTL ? 'لوحة التاجر' : 'Merchant Dashboard';
    if (isRep) return isRTL ? 'لوحة المندوب' : 'Rep Dashboard';
    if (isCustomer) return isRTL ? 'حسابي' : 'My Account';
    return isRTL ? 'لوحة التحكم' : 'Dashboard';
  };

  const getRoleBadge = () => {
    if (isAdmin) return { bg: 'bg-[#481719]/10', text: 'text-[#481719]', label: isRTL ? 'مدير' : 'Admin' };
    if (isTailor) return { bg: 'bg-[#00373E]/10', text: 'text-[#00373E]', label: isRTL ? 'خياط' : 'Tailor' };
    if (isMerchant) return { bg: 'bg-[#D4AF37]/10', text: 'text-[#D4AF37]', label: isRTL ? 'تاجر' : 'Merchant' };
    if (isCustomer) return { bg: 'bg-[#735B4D]/10', text: 'text-[#735B4D]', label: isRTL ? 'عميل' : 'Customer' };
    if (isRep) return { bg: 'bg-[#1a4a6b]/10', text: 'text-[#1a4a6b]', label: isRTL ? 'مندوب' : 'Rep' };
    return { bg: 'bg-[#D0D6D7]/10', text: 'text-[#735B4D]', label: '' };
  };

  const getSettingsPath = () => {
    if (isAdmin) return '/dashboard/admin/settings';
    if (isTailor) return '/dashboard/tailor/settings';
    if (isMerchant) return '/dashboard/merchant/accounting';
    if (isCustomer) return '/dashboard/customer/profile';
    if (isRep) return '/dashboard/rep';
    return '/dashboard/profile';
  };

  const getProfilePath = () => {
    if (isCustomer) return '/dashboard/customer/profile';
    return '/dashboard/profile';
  };

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    const crumbs = [];
    for (let i = 0; i < parts.length; i++) {
      const path = '/' + parts.slice(0, i + 1).join('/');
      let label = parts[i];
      const translations: Record<string, string> = {
        dashboard: isRTL ? 'لوحة التحكم' : 'Dashboard',
        admin: isRTL ? 'الإدارة' : 'Admin',
        tailor: isRTL ? 'المتجر' : 'Shop',
        merchant: isRTL ? 'التاجر' : 'Merchant',
        customer: isRTL ? 'العميل' : 'Customer',
        orders: isRTL ? 'الطلبات' : 'Orders',
        users: isRTL ? 'المستخدمين' : 'Users',
        shops: isRTL ? 'المتاجر' : 'Shops',
        products: isRTL ? 'المنتجات' : 'Products',
        reports: isRTL ? 'التقارير' : 'Reports',
        settings: isRTL ? 'الإعدادات' : 'Settings',
        profile: isRTL ? 'الملف الشخصي' : 'Profile',
        notifications: isRTL ? 'الإشعارات' : 'Notifications',
        inventory: isRTL ? 'المخزون' : 'Inventory',
        finances: isRTL ? 'المالية' : 'Finances',
        accounting: isRTL ? 'المحاسبة' : 'Accounting',
        staff: isRTL ? 'الموظفين' : 'Staff',
        measurements: isRTL ? 'المقاسات' : 'Measurements',
        addresses: isRTL ? 'العناوين' : 'Addresses',
      };
      label = translations[label] || label;
      crumbs.push({ path, label });
    }
    return crumbs;
  };

  const roleBadge = getRoleBadge();
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0a0a0a]" dir={isRTL ? 'rtl' : 'ltr'}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={cn('transition-all duration-300', isRTL ? 'lg:mr-64' : 'lg:ml-64')}>
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#E8E8E8] dark:border-white/10">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-[#F2E8D4]/50 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu size={22} className="text-[#00373E] dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-[#0A0A0A] dark:text-white tracking-tight">{getDashboardTitle()}</h1>
              </div>
              {roleBadge.label && (
                <span className={cn('px-2.5 py-0.5 rounded-lg text-xs font-semibold', roleBadge.bg, roleBadge.text)}>
                  {roleBadge.label}
                </span>
              )}
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
              <div className="relative w-full">
                <Search className={cn('absolute top-1/2 -translate-y-1/2 text-[#735B4D]/40', isRTL ? 'right-3' : 'left-3')} size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  placeholder={isRTL ? 'بحث...' : 'Search...'}
                  className={cn(
                    'w-full py-2.5 rounded-xl border border-[#D0D6D7]/50 bg-[#F2E8D4]/30 dark:bg-slate-800',
                    'focus:outline-none focus:ring-2 focus:ring-[#00373E]/20 focus:border-[#00373E]/30 focus:bg-white',
                    'dark:focus:bg-slate-700 text-sm text-[#00373E] dark:text-slate-100',
                    'placeholder-[#735B4D]/40 dark:placeholder-slate-500',
                    'transition-all duration-200',
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-[#F2E8D4]/50 dark:hover:bg-slate-800 text-sm font-medium text-[#735B4D] dark:text-slate-400 transition-colors"
              >
                <Globe size={16} />
                <span className="hidden sm:inline">{language === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/notifications')}
                className="relative p-2.5 rounded-xl hover:bg-[#F2E8D4]/50 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell size={20} className="text-[#735B4D] dark:text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#481719] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-[#481719]/30">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F2E8D4]/50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Avatar name={activeUser.name || 'User'} size="sm" />
                  <span className="hidden sm:block text-sm font-medium text-[#00373E] dark:text-slate-300 max-w-[100px] truncate">
                    {activeUser.name}
                  </span>
                  <ChevronDown size={14} className="text-[#735B4D]/40" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div
                      className={cn(
                        'absolute top-full mt-1 z-50 w-52 bg-white dark:bg-slate-800 rounded-xl',
                        'shadow-[0_4px_16px_rgba(0,55,62,0.1),0_8px_32px_rgba(0,55,62,0.06)]',
                        'border border-[#D0D6D7]/30 dark:border-slate-700 overflow-hidden',
                        'animate-in fade-in slide-in-from-top-2 duration-200',
                        isRTL ? 'left-0' : 'right-0'
                      )}
                    >
                      <div className="px-4 py-3 border-b border-[#D0D6D7]/30">
                        <p className="text-sm font-semibold text-[#00373E] dark:text-slate-200">{activeUser.name}</p>
                        <p className="text-xs text-[#735B4D]/60 dark:text-slate-500">{activeUser.email}</p>
                      </div>
                      <Link
                        href={getProfilePath()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#00373E] dark:text-slate-300 hover:bg-[#F2E8D4]/30 dark:hover:bg-slate-700 transition-colors"
                      >
                        <UserIcon size={16} className="text-[#735B4D]" />
                        {isRTL ? 'الملف الشخصي' : 'Profile'}
                      </Link>
                      <Link
                        href={getSettingsPath()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#00373E] dark:text-slate-300 hover:bg-[#F2E8D4]/30 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Settings size={16} className="text-[#735B4D]" />
                        {isRTL ? 'الإعدادات' : 'Settings'}
                      </Link>
                      <hr className="border-[#D0D6D7]/30" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#481719] hover:bg-[#481719]/5 transition-colors"
                      >
                        <LogOut size={16} />
                        {isRTL ? 'تسجيل خروج' : 'Logout'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {breadcrumbs.length > 1 && (
            <div className="px-4 md:px-6 pb-2">
              <div className="flex items-center gap-1.5 text-xs">
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={crumb.path}>
                    {i > 0 &&
                      (isRTL ? (
                        <ChevronLeft size={12} className="text-[#735B4D]/30" />
                      ) : (
                        <ChevronRight size={12} className="text-[#735B4D]/30" />
                      ))}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="text-[#00373E] font-semibold">{crumb.label}</span>
                    ) : (
                      <Link href={crumb.path} className="text-[#735B4D]/60 hover:text-[#00373E] transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </header>

        <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
