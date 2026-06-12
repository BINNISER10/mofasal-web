'use client';

import { MapPin, ShieldCheck, Sparkles } from 'lucide-react';

interface HomeTrustProps {
  isRTL: boolean;
}

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    color: 'teal' as const,
    titleAr: 'جودة مضمونة',
    titleEn: 'Guaranteed Quality',
    descAr: 'نظام تقييم ثلاثي: المحل، الخياط، والمندوب. نضمن لك أفضل جودة.',
    descEn: 'Triple rating system: shop, tailor, and representative. Quality assured.',
  },
  {
    icon: MapPin,
    color: 'gold' as const,
    titleAr: 'توصيل أينما كنت',
    titleEn: 'Delivery Anywhere',
    descAr: 'نوصل طلبك أينما كنت في المملكة. اختر وقت ومكان التوصيل.',
    descEn: 'We deliver anywhere in the kingdom. Choose your preferred delivery time.',
  },
  {
    icon: Sparkles,
    color: 'red' as const,
    titleAr: 'تفصيل حسب الطلب',
    titleEn: 'Custom Tailoring',
    descAr: 'كل قطعة تفصل خصيصاً لك حسب مقاساتك وذوقك. فقط تفصيل راقي.',
    descEn: 'Every piece tailored to your exact measurements and taste. Premium only.',
  },
];

export function HomeTrust({ isRTL }: HomeTrustProps) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cream-50 to-white dark:from-slate-900 dark:to-slate-950" />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="section-title">
            {isRTL ? 'لماذا يثق بنا الآلاف؟' : 'Why Thousands Trust Us'}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`text-center p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${
                  item.color === 'teal'
                    ? 'glass-teal hover:shadow-xl hover:shadow-primary-500/10'
                    : item.color === 'gold'
                      ? 'glass-gold hover:shadow-xl hover:shadow-gold-500/15'
                      : 'bg-secondary-50/60 dark:bg-secondary-950/30 border-secondary-100 dark:border-secondary-900/40 hover:shadow-xl hover:shadow-secondary-500/10'
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
                    item.color === 'teal'
                      ? 'bg-primary-100/80 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300'
                      : item.color === 'gold'
                        ? 'bg-gold-100/80 dark:bg-gold-900/30 text-gold-600 dark:text-gold-300'
                        : 'bg-secondary-100/80 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-300'
                  }`}
                >
                  <Icon size={36} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {isRTL ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-accent-500 dark:text-accent-300 text-sm leading-relaxed">
                  {isRTL ? item.descAr : item.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
