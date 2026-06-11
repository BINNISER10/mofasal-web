'use client';
import React, { useState } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAppStore } from '@/lib/stores/appStore';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'كيف أبحث عن خياط مناسب؟',
    qEn: 'How do I find a suitable tailor?',
    a: 'يمكنك تصفح قائمة المتاجر من خلال صفحة "المتاجر"، وتصفية النتائج حسب المدينة أو التخصص أو التقييم.',
    aEn: 'Browse the shops page and filter by city, specialty, or rating to find the best tailor for your needs.',
  },
  {
    q: 'كيف أطلب خدمة تفصيل؟',
    qEn: 'How do I place a tailoring order?',
    a: 'بعد اختيار المتجر، اضغط على "إنشاء طلب" واتبع الخطوات لتحديد الخدمة والمقاسات والقماش.',
    aEn: 'After selecting a shop, click "Create Order" and follow the steps to choose your service, measurements, and fabric.',
  },
  {
    q: 'هل يمكنني تتبع حالة طلبي؟',
    qEn: 'Can I track my order status?',
    a: 'نعم، من خلال لوحة التحكم يمكنك متابعة حالة طلبك عبر 9 مراحل تفصيلية.',
    aEn: 'Yes, through your dashboard you can track your order through 9 detailed stages.',
  },
  {
    q: 'ما طرق الدفع المتاحة؟',
    qEn: 'What payment methods are available?',
    a: 'نقبل بطاقات الائتمان والخصم، وApple Pay، وSTC Pay، وMada.',
    aEn: 'We accept credit/debit cards, Apple Pay, STC Pay, and Mada.',
  },
  {
    q: 'كيف أضيف مقاساتي؟',
    qEn: 'How do I add my measurements?',
    a: 'من لوحة التحكم اختر "مقاساتي" لإضافة وحفظ مقاساتك الشخصية.',
    aEn: 'From your dashboard, select "My Measurements" to add and save your personal measurements.',
  },
  {
    q: 'هل يمكنني إلغاء الطلب؟',
    qEn: 'Can I cancel my order?',
    a: 'يمكن إلغاء الطلب قبل بدء التنفيذ. بعد بدء العمل تطبق سياسة الإلغاء الخاصة بكل متجر.',
    aEn: 'Orders can be cancelled before work begins. After work starts, each shop\'s cancellation policy applies.',
  },
];

export default function FaqPage() {
  const { isRTL } = useAppStore();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={32} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-gray-500">{isRTL ? 'إجابات على أكثر الأسئلة شيوعاً' : 'Answers to the most common questions'}</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right"
              >
                <span className="font-semibold text-gray-800 text-sm">{isRTL ? faq.q : faq.qEn}</span>
                {open === i ? <ChevronUp size={18} className="text-primary-500 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {isRTL ? faq.a : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
