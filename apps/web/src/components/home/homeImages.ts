/** مسارات الوسائط الثابتة للصفحة الرئيسية — لا تُستبدل بصور خارجية */
export const HOME_MEDIA = {
  heroVideo: '/videos/fashion.mp4',
  lookbookImage: (index: number) => `/images/fashion/model-${index + 1}.jpg`,
} as const;

/** صور محلية للمكونات الاختيارية (HomeCategories / HomeCraftsmanship) */
export const HOME_IMAGES = {
  hero: '/images/hero-thobe.jpg',
  heroSlides: [
    '/images/hero-thobe.jpg',
    '/images/thobe-black.jpg',
    '/images/thobe-senior.jpg',
  ],
  tailoring: '/images/tailor-shop.jpg',
  fabric: '/images/thobe-looking-up.jpg',
  craftsmanship: '/images/workshop.jpg',
  whiteFabric: '/images/hero-thobe.jpg',
  shops: '/images/thobe-casual.jpg',
  products: [
    '/images/hero-thobe.jpg',
    '/images/thobe-black.jpg',
    '/images/thobe-grey.jpg',
    '/images/thobe-blue.jpg',
  ],
} as const;
