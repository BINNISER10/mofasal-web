/** مسارات الوسائط الثابتة للصفحة الرئيسية — لا تُستبدل بصور خارجية */
export const HOME_MEDIA = {
  heroVideo: '/videos/fashion.mp4',
  lookbookImage: (index: number) => `/images/fashion/model-${index + 1}.jpg`,
} as const;

/** صور محلية — كل مفتاح = قسم في الصفحة الرئيسية */
export const HOME_IMAGES = {
  /** Hero — محذوف حالياً (خلفية متدرجة فقط) */
  hero: '/images/sections/hero.jpg',
  heroSlides: [
    '/images/sections/hero.jpg',
    '/images/thobe-black.jpg',
    '/images/thobe-senior.jpg',
  ],
  /** قسم الخدمات — بطاقة 1: تفصيل الثوب */
  tailoring: '/images/sections/category-tailoring.jpg',
  /** قسم الخدمات — بطاقة 2: سوق الأقمشة */
  fabric: '/images/sections/category-fabric.jpg',
  /** قسم الحرفية — صورة جانبية */
  craftsmanship: '/images/sections/craftsmanship.jpg',
  whiteFabric: '/images/sections/craftsmanship.jpg',
  /** صفحة المحلات — Hero */
  shops: '/images/sections/shops-hero.jpg',
  /** قسم المنتجات المختارة */
  products: [
    '/images/sections/product-1.jpg',
    '/images/sections/product-2.jpg',
    '/images/sections/product-3.jpg',
    '/images/sections/product-4.jpg',
  ],
} as const;
