'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { useAuthStore } from '@/lib/stores/authStore';
import { useAppStore } from '@/lib/stores/appStore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { cn } from '@/lib/utils/cn';
import {
  Search,
  Bell,
  Globe,
  ChevronDown,
  Menu,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { language, setLanguage, isRTL, sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setShowUserMenu(false);
  }, [pathname, setSidebarOpen]);

  const isAdmin = pathname.startsWith('/dashboard/admin');
  const isTailor = pathname.startsWith('/dashboard/tailor');
  const isMerchant = pathname.startsWith('/dashboard/merchant');
  const isCustomer = pathname.startsWith('/dashboard/customer');

  const getDashboardTitle = () => {
    if (isAdmin) return isRTL ? 'لوحة الإدارة' : 'Admin Dashboard';
    if (isTailor) return isRTL ? 'لوحة المتجر' : 'Shop Dashboard';
    if (isMerchant) return isRTL ? 'لوحة التاجر' : 'Merchant Dashboard';
    if (isCustomer) return isRTL ? 'حسابي' : 'My Account';
    return isRTL ? 'لوحة التحكم' : 'Dashboard';
  };

  const getRoleColor = () => {
    if (isAdmin) return 'bg-red-100 text-red-700';
    if (isTailor) return 'bg-blue-100 text-blue-700';
    if (isMerchant) return 'bg-gold-100 text-gold-700';
    if (isCustomer) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={cn('transition-all duration-300', isRTL ? 'lg:mr-64' : 'lg:ml-64')}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <Menu size={22} className="text-gray-600 dark:text-slate-400" />
              </button>
              <h1 className="text-lg font-bold text-gray-800 dark:text-slate-100">{getDashboardTitle()}</h1>
              {user && (
                <span className={cn('px-2 py-0.5 rounded-md text-xs font-semibold', getRoleColor())}>
                  {user.role}
                </span>
              )}
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
              <div className="relative w-full">
                <Search className={cn('absolute top-1/2 -translate-y-1/2 text-gray-400', isRTL ? 'right-3' : 'left-3')} size={18} />
                <input
                  type="text"
                  placeholder={isRTL ? 'بحث...' : 'Search...'}
                  className={cn(
                    'w-full py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-700 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500',
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-sm font-medium text-gray-600 dark:text-slate-400"
              >
                <Globe size={16} />
                {language === 'ar' ? 'EN' : 'AR'}
              </button>

              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <Bell size={20} className="text-gray-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <Avatar name={user?.name || 'User'} size="sm" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-slate-300 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className={cn(
                      'absolute top-full mt-1 z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-jahez-lg border border-gray-100 dark:border-slate-700 overflow-hidden',
                      isRTL ? 'left-0' : 'right-0'
                    )}>
                      <a
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <User size={16} />
                        {isRTL ? 'الملف الشخصي' : 'Profile'}
                      </a>
                      <a
                        href="/dashboard/admin/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <Settings size={16} />
                        {isRTL ? 'الإعدادات' : 'Settings'}
                      </a>
                      <hr className="border-gray-100 dark:border-slate-700" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
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
        </header>

        {/* Content */}
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
