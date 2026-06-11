'use client';

import { ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface HomeTrustProps {
  isRTL: boolean;
}

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    titleAr: 'جودة مضمونة',
    titleEn: 'Guaranteed Quality',
    descAr: 'تقييم ثلاثي: المحل، الخياط، والمندوب.',
    descEn: 'Triple rating: shop, tailor, and representative.',
  },
  {
    icon: MapPin,
    titleAr: 'توصيل في المملكة',
    titleEn: 'Nationwide Delivery',
    descAr: 'نوصل طلبك أينما كنت.',
    descEn: 'We deliver across the Kingdom.',
  },
  {
    icon: Sparkles,
    titleAr: 'تفصيل حسب الطلب',
    titleEn: 'Made to Measure',
    descAr: 'كل ثوب لمقاساتك — رجال وأطفال.',
    descEn: 'Every thobe to your measurements.',
  },
] as const;

const CITIES = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الخبر', 'أبها', 'تبوك'];

export function HomeTrust({ isRTL }: HomeTrustProps) {
  return (
    <section className="py-16 md:py-20 bg-[#FAFAFA] dark:bg-[#111]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="text-center md:text-start">
                <Icon size={22} className="mx-auto md:mx-0 mb-3 text-[#00373E] dark:text-white" />
                <h3 className="font-medium text-[#0A0A0A] dark:text-white mb-1">
                  {isRTL ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {isRTL ? item.descAr : item.descEn}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {CITIES.map((city) => (
            <span
              key={city}
              className="text-xs px-3 py-1.5 rounded-full border border-[#E8E8E8] dark:border-white/10 text-neutral-600 dark:text-neutral-400"
            >
              {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
