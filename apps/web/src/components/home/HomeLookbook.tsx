'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import { FASHION_MODELS } from './homeData';
import { HOME_MEDIA } from './homeImages';

interface HomeLookbookProps {
  isRTL: boolean;
}

export function HomeLookbook({ isRTL }: HomeLookbookProps) {
  const { lookbook } = siteConfig;

  return (
    <section
      className="py-20 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#060d0e 0%,#001a1d 50%,#060d0e 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold-400 text-xs font-semibold tracking-[0.4em] uppercase mb-3">
            {lookbook.badge}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
            {isRTL ? lookbook.titleAr : lookbook.titleEn}
          </h2>
          <p className="text-gray-400 text-lg">
            {isRTL ? lookbook.subtitleAr : lookbook.subtitleEn}
          </p>
        </div>

        <div className="[column-count:2] md:[column-count:4] [column-gap:12px]">
          {FASHION_MODELS.map((model, i) => (
            <div key={i} className="mb-3 break-inside-avoid">
              <div className={`relative overflow-hidden rounded-2xl group cursor-pointer ${model.h}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${model.grad}`} />
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg,#ffffff11 0,#ffffff11 1px,transparent 0,transparent 50%)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <img
                  src={HOME_MEDIA.lookbookImage(i)}
                  alt={model.titleAr}
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/60 text-xs font-bold">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-gold-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                    {isRTL ? 'اطلب الآن' : 'Order Now'}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-black text-sm">
                    {isRTL ? model.titleAr : model.titleEn}
                  </p>
                  <p className="text-gold-400 text-xs mt-0.5">
                    {isRTL ? model.tagAr : model.tagEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/shops"
            className="inline-flex items-center gap-2 border border-gold-400/50 text-gold-400 hover:bg-gold-400 hover:text-gray-900 font-semibold px-8 py-3.5 rounded-2xl transition-all duration-300"
          >
            <Sparkles size={18} />
            {isRTL ? lookbook.browseAr : lookbook.browseEn}
          </Link>
        </div>
      </div>
    </section>
  );
}
