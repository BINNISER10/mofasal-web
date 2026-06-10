'use client';

import { Ruler, Scissors, Truck } from 'lucide-react';
import { BRAND_COLORS } from '@mufasal/shared';

interface HomeStepsProps {
  isRTL: boolean;
}

const steps = [
  {
    icon: Ruler,
    titleAr: 'اختر الخياط والمقاس',
    titleEn: 'Choose Tailor & Size',
    descAr: 'تصفح ورش الخياطة المعتمدة وحدد موعد القياس في منزلك أو الورشة',
    descEn: 'Browse certified tailor shops and schedule measurement at home or in-shop',
  },
  {
    icon: Scissors,
    titleAr: 'اختر القماش وأكد',
    titleEn: 'Pick Fabric & Confirm',
    descAr: 'من سوق الأقمشة أو قماشك الخاص — تأكيد رقمي قبل بدء التفصيل',
    descEn: 'From our fabric market or your own — digital confirmation before tailoring begins',
  },
  {
    icon: Truck,
    titleAr: 'تابع واستلم',
    titleEn: 'Track & Receive',
    descAr: 'تتبع مراحل الخياطة خطوة بخطوة حتى يصل ثوبك لباب منزلك',
    descEn: 'Track every tailoring stage until your thobe arrives at your door',
  },
] as const;

export function HomeSteps({ isRTL }: HomeStepsProps) {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0d1517]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
            {isRTL ? 'كيف يعمل مفصل؟' : 'How MUFASAL Works'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {isRTL ? 'ثلاث خطوات للثوب المثالي' : 'Three steps to your perfect thobe'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: `${BRAND_COLORS.primary}12`, color: BRAND_COLORS.primary }}
                >
                  <Icon size={28} />
                </div>
                <span
                  className="inline-block text-xs font-black px-3 py-1 rounded-full mb-3"
                  style={{ backgroundColor: `${BRAND_COLORS.gold}22`, color: BRAND_COLORS.goldDark }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {isRTL ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {isRTL ? step.descAr : step.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
