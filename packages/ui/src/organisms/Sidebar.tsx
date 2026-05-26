import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export interface SidebarItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarUser {
  name: string;
  role: string;
  avatar?: string;
}

export interface SidebarProps {
  items: SidebarItem[];
  activeKey: string;
  onNavigate: (item: SidebarItem) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  user?: SidebarUser;
  className?: string;
  logo?: React.ReactNode;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeKey,
  onNavigate,
  collapsed = false,
  onToggle,
  user,
  className,
  logo,
  onLogout,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isActive = (item: SidebarItem) => {
    if (item.key === activeKey) return true;
    if (item.children) return item.children.some((c) => c.key === activeKey);
    return false;
  };

  const renderItem = (item: SidebarItem, depth = 0) => {
    const active = isActive(item);
    const expanded = expandedKeys.has(item.key);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.key}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.key);
            } else {
              onNavigate(item);
              setMobileOpen(false);
            }
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
            active && !hasChildren
              ? 'bg-[#00373E] text-white shadow-sm'
              : 'text-gray-600 hover:bg-[#D0E4E6] hover:text-[#00373E]',
            collapsed && !mobileOpen && 'justify-center px-2'
          )}
          title={collapsed && !mobileOpen ? item.label : undefined}
        >
          <span className="shrink-0">{item.icon}</span>
          {(!collapsed || mobileOpen) && (
            <>
              <span className="flex-1 text-left rtl:text-right">{item.label}</span>
              {hasChildren && (
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={16} />
                </motion.span>
              )}
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-[#D0E4E6] text-[#00373E]'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </button>
        {hasChildren && (!collapsed || mobileOpen) && (
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-[#D0E4E6] pl-2 rtl:ml-0 rtl:mr-6 rtl:border-r-2 rtl:border-l-0 rtl:pl-0 rtl:pr-2">
                  {item.children!.map((child) => renderItem(child, depth + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div
      className={cn(
        'flex flex-col h-full bg-white',
        collapsed && !mobileOpen ? 'w-16' : 'w-64',
        'transition-all duration-300'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-gray-100 px-4 py-4',
          collapsed && !mobileOpen && 'justify-center px-2'
        )}
      >
        {logo ? (
          logo
        ) : (
          <span
            className={cn(
              'font-bold text-[#00373E]',
              collapsed && !mobileOpen ? 'text-sm' : 'text-lg'
            )}
          >
            {collapsed && !mobileOpen ? 'M' : 'MUFASAL'}
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {items.map((item) => renderItem(item))}
      </nav>

      {/* User Profile */}
      {user && (!collapsed || mobileOpen) && (
        <div className="border-t border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#00373E] text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors rtl:flex-row-reverse"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-gray-100',
          collapsed ? 'w-16' : 'w-64',
          'transition-all duration-300',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-200"
        aria-label="Open menu"
      >
        <Menu size={22} className="text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 h-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full relative">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute -right-10 top-4 p-2 bg-white rounded-xl shadow-md"
                >
                  <X size={20} className="text-gray-700" />
                </button>
                {sidebarContent}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
