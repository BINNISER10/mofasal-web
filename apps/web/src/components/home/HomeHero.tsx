'use client';

import {
  Award,
  CheckCircle2,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import siteConfig from '@/data/site-config.json';
import { HOME_MEDIA } from './homeImages';

interface HomeHeroProps {
  isRTL: boolean;
}

export function HomeHero({ isRTL }: HomeHeroProps) {
  const { hero } = siteConfig;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src={HOME_MEDIA.heroVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-r from-primary-950/96 via-primary-900/80 to-primary-800/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-primary-900/50" />
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full bg-gold-400 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-accent-300 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-28 md:py-36 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cream-300 px-4 py-2 rounded-full text-sm mb-6 border border-cream-400/20">
            <Sparkles size={13} className="text-gold-400" />
            <span>{hero.badge}</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            {isRTL ? hero.titleAr : hero.titleEn}
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
            {isRTL ? hero.subtitleAr : hero.subtitleEn}
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <Button href="/shops" variant="gold" size="lg">
              {isRTL ? hero.ctaPrimaryAr : hero.ctaPrimaryEn}
            </Button>
            <Button
              href="/marketplace"
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              {isRTL ? hero.ctaSecondaryAr : hero.ctaSecondaryEn}
            </Button>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {['م', 'أ', 'ف', 'س'].map((letter, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white/50 bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-md"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                +10,000 {isRTL ? 'عميل سعيد' : 'Happy Customers'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-white/60 text-xs mr-1">4.9/5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden md:block h-[420px]">
          <div className="absolute top-0 right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-56 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{isRTL ? 'طلب جديد' : 'New Order'}</p>
                <p className="text-white/50 text-xs">{isRTL ? 'قبل دقيقتين' : '2 min ago'}</p>
              </div>
            </div>
            <p className="text-white/80 text-xs">{isRTL ? 'بدلة رسمية — الرياض' : 'Formal Suit — Riyadh'}</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
            </div>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 left-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 w-48 shadow-2xl">
            <Zap size={20} className="text-yellow-400 mb-2" />
            <p className="text-3xl font-black text-white">500+</p>
            <p className="text-white/60 text-xs">{isRTL ? 'خياط موثوق' : 'Verified Tailors'}</p>
          </div>

          <div className="absolute bottom-0 right-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-52 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} className="text-amber-400" />
              <p className="text-white text-sm font-semibold">{isRTL ? 'تقييم الخياط' : 'Tailor Rating'}</p>
            </div>
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-white/60 text-xs">{isRTL ? 'خياط أحمد السيد' : 'Ahmad Al-Sayed'}</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1.5 h-3 bg-white/60 rounded-full" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--surface)] to-transparent" />
    </section>
  );
}
