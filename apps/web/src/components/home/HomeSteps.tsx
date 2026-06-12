'use client';

import { CheckCircle2, Ruler, Scissors } from 'lucide-react';
import type { ReactNode } from 'react';
import siteConfig from '@/data/site-config.json';

interface HomeStepsProps {
  isRTL: boolean;
}

const STEP_ICONS: ReactNode[] = [
  <Ruler size={28} key="ruler" />,
  <Scissors size={28} key="scissors" />,
  <CheckCircle2 size={28} key="check" />,
];

export function HomeSteps({ isRTL }: HomeStepsProps) {
  const { howItWorks } = siteConfig;

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-cream-100 dark:from-primary-950/50 dark:via-slate-900 dark:to-slate-900" />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass-teal text-primary-700 dark:text-primary-300 text-xs font-semibold mb-3">
            {isRTL ? '✦ خطوات بسيطة' : '✦ Simple Steps'}
          </span>
          <h2 className="section-title">{isRTL ? howItWorks.titleAr : howItWorks.titleEn}</h2>
          <p className="section-subtitle">
            {isRTL ? howItWorks.subtitleAr : howItWorks.subtitleEn}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 right-[16.5%] left-[16.5%] h-0.5 bg-gradient-to-l from-primary-200 via-accent-200 to-primary-200 dark:from-primary-800 dark:via-accent-700 dark:to-primary-800" />
          {howItWorks.steps.map((step, i) => (
            <div
              key={i}
              className="glass group relative text-center pt-14 pb-8 px-6 hover:border-primary-300/40 dark:hover:border-primary-500/30"
            >
              <div className="absolute -top-7 right-1/2 translate-x-1/2 w-14 h-14 rounded-2xl bg-gradient-primary shadow-lg shadow-primary-500/30 flex items-center justify-center text-white font-black text-lg glow-teal">
                {isRTL ? step.numAr : step.numEn}
              </div>
              <div className="w-16 h-16 rounded-2xl bg-accent-100/60 dark:bg-accent-900/30 text-accent-600 dark:text-accent-300 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                {STEP_ICONS[i]}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {isRTL ? step.titleAr : step.titleEn}
              </h3>
              <p className="text-sm text-accent-500 dark:text-accent-300 leading-relaxed">
                {isRTL ? step.descAr : step.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
