'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/stores/appStore';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Globe,
  User,
  ChevronDown,
  MapPin,
  Menu,
  Store,
  Package,
  Sun,
  Moon,
} from 'lucide-react';

export function Navbar() {
  const { language, setLanguage, isRTL, toggleSidebar, theme, toggleTheme } = useAppStore();
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
        scrolled
          ? 'glass-nav-light dark:glass-nav'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
          >
            <Menu size={22} className={scrolled ? 'text-primary-700 dark:text-primary-300' : 'text-white'} />
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all glow-teal">
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <span className={cn(
              'font-bold text-lg hidden sm:block transition-colors',
              scrolled ? 'text-primary-700 dark:text-white' : 'text-white'
            )}>
              {isRTL ? 'مفصل' : 'MUFASAL'}
            </span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { href: '/shops', icon: <Store size={15} />, labelAr: 'المتاجر', labelEn: 'Shops' },
            { href: '/marketplace', icon: <Package size={15} />, labelAr: 'الأقمشة', labelEn: 'Fabrics' },
            { href: '/search', icon: <Search size={15} />, labelAr: 'البحث', labelEn: 'Search' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                scrolled
                  ? 'text-gray-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-white hover:bg-primary-50/80 dark:hover:bg-white/10'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              )}
            >
              {item.icon}
              <span>{isRTL ? item.labelAr : item.labelEn}</span>
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className={cn('absolute right-3 top-1/2 -translate-y-1/2', scrolled ? 'text-gray-400' : 'text-white/50')} size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              placeholder={isRTL ? 'ابحث...' : 'Search...'}
              className={cn(
                'w-full pr-9 pl-4 py-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-400/50',
                scrolled
                  ? 'border border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 dark:text-white placeholder-gray-400 dark:placeholder-white/30'
                  : 'border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/40 focus:bg-white/15'
              )}
            />
          </div>
        </div>

        {/* Location */}
        <div className={cn('hidden sm:flex items-center gap-1 text-sm transition-colors', scrolled ? 'text-gray-500 dark:text-slate-400' : 'text-white/70')}>
          <MapPin size={14} className={scrolled ? 'text-primary-500' : 'text-gold-300'} />
          <span className="text-xs">{isRTL ? 'الرياض' : 'Riyadh'}</span>
          <ChevronDown size={12} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/dashboard/notifications"
            className={cn(
              'relative p-2 rounded-xl transition-colors',
              scrolled ? 'hover:bg-gray-100 dark:hover:bg-white/10' : 'hover:bg-white/15'
            )}
          >
            <Bell size={19} className={scrolled ? 'text-gray-600 dark:text-slate-300' : 'text-white/80'} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white/50" />
          </Link>

          <button
            onClick={toggleTheme}
            className={cn(
              'p-2 rounded-xl transition-all',
              scrolled ? 'hover:bg-gray-100 dark:hover:bg-white/10' : 'hover:bg-white/15'
            )}
            title={theme === 'dark' ? (isRTL ? 'الوضع الفاتح' : 'Light mode') : (isRTL ? 'الوضع الداكن' : 'Dark mode')}
          >
            {theme === 'dark'
              ? <Sun size={17} className="text-gold-400" />
              : <Moon size={17} className={scrolled ? 'text-primary-600' : 'text-white/80'} />
            }
          </button>

          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
              scrolled ? 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-slate-300' : 'hover:bg-white/15 text-white/80'
            )}
          >
            <Globe size={14} />
            {language === 'ar' ? 'EN' : 'AR'}
          </button>

          <Link
            href="/register"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hidden sm:flex',
              scrolled
                ? 'border border-primary-600 text-primary-600 dark:text-primary-300 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-white/10'
                : 'border border-white/30 text-white/90 hover:bg-white/10'
            )}
          >
            <span>{isRTL ? 'تسجيل' : 'Register'}</span>
          </Link>
          <Link
            href="/login"
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              scrolled
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
                : 'glass border border-white/25 text-white hover:bg-white/20 glow-teal'
            )}
          >
            <User size={15} />
            <span>{isRTL ? 'دخول' : 'Login'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
