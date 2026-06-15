'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useAuthStore, UserRole } from '@/lib/stores/authStore';
import { useAppStore } from '@/lib/stores/appStore';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  Settings,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  FileText,
  Truck,
  ClipboardList,
  Scissors,
  Warehouse,
  DollarSign,
  Bell,
  MapPin,
  Plus,
  Sun,
  Moon,
  Ruler,
  TrendingUp,
  Shield,
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
    label: 'Rep Dashboard',
    labelAr: 'لوحة المندوب',
    icon: <MapPin size={20} />,
    href: '/dashboard/rep',
    roles: ['rep'],
    exact: true,
  },
  {
    label: 'My Assignments',
    labelAr: 'مهامي',
    icon: <ClipboardList size={20} />,
    href: '/dashboard/rep/assignments',
    roles: ['rep'],
  },
  {
    label: 'Book Measurement',
    labelAr: 'حجز قياس',
    icon: <Ruler size={20} />,
    href: '/dashboard/customer/book-measurement',
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
    label: 'New Order',
    labelAr: 'طلب جديد',
    icon: <Plus size={20} />,
    href: '/dashboard/tailor/orders/new',
    roles: ['tailor'],
    exact: true,
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
    label: 'Attendance',
    labelAr: 'الحضور',
    icon: <ClipboardList size={20} />,
    href: '/dashboard/admin/attendance',
    roles: ['admin'],
  },
  {
    label: 'Leave',
    labelAr: 'الإجازات',
    icon: <FileText size={20} />,
    href: '/dashboard/admin/leave',
    roles: ['admin'],
  },
  {
    label: 'Procurement',
    labelAr: 'المشتريات',
    icon: <Truck size={20} />,
    href: '/dashboard/admin/procurement',
    roles: ['admin'],
  },
  {
    label: 'Security',
    labelAr: 'الأمان',
    icon: <Shield size={20} />,
    href: '/dashboard/admin/security',
    roles: ['admin'],
  },
  {
    label: 'Analytics',
    labelAr: 'التحليلات',
    icon: <TrendingUp size={20} />,
    href: '/dashboard/admin/analytics',
    roles: ['admin'],
  },
  {
    label: 'HR',
    labelAr: 'الموارد البشرية',
    icon: <Users size={20} />,
    href: '/dashboard/admin/hr',
    roles: ['admin'],
  },
  {
    label: 'Payroll',
    labelAr: 'الرواتب',
    icon: <DollarSign size={20} />,
    href: '/dashboard/admin/payroll',
    roles: ['admin'],
  },
  {
    label: 'POS',
    labelAr: 'نقطة البيع',
    icon: <ShoppingBag size={20} />,
    href: '/dashboard/admin/pos',
    roles: ['admin'],
  },
  {
    label: 'Roles',
    labelAr: 'الأدوار',
    icon: <Shield size={20} />,
    href: '/dashboard/admin/roles',
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
    label: 'Manufacturing',
    labelAr: 'التصنيع',
    icon: <Scissors size={20} />,
    href: '/dashboard/tailor/manufacturing',
    roles: ['tailor'],
  },
  {
    label: 'Fabric B2B',
    labelAr: 'طلب أقمشة',
    icon: <Package size={20} />,
    href: '/dashboard/tailor/fabric-supply',
    roles: ['tailor'],
  },
  {
    label: 'Procurement',
    labelAr: 'المشتريات',
    icon: <Truck size={20} />,
    href: '/dashboard/tailor/procurement',
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
    label: 'Tiered Pricing',
    labelAr: 'التسعير المتدرج',
    icon: <TrendingUp size={20} />,
    href: '/dashboard/merchant/pricing',
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
    roles: ['admin', 'tailor', 'merchant', 'customer', 'rep'],
  },
  {
    label: 'Profile',
    labelAr: 'الملف الشخصي',
    icon: <UserCircle size={20} />,
    href: '/dashboard/customer/profile',
    roles: ['customer'],
  },
  {
    label: 'Profile',
    labelAr: 'الملف الشخصي',
    icon: <UserCircle size={20} />,
    href: '/dashboard/profile',
    roles: ['admin', 'tailor', 'merchant'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/dashboard/admin',
  tailor: '/dashboard/tailor',
  merchant: '/dashboard/merchant',
  customer: '/dashboard/customer',
  rep: '/dashboard/rep',
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isRTL, sidebarCollapsed, toggleSidebarCollapsed, theme, toggleTheme } = useAppStore();

  const resolveHref = (href: string) => {
    if (href === '/dashboard' && user) return ROLE_HOME[user.role] ?? href;
    return href;
  };

  const filteredItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const isActive = (href: string, exact?: boolean) => {
    const resolved = resolveHref(href);
    if (exact) return pathname === resolved;
    if (href === '/dashboard') {
      const home = user ? ROLE_HOME[user.role] : '/dashboard';
      return pathname === home || pathname === '/dashboard';
    }
    return pathname === resolved || pathname.startsWith(resolved + '/');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#00373E]/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 h-full z-50 transition-all duration-300 flex flex-col',
          'bg-white dark:bg-[#0a0a0a] border-e border-[#E8E8E8] dark:border-white/10',
          isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full'),
          isRTL ? 'right-0' : 'left-0',
          sidebarCollapsed ? 'w-20' : 'w-64',
          'lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E8E8E8] dark:border-white/10">
          {!sidebarCollapsed && (
            <Link href={user ? (ROLE_HOME[user.role] ?? '/dashboard') : '/dashboard'} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00373E] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">م</span>
              </div>
              <div>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">مفصل</span>
                <p className="text-[10px] text-neutral-400 -mt-0.5">ERP</p>
              </div>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-[#00373E] flex items-center justify-center mx-auto">
              <span className="text-white font-semibold text-sm">م</span>
            </div>
          )}
          <button
            onClick={toggleSidebarCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 transition-colors"
          >
            {sidebarCollapsed ? (
              isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />
            ) : (
              isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
            )}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {filteredItems.map((item) => {
            const href = resolveHref(item.href);
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={href}
                onClick={onClose}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 text-right group relative',
                  active
                    ? 'bg-[#FAFAFA] dark:bg-white/10 text-[#0A0A0A] dark:text-white font-medium'
                    : 'text-neutral-500 hover:bg-[#FAFAFA] dark:hover:bg-white/5 hover:text-[#0A0A0A] dark:hover:text-white',
                  sidebarCollapsed && 'justify-center px-0'
                )}
                title={sidebarCollapsed ? item.labelAr : undefined}
              >
                {/* Active indicator bar */}
                {active && (
                  <div
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#00373E]',
                      isRTL ? '-right-0' : '-left-0'
                    )}
                  />
                )}

                <span className={cn(
                  'flex-shrink-0 transition-colors duration-200',
                  active ? 'text-[#00373E] dark:text-white' : 'text-neutral-400 group-hover:text-neutral-600'
                )}>
                  {item.icon}
                </span>

                {/* Label */}
                {!sidebarCollapsed && (
                  <span className={cn(
                    'flex-1 text-sm transition-colors duration-200',
                    active ? 'text-[#0A0A0A] dark:text-white' : 'text-neutral-600 dark:text-neutral-400'
                  )}>
                    {item.labelAr}
                  </span>
                )}

                {/* Badge */}
                {!sidebarCollapsed && item.badge && (
                  <span className="bg-[#0A0A0A] text-white text-xs rounded-full px-2 py-0.5 font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E8E8] dark:border-white/10">
          {!sidebarCollapsed && user && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-[#00373E] flex items-center justify-center text-white text-sm font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0A0A0A] dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-neutral-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-neutral-500 hover:bg-[#FAFAFA] dark:hover:bg-white/5 transition-all text-sm mb-1',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {!sidebarCollapsed && <span>{theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-neutral-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all text-sm',
              sidebarCollapsed && 'justify-center px-0'
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
