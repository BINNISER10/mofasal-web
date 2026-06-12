/** صور محلية — كل مفتاح = قسم في الصفحة الرئيسية */
export const HOME_IMAGES = {
  /** Hero — الولد مع أبيه (دقلة بنية) */
  hero: '/images/sections/hero.png',
  heroSlides: [
    '/images/sections/hero.png',
    '/images/sections/category-tailoring.png',
    '/images/sections/product-2.png',
  ],
  /** قسم الخدمات — بطاقة 1: تفصيل الثوب (بشت فاخر) */
  tailoring: '/images/sections/category-tailoring.png',
  /** قسم الخدمات — بطاقة 2: سوق الأقمشة (شماغ/أقمشة) */
  fabric: '/images/sections/category-fabric.png',
  /** قسم الحرفية — تفاصيل خياطة الثوب الأبيض */
  craftsmanship: '/images/sections/craftsmanship.png',
  whiteFabric: '/images/sections/craftsmanship.png',
  /** صفحة المحلات — Hero */
  shops: '/images/sections/shops-hero.png',
  /** قسم المنتجات المختارة */
  products: [
    '/images/sections/product-1.png',
    '/images/sections/product-2.png',
    '/images/sections/product-3.png',
    '/images/sections/product-4.png',
  ],
} as const;

export const HOME_MEDIA = {
  heroVideo: '/videos/fashion.mp4',
  lookbookImage: (index: number) => `/images/fashion/model-${Math.min(index + 1, 5)}.png`,
} as const;
