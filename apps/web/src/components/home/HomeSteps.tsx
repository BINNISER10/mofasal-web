'use client';

import { Ruler, Scissors, Truck } from 'lucide-react';

interface HomeStepsProps {
  isRTL: boolean;
}

const steps = [
  {
    icon: Ruler,
    titleAr: 'اختر',
    titleEn: 'Choose',
    descAr: 'خياطك، الخدمة، والقماش — في شاشة واحدة',
    descEn: 'Your tailor, service, and fabric — one screen',
  },
  {
    icon: Scissors,
    titleAr: 'أكد',
    titleEn: 'Confirm',
    descAr: 'راجع التفاصيل والسعر وادفع بثقة',
    descEn: 'Review details, price, and pay securely',
  },
  {
    icon: Truck,
    titleAr: 'تابع',
    titleEn: 'Track',
    descAr: 'تتبع الطلب حتى يصل ثوبك لبابك',
    descEn: 'Track your order until delivery',
  },
] as const;

export function HomeSteps({ isRTL }: HomeStepsProps) {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="mb-12 text-center max-w-lg mx-auto">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-500 mb-3">
            {isRTL ? 'ثلاث خطوات' : 'Three Steps'}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
            {isRTL ? 'بسيط مثل طلب الطعام' : 'Simple as Ordering Food'}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-12 max-w-4xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="text-center">
                <span className="text-xs font-medium text-neutral-400 mb-4 block">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-12 h-12 rounded-full border border-[#E8E8E8] dark:border-white/15 flex items-center justify-center mx-auto mb-4 text-[#00373E] dark:text-white">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-medium text-[#0A0A0A] dark:text-white mb-2">
                  {isRTL ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
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
