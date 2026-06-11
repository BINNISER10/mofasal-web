'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/stores/appStore';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Globe,
  User,
  MapPin,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';

export function Navbar() {
  const { language, setLanguage, isRTL, toggleSidebar, theme, toggleTheme } = useAppStore();
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300',
        'bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md',
        scrolled ? 'border-b border-[#E8E8E8] dark:border-white/10 shadow-sm' : 'border-b border-transparent'
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} className="text-[#0A0A0A] dark:text-white" />
          </button>
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/images/logo.svg"
              alt="مفصل"
              width={32}
              height={32}
              className="dark:invert"
            />
            <span className="font-semibold text-base tracking-tight text-[#0A0A0A] dark:text-white hidden sm:block">
              {isRTL ? 'مفصل' : 'MUFASAL'}
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {[
            { href: '/shops', labelAr: 'المتاجر', labelEn: 'Shops' },
            { href: '/marketplace', labelAr: 'الأقمشة', labelEn: 'Fabrics' },
            { href: '/search', labelAr: 'البحث', labelEn: 'Search' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#3D3D3D] dark:text-neutral-300 hover:text-[#00373E] dark:hover:text-white transition-colors"
            >
              {isRTL ? item.labelAr : item.labelEn}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
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
              className="w-full pr-9 pl-4 py-2 rounded-full text-sm border border-[#E8E8E8] dark:border-white/10 bg-[#FAFAFA] dark:bg-white/5 text-[#0A0A0A] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#00373E]/40"
            />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          <MapPin size={13} />
          <span>{isRTL ? 'الرياض' : 'Riyadh'}</span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
          >
            <Bell size={18} className="text-[#3D3D3D] dark:text-neutral-300" />
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun size={17} className="text-neutral-400" />
              : <Moon size={17} className="text-[#3D3D3D]" />}
          </button>

          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-[#3D3D3D] dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10"
          >
            <Globe size={14} />
            {language === 'ar' ? 'EN' : 'AR'}
          </button>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[#00373E] text-white hover:bg-[#002F35] transition-colors"
          >
            <User size={15} />
            <span className="hidden sm:inline">{isRTL ? 'دخول' : 'Login'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
