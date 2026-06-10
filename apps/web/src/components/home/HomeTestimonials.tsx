'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { BRAND_COLORS } from '@mufasal/shared';
import { HOME_IMAGES } from './homeImages';

interface HomeTestimonialsProps {
  isRTL: boolean;
}

const reviews = [
  {
    nameAr: 'أحمد الحريي',
    nameEn: 'Ahmad Al-Harbi',
    textAr: 'التشكيلة رائعة جدًا! جودة الأقمشة ممتازة والخياطة نظيفة. خدمة العملاء سريعة والمتابعة كانت أكثر من رائعة.',
    textEn: 'Amazing collection! Excellent fabric quality and clean tailoring. Fast customer service and outstanding follow-up.',
    image: HOME_IMAGES.products[0],
  },
  {
    nameAr: 'عبدالله الفهد',
    nameEn: 'Abdullah Al-Fahad',
    textAr: 'وصل طلبي قبل الموعد المتوقع، والتنسيق بين الألوان جميل جدًا. أنصح به لأي شخص يدور على كلاسيك بعصرية.',
    textEn: 'Order arrived before expected. Beautiful color coordination. Recommend for anyone seeking classic with modern touch.',
    image: HOME_IMAGES.products[1],
  },
  {
    nameAr: 'سعد حمدان الدوسري',
    nameEn: 'Saad Al-Dosari',
    textAr: 'التجربة كانت ممتازة، القمصان كلها بحجم مضبوط ومريحة. أكيد راح أكرر الطلب.',
    textEn: 'Excellent experience — perfect fit and comfortable. Will definitely order again.',
    image: HOME_IMAGES.products[3],
  },
] as const;

export function HomeTestimonials({ isRTL }: HomeTestimonialsProps) {
  return (
    <section className="py-16 md:py-20 bg-[#F5F5F5] dark:bg-[#0a1214]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            {isRTL ? 'آراء العملاء' : 'Customer Reviews'}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#111b1d] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={review.image}
                  alt={isRTL ? review.nameAr : review.nameEn}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill={BRAND_COLORS.gold} style={{ color: BRAND_COLORS.gold }} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  &ldquo;{isRTL ? review.textAr : review.textEn}&rdquo;
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  {isRTL ? review.nameAr : review.nameEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
