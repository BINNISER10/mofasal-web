'use client';

import { Star } from 'lucide-react';

interface HomeTestimonialsProps {
  isRTL: boolean;
}

const reviews = [
  {
    nameAr: 'أحمد الحربي',
    nameEn: 'Ahmad Al-Harbi',
    textAr: 'جودة القماش والخياطة ممتازة. التتبع كان واضح من البداية للنهاية.',
    textEn: 'Excellent fabric and tailoring. Clear tracking from start to finish.',
  },
  {
    nameAr: 'عبدالله الفهد',
    nameEn: 'Abdullah Al-Fahad',
    textAr: 'وصل الطلب قبل الموعد. المقاس مضبوط تماماً.',
    textEn: 'Arrived early. Perfect fit.',
  },
  {
    nameAr: 'سعد الدوسري',
    nameEn: 'Saad Al-Dosari',
    textAr: 'تجربة سهلة — ثلاث خطوات فعلاً.',
    textEn: 'Easy experience — truly three steps.',
  },
] as const;

export function HomeTestimonials({ isRTL }: HomeTestimonialsProps) {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a] border-t border-[#E8E8E8] dark:border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="mb-10">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-500 mb-3">
            {isRTL ? 'آراء العملاء' : 'Reviews'}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
            {isRTL ? 'ماذا يقول عملاؤنا' : 'What Customers Say'}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="p-6 md:p-8 rounded-2xl border border-[#E8E8E8] dark:border-white/10 bg-[#FAFAFA] dark:bg-[#111]"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="fill-[#B8963E] text-[#B8963E]" />
                ))}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                &ldquo;{isRTL ? review.textAr : review.textEn}&rdquo;
              </p>
              <p className="text-sm font-medium text-[#0A0A0A] dark:text-white">
                {isRTL ? review.nameAr : review.nameEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
