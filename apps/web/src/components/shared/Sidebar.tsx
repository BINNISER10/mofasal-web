'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore, UserRole } from '@/lib/stores/authStore';
import { useAppStore } from '@/lib/stores/appStore';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  Settings,
  Shield,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  UserCircle,
  FileText,
  Truck,
  CreditCard,
  ClipboardList,
  Scissors,
  Warehouse,
  DollarSign,
  Clock,
  Bell,
  MapPin,
  Plus,
  Sun,
  Moon,
  Ruler,
} from 'lucide-react';

interface MenuItem {
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  href: string;
  roles: UserRole[];
  badge?: number | string;
  exact?: boolean;
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: <LayoutDashboard size={20} />,
    href: '/dashboard',
    roles: ['admin', 'tailor', 'merchant', 'customer'],
  },
  {
    label: 'New Order',
    labelAr: 'طلب جديد',
    icon: <Plus size={20} />,
    href: '/dashboard/customer/orders/new',
    roles: ['customer'],
    exact: true,
  },
  {
    label: 'My Orders',
    labelAr: 'طلباتي',
    icon: <ShoppingBag size={20} />,
    href: '/dashboard/customer/orders',
    roles: ['customer'],
  },
  {
    label: 'Orders',
    labelAr: 'الطلبات',
    icon: <ShoppingBag size={20} />,
    href: '/dashboard/admin/orders',
    roles: ['admin'],
  },
  {
    label: 'Orders',
    labelAr: 'الطلبات',
    icon: <ShoppingBag size={20} />,
    href: '/dashboard/tailor/orders',
    roles: ['tailor'],
  },
  {
    label: 'Orders',
    labelAr: 'الطلبات',
    icon: <ShoppingBag size={20} />,
    href: '/dashboard/merchant/orders',
    roles: ['merchant'],
  },
  {
    label: 'Users',
    labelAr: 'المستخدمين',
    icon: <Users size={20} />,
    href: '/dashboard/admin/users',
    roles: ['admin'],
  },
  {
    label: 'Shops',
    labelAr: 'المتاجر',
    icon: <Store size={20} />,
    href: '/dashboard/admin/shops',
    roles: ['admin'],
  },
  {
    label: 'Merchants',
    labelAr: 'التجار',
    icon: <Package size={20} />,
    href: '/dashboard/admin/merchants',
    roles: ['admin'],
  },
  {
    label: 'Reports',
    labelAr: 'التقارير',
    icon: <BarChart3 size={20} />,
    href: '/dashboard/admin/reports',
    roles: ['admin'],
  },
  {
    label: 'Audit Logs',
    labelAr: 'سجل التدقيق',
    icon: <ClipboardList size={20} />,
    href: '/dashboard/admin/audit-logs',
    roles: ['admin'],
  },
  {
    label: 'Commissions',
    labelAr: 'العمولات',
    icon: <DollarSign size={20} />,
    href: '/dashboard/admin/commissions',
    roles: ['admin'],
  },
  {
    label: 'Settings',
    labelAr: 'الإعدادات',
    icon: <Settings size={20} />,
    href: '/dashboard/admin/settings',
    roles: ['admin'],
  },
  {
    label: 'Staff',
    labelAr: 'الموظفين',
    icon: <UserCircle size={20} />,
    href: '/dashboard/tailor/staff',
    roles: ['tailor'],
  },
  {
    label: 'Settings',
    labelAr: 'الإعدادات',
    icon: <Settings size={20} />,
    href: '/dashboard/tailor/settings',
    roles: ['tailor'],
  },
  {
    label: 'Inventory',
    labelAr: 'المخزون',
    icon: <Warehouse size={20} />,
    href: '/dashboard/merchant/inventory',
    roles: ['merchant'],
  },
  {
    label: 'Finances',
    labelAr: 'المالية',
    icon: <DollarSign size={20} />,
    href: '/dashboard/finances',
    roles: ['tailor'],
  },
  {
    label: 'Finances',
    labelAr: 'المالية',
    icon: <DollarSign size={20} />,
    href: '/dashboard/merchant/finances',
    roles: ['merchant'],
  },
  {
    label: 'Products',
    labelAr: 'المنتجات',
    icon: <Package size={20} />,
    href: '/dashboard/merchant/products',
    roles: ['merchant'],
  },
  {
    label: 'B2B Orders',
    labelAr: 'طلبات التوريد',
    icon: <Truck size={20} />,
    href: '/dashboard/merchant/b2b',
    roles: ['merchant'],
  },
  {
    label: 'Accounting',
    labelAr: 'المحاسبة',
    icon: <FileText size={20} />,
    href: '/dashboard/merchant/accounting',
    roles: ['merchant'],
  },
  {
    label: 'Measurements',
    labelAr: 'المقاسات',
    icon: <Scissors size={20} />,
    href: '/dashboard/customer/measurements',
    roles: ['customer'],
  },
  {
    label: 'Book Measurement',
    labelAr: 'حجز قياس',
    icon: <Ruler size={20} />,
    href: '/dashboard/customer/book-measurement',
    roles: ['customer'],
  },
  {
    label: 'Addresses',
    labelAr: 'العناوين',
    icon: <MapPin size={20} />,
    href: '/dashboard/customer/addresses',
    roles: ['customer'],
  },
  {
    label: 'Notifications',
    labelAr: 'الإشعارات',
    icon: <Bell size={20} />,
    href: '/dashboard/notifications',
    roles: ['admin', 'tailor', 'merchant', 'customer'],
    badge: '3',
  },
  {
    label: 'Profile',
    labelAr: 'الملف الشخصي',
    icon: <UserCircle size={20} />,
    href: '/dashboard/profile',
    roles: ['admin', 'tailor', 'merchant', 'customer'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isRTL, sidebarCollapsed, toggleSidebarCollapsed, theme, toggleTheme } = useAppStore();

  const filteredItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 h-full bg-white dark:bg-slate-900 shadow-jahez-lg z-50 transition-all duration-300 flex flex-col border-gray-100 dark:border-slate-800',
          isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full'),
          isRTL ? 'right-0 border-l' : 'left-0 border-r',
          sidebarCollapsed ? 'w-20' : 'w-64',
          'lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
          {!sidebarCollapsed && (
            <a href="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">م</span>
              </div>
              <span className="font-bold text-lg text-primary-700 dark:text-primary-300">مفصل</span>
            </a>
          )}
          <button
            onClick={toggleSidebarCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"
          >
            {sidebarCollapsed ? (
              isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />
            ) : (
              isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
            )}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {filteredItems.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                onClose();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 text-right',
                isActive(item.href, item.exact)
                  ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? item.labelAr : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="flex-1 text-sm">{item.labelAr}</span>
              )}
              {!sidebarCollapsed && item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          {!sidebarCollapsed && user && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium mb-1',
              sidebarCollapsed && 'justify-center'
            )}
          >
            {theme === 'dark' ? <Sun size={18} className="text-gold-400" /> : <Moon size={18} />}
            {!sidebarCollapsed && <span>{theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>}
          </button>
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>تسجيل خروج</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
