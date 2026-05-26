'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/stores/appStore';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Apple,
  Smartphone,
} from 'lucide-react';

export function Footer() {
  const { isRTL } = useAppStore();
  const currentYear = new Date().getFullYear();

  const links = [
    {
      title: isRTL ? 'روابط سريعة' : 'Quick Links',
      items: [
        { label: isRTL ? 'الرئيسية' : 'Home', href: '/' },
        { label: isRTL ? 'متاجر الخياطة' : 'Tailor Shops', href: '/shops' },
        { label: isRTL ? 'متجر الأقمشة' : 'Fabric Store', href: '/marketplace' },
        { label: isRTL ? 'كيف يعمل' : 'How It Works', href: '#how-it-works' },
      ],
    },
    {
      title: isRTL ? 'الدعم' : 'Support',
      items: [
        { label: isRTL ? 'الأسئلة الشائعة' : 'FAQ', href: '/faq' },
        { label: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy', href: '/privacy' },
        { label: isRTL ? 'الشروط والأحكام' : 'Terms & Conditions', href: '/terms' },
        { label: isRTL ? 'تواصل معنا' : 'Contact Us', href: '/contact' },
      ],
    },
    {
      title: isRTL ? 'حسابي' : 'My Account',
      items: [
        { label: isRTL ? 'تسجيل الدخول' : 'Login', href: '/login' },
        { label: isRTL ? 'إنشاء حساب' : 'Register', href: '/register' },
        { label: isRTL ? 'طلباتي' : 'My Orders', href: '/dashboard/customer/orders' },
        { label: isRTL ? 'مقاساتي' : 'My Measurements', href: '/dashboard/customer/measurements' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">م</span>
              </div>
              <div>
                <span className="text-white font-bold text-xl">مفصل</span>
                <p className="text-xs text-gray-400">MUFASAL</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-sm">
              {isRTL
                ? 'منصتك المتكاملة للخياطة الراقية وبيع الأقمشة. نوصل لك الخياط الماهر ونوفر أجود أنواع الأقمشة.'
                : 'Your complete platform for premium tailoring and fabric marketplace. Connecting you with skilled tailors and quality fabrics.'}
            </p>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-colors">
                <Apple size={20} />
                <div className="text-right">
                  <p className="text-xs text-gray-400">{isRTL ? 'حمل من' : 'Download on'}</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-colors">
                <Smartphone size={20} />
                <div className="text-right">
                  <p className="text-xs text-gray-400">{isRTL ? 'حمل من' : 'Get it on'}</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          {links.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-bold mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-gold-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors flex items-center gap-1.5">
                <Phone size={14} />
                <span dir="ltr">+966 55 123 4567</span>
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors flex items-center gap-1.5">
                <Mail size={14} />
                info@mufasal.com
              </a>
              <span className="hidden md:flex items-center gap-1.5">
                <MapPin size={14} />
                {isRTL ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: <Twitter size={18} />, href: '#' },
                { icon: <Instagram size={18} />, href: '#' },
                { icon: <Facebook size={18} />, href: '#' },
                { icon: <Youtube size={18} />, href: '#' },
                { icon: <Linkedin size={18} />, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gold-600 text-gray-400 hover:text-white flex items-center justify-center transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-gray-600">
            &copy; {currentYear} {isRTL ? 'جميع الحقوق محفوظة لمنصة مفصل' : 'MUFASAL. All rights reserved.'}
          </div>
        </div>
      </div>
    </footer>
  );
}
