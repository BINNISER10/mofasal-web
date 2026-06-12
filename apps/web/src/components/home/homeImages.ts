/**
 * صور الأقسام — مصدر الحقيقة (كل مسار = صورة فريدة، بدون تكرار)
 * @see apps/web/public/images/UNSPLASH-SOURCES.json
 */

export const HOME_IMAGES = {
  /** Hero — أب + ابن */
  hero: '/images/sections/hero.png',

  heroSlides: [
    '/images/sections/hero.png',
    '/images/sections/shops-hero.png',
    '/images/lomar/hero-banner-2.png',
  ],

  /** بطاقة: تفصيل الثوب */
  tailoring: '/images/sections/category-tailoring.png',

  /** بطاقة: سوق الأقمشة */
  fabric: '/images/sections/category-fabric.png',

  /** Hero صفحة السوق */
  marketplace: '/images/lomar/hero-banner-2.png',

  /** قسم الحرفية */
  craftsmanship: '/images/sections/craftsmanship.png',
  whiteFabric: '/images/sections/category-fabric.png',

  /** Hero صفحة المتاجر */
  shops: '/images/sections/shops-hero.png',

  /** معرض الورشة — 3 صور موجودة */
  workshop: [
    '/images/sections/workshop-needle.png',
    '/images/sections/workshop-sewing.png',
    '/images/workshop.jpg',
  ],

  /** معرض الأقمشة — الصور الموجودة فقط */
  fabrics: [
    '/images/sections/category-fabric.png',
    '/images/sections/product-1.png',
    '/images/sections/product-2.png',
    '/images/sections/product-3.png',
    '/images/sections/product-4.png',
  ],

  /** منتجات مختارة */
  products: [
    '/images/lomar/thobe-ready.webp',
    '/images/thobe-casual.jpg',
    '/images/lomar/product-3.jpg',
    '/images/lomar/product-4.jpg',
  ],
} as const;

/** Lookbook — fallback للصور الموجودة */
export const HOME_MEDIA = {
  heroVideo: '/videos/fashion.mp4',
  lookbookImage: (index: number) => {
    const existing = [
      '/images/thobe-black.jpg',
      '/images/thobe-blue.jpg',
      '/images/thobe-grey.jpg',
      '/images/thobe-modern.jpg',
      '/images/thobe-mosque.jpg',
      '/images/thobe-outdoor.jpg',
      '/images/thobe-senior.jpg',
      '/images/thobe-looking-up.jpg',
      '/images/hero-thobe.jpg',
      '/images/tailor-shop.jpg',
    ];
    return existing[index % existing.length] ?? existing[0];
  },
} as const;


