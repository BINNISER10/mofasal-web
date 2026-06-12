'use client';

import siteConfig from '@/data/site-config.json';

interface HomeAppDownloadProps {
  isRTL: boolean;
}

export function HomeAppDownload({ isRTL }: HomeAppDownloadProps) {
  const { appDownload } = siteConfig;
  const hasStoreLinks =
    appDownload.appStoreUrl &&
    appDownload.playStoreUrl &&
    appDownload.appStoreUrl !== '#' &&
    appDownload.playStoreUrl !== '#';

  if (!hasStoreLinks) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-300 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          {isRTL ? appDownload.titleAr : appDownload.titleEn}
        </h2>
        <p className="text-lg text-surface-200 mb-8 max-w-xl mx-auto">
          {isRTL ? appDownload.subtitleAr : appDownload.subtitleEn}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={appDownload.appStoreUrl}
            className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-cream-100 transition-colors shadow-lg"
            rel="noopener noreferrer"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            App Store
          </a>
          <a
            href={appDownload.playStoreUrl}
            className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-cream-100 transition-colors shadow-lg"
            rel="noopener noreferrer"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
            </svg>
            Google Play
          </a>
        </div>
      </div>
    </section>
  );
}
