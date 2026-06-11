'use client';

import Image from 'next/image';
import { Search, X } from 'lucide-react';

interface PageHeroProps {
  isRTL: boolean;
  title: string;
  subtitle: string;
  image?: string;
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
}

export function PageHero({
  isRTL,
  title,
  subtitle,
  image,
  search,
  onSearchChange,
  searchPlaceholder,
}: PageHeroProps) {
  return (
    <section className="pt-16 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-500 mb-4">
              مفصل · MUFASAL
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight leading-tight mb-4">
              {title}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-lg leading-relaxed max-w-lg mb-8">
              {subtitle}
            </p>

            {onSearchChange && (
              <div className="flex max-w-md items-center gap-2 rounded-full border border-[#E8E8E8] dark:border-white/15 bg-[#FAFAFA] dark:bg-white/5 px-4 py-2.5 focus-within:border-[#00373E]/40 transition-colors">
                <Search size={18} className="text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={search ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent text-sm text-[#0A0A0A] dark:text-white outline-none placeholder:text-neutral-400"
                />
                {search && (
                  <button type="button" onClick={() => onSearchChange('')} className="text-neutral-400 hover:text-neutral-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {image && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 hidden lg:block">
              <Image src={image} alt="" fill className="object-cover" sizes="50vw" priority />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
