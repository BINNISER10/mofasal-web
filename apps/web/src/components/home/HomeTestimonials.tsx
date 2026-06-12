'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from './homeData';

interface HomeTestimonialsProps {
  isRTL: boolean;
}

export function HomeTestimonials({ isRTL }: HomeTestimonialsProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = TESTIMONIALS[active];

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">
            {isRTL ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
          </h2>
          <p className="section-subtitle">
            {isRTL ? 'آراء حقيقية من عملاء موثوقين' : 'Real reviews from verified customers'}
          </p>
        </div>

        <div className="relative">
          <div className="card-mufasal p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-6 right-8 text-primary-100 dark:text-primary-900">
              <Quote size={64} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 font-medium">
                &ldquo;{isRTL ? current.textAr : current.textEn}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                  {current.avatar}
                </div>
                <div className="text-right rtl:text-right ltr:text-left">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {isRTL ? current.nameAr : current.nameEn}
                  </p>
                  <p className="text-sm text-accent-500">
                    {isRTL ? current.roleAr : current.roleEn}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? 'w-8 bg-primary-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActive((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-8 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-50 transition-colors"
          >
            {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setActive((active + 1) % TESTIMONIALS.length)}
            className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-8 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-50 transition-colors"
          >
            {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          </button>
        </div>
      </div>
    </section>
  );
}
