'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/lib/stores/appStore';
import siteConfig from '@/data/site-config.json';

export function Footer() {
  const { isRTL } = useAppStore();
  const { footer } = siteConfig;
  const year = new Date().getFullYear();

  const columns = [
    {
      title: isRTL ? 'تصفح' : 'Explore',
      links: [
        { label: isRTL ? 'الرئيسية' : 'Home', href: '/' },
        { label: isRTL ? 'المتاجر' : 'Shops', href: '/shops' },
        { label: isRTL ? 'الأقمشة' : 'Fabrics', href: '/marketplace' },
      ],
    },
    {
      title: isRTL ? 'الحساب' : 'Account',
      links: [
        { label: isRTL ? 'دخول' : 'Login', href: '/login' },
        { label: isRTL ? 'طلباتي' : 'Orders', href: '/dashboard/customer/orders' },
        { label: isRTL ? 'مقاساتي' : 'Measurements', href: '/dashboard/customer/measurements' },
      ],
    },
    {
      title: isRTL ? 'الدعم' : 'Support',
      links: [
        { label: isRTL ? 'تواصل' : 'Contact', href: '/contact' },
        { label: isRTL ? 'الخصوصية' : 'Privacy', href: '/privacy' },
        { label: isRTL ? 'الشروط' : 'Terms', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="bg-[#0A0A0A] text-neutral-400">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <Image src="/images/logo.svg" alt="مفصل" width={28} height={28} className="invert" />
              <span className="font-semibold text-white text-lg">مفصل</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              {isRTL ? footer.taglineAr : footer.taglineEn}
            </p>
            <p className="text-xs text-neutral-500">
              {footer.phone} · {footer.email}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-xs text-neutral-500">
          <span>
            © {year} {isRTL ? 'مفصل. جميع الحقوق محفوظة.' : 'MUFASAL. All rights reserved.'}
          </span>
          <span>{isRTL ? footer.locationAr : footer.locationEn}</span>
        </div>
      </div>
    </footer>
  );
}
